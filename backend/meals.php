<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $type = $_GET['type'] ?? 'schedule';

    try {
        if ($type === 'schedule') {
            // Meals on Schedule
            $query = "
                SELECT 
                    r.room_no as room,
                    m.mess_name as mess,
                    g.name,
                    g.meals_packages,
                    g.breakfast_dp,
                    g.lunch_dp,
                    g.dinner_dp,
                    res.remark
                FROM reservations res
                JOIN guests g ON res.guest_id = g.id
                JOIN rooms r ON res.room_id = r.id
                JOIN messes m ON r.mess_id = m.id
                WHERE res.guest_status = 'ON SITE'
                ORDER BY r.room_no
            ";
            $stmt = $pdo->query($query);
            $scheduleData = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["data" => $scheduleData]);

        } elseif ($type === 'requests') {
            // Meals on Request
            $query = "
                SELECT 
                    mor.id,
                    mor.date,
                    mor.guest_name,
                    mor.request_by,
                    mor.approved_by,
                    mor.meals_package,
                    mdp.delivery_point,
                    mor.meal_time,
                    mor.no_of_packs,
                    mor.remark,
                    mor.status
                FROM meals_on_request mor
                LEFT JOIN meals_dp mdp ON mor.delivery_point_id = mdp.id
                ORDER BY mor.id DESC
            ";
            $stmt = $pdo->query($query);
            $requestsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["data" => $requestsData]);

        } elseif ($type === 'dp') {
            $stmt = $pdo->query("SELECT id, delivery_point FROM meals_dp ORDER BY delivery_point");
            echo json_encode(["data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid type parameter"]);
        }

    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['action'])) {
        try {
            if ($input['action'] === 'create_request') {
                $stmt = $pdo->prepare("
                    INSERT INTO meals_on_request 
                    (date, guest_name, request_by, meals_package, delivery_point_id, meal_time, no_of_packs, remark, status) 
                    VALUES (CURDATE(), ?, ?, ?, ?, ?, ?, ?, 'PENDING')
                ");
                $stmt->execute([
                    $input['guest_name'],
                    $input['request_by'],
                    $input['meals_package'],
                    $input['delivery_point_id'],
                    $input['meal_time'],
                    $input['no_of_packs'],
                    $input['remark'] ?? ''
                ]);
                echo json_encode(["success" => true]);
            } elseif ($input['action'] === 'approve_request') {
                $stmt = $pdo->prepare("
                    UPDATE meals_on_request 
                    SET status = 'APPROVED', approved_by = ? 
                    WHERE id = ?
                ");
                $stmt->execute([
                    $input['approved_by'],
                    $input['id']
                ]);
                echo json_encode(["success" => true]);
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Invalid action"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Action required"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
