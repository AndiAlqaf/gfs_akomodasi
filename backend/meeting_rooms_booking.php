<?php
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $query = "SELECT * FROM meeting_room_bookings ORDER BY booking_date DESC, start_time DESC";
        $stmt = $pdo->query($query);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["data" => $data]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['action']) && $input['action'] === 'update_status') {
        try {
            $stmt = $pdo->prepare("UPDATE meeting_room_bookings SET action_status = ? WHERE id = ?");
            $stmt->execute([$input['status'], $input['id']]);
            echo json_encode(["success" => true]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } else {
        try {
            $stmt = $pdo->prepare("INSERT INTO meeting_room_bookings (booking_date, requested_by, department, meeting_room, participants, start_time, finish_time, additional_info, action_status, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['booking_date'],
                $input['requested_by'],
                $input['department'],
                $input['meeting_room'],
                $input['participants'],
                $input['start_time'],
                $input['finish_time'],
                $input['additional_info'],
                $input['action_status'],
                $input['remark']
            ]);
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
