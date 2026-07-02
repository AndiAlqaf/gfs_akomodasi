<?php
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Return rooms with their mess and area details
    try {
        $query = "
            SELECT r.*, m.mess_name, m.mess_id as mess_code, a.area_name
            FROM rooms r
            LEFT JOIN messes m ON r.mess_id = m.id
            LEFT JOIN areas a ON m.area_id = a.id
        ";
        
        // Optional filter by category
        if (isset($_GET['category']) && !empty($_GET['category'])) {
            $category = $_GET['category'];
            $query .= " WHERE r.room_allocation = :category AND r.room_status = 'READY'";
            $stmt = $pdo->prepare($query);
            $stmt->execute(['category' => $category]);
        } else {
            $stmt = $pdo->query($query);
        }
        
        $data = $stmt->fetchAll();
        echo json_encode(["data" => $data]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    // Update room status
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['action']) && $input['action'] === 'update_status') {
        try {
            $stmt = $pdo->prepare("UPDATE rooms SET room_status = ? WHERE id = ?");
            $stmt->execute([$input['status'], $input['id']]);
            echo json_encode(["success" => true]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
