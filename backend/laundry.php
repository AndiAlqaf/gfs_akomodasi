<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Parse JSON payload if exists
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    // Get all laundry items
    try {
        $stmt = $pdo->query("SELECT * FROM laundry_services ORDER BY created_at DESC");
        $data = $stmt->fetchAll();
        echo json_encode(["data" => $data]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    // Check if it's an update status action (we can use action param or just check if 'id' and 'status' are provided)
    if (isset($input['action']) && $input['action'] === 'update_status') {
        $id = $input['id'];
        $status = $input['status'];
        $weight = isset($input['weight']) ? $input['weight'] : null;

        try {
            if ($weight !== null) {
                $stmt = $pdo->prepare("UPDATE laundry_services SET status = ?, weight = ? WHERE id = ?");
                $stmt->execute([$status, $weight, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE laundry_services SET status = ? WHERE id = ?");
                $stmt->execute([$status, $id]);
            }
            echo json_encode(["success" => true]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } else {
        // Create new laundry item
        $id = time(); // Simple ID generation
        $roomNo = $input['roomNo'] ?? 'NEW';
        $guestName = $input['guestName'] ?? 'UNKNOWN';
        $laundryBagId = $input['laundryBagId'] ?? "$roomNo ($guestName)";
        $status = 'COLLECTED_DIRTY';

        try {
            $stmt = $pdo->prepare("INSERT INTO laundry_services (id, roomNo, guestName, laundryBagId, status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$id, $roomNo, $guestName, $laundryBagId, $status]);
            echo json_encode(["success" => true, "id" => $id]);
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
