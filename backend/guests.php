<?php
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM guests");
        $data = $stmt->fetchAll();
        echo json_encode(["data" => $data]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    try {
        $stmt = $pdo->prepare("INSERT INTO guests (name, occupants_category, job, institution_company) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $input['name'], 
            $input['occupants_category'] ?? 'REGULAR GUEST',
            $input['job'] ?? null,
            $input['institution_company'] ?? null
        ]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
