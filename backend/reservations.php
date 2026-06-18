<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $query = "
            SELECT res.*, 
                   g.name as guestName, g.occupants_category, 
                   r.room_no as roomNo, 
                   m.mess_name as messName, 
                   a.area_name as area
            FROM reservations res
            LEFT JOIN guests g ON res.guest_id = g.id
            LEFT JOIN rooms r ON res.room_id = r.id
            LEFT JOIN messes m ON r.mess_id = m.id
            LEFT JOIN areas a ON m.area_id = a.id
            ORDER BY res.id DESC
        ";
        $stmt = $pdo->query($query);
        $data = $stmt->fetchAll();
        echo json_encode(["data" => $data]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['action']) && $input['action'] === 'update_status') {
        // Handle Check-In / Check-Out
        $id = $input['id'];
        $status = $input['status'];
        try {
            if ($status === 'ON SITE') {
                $stmt = $pdo->prepare("UPDATE reservations SET guest_status = ?, check_in = NOW() WHERE id = ?");
            } elseif ($status === 'OFF SITE') {
                $stmt = $pdo->prepare("UPDATE reservations SET guest_status = ?, check_out = NOW() WHERE id = ?");
                // Also free up the room
                // Find room id
                $rStmt = $pdo->prepare("SELECT room_id FROM reservations WHERE id = ?");
                $rStmt->execute([$id]);
                $roomId = $rStmt->fetchColumn();
                if ($roomId) {
                    $pdo->prepare("UPDATE rooms SET room_status = 'READY' WHERE id = ?")->execute([$roomId]);
                }
            } else {
                $stmt = $pdo->prepare("UPDATE reservations SET guest_status = ? WHERE id = ?");
            }
            $stmt->execute([$status, $id]);
            echo json_encode(["success" => true]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } else {
        // Create Booking
        try {
            $pdo->beginTransaction();
            // 1. Create or get Guest
            // Assuming new guest for simplicity if guest_id is not provided
            $guest_id = $input['guest_id'] ?? null;
            if (!$guest_id) {
                $gStmt = $pdo->prepare("INSERT INTO guests (name, occupants_category) VALUES (?, ?)");
                $gStmt->execute([$input['guestName'], $input['category']]);
                $guest_id = $pdo->lastInsertId();
            }

            // 2. Insert Reservation
            $stmt = $pdo->prepare("INSERT INTO reservations (guest_id, room_id, estimated_arrival, estimated_departure, guest_status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $guest_id,
                $input['room_id'],
                $input['estimated_arrival'],
                $input['estimated_departure'],
                'SCHEDULED'
            ]);

            // 3. Mark Room as booked (optional depending on logic, usually stays available until check-in or has a "BOOKED" status)
            // The requirements say Office Boy checks if room is ready. 
            // So we leave room status as is or update if needed.
            
            $pdo->commit();
            echo json_encode(["success" => true]);
        } catch (\PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
