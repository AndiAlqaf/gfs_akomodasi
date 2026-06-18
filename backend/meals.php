<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        // Stats
        $statsQuery = "
            SELECT 
                SUM(breakfast) as breakfast,
                SUM(lunch) as lunch,
                SUM(dinner) as dinner,
                (SUM(breakfast) + SUM(lunch) + SUM(dinner)) as total
            FROM meals_requests 
            WHERE date = CURDATE()
        ";
        $statsStmt = $pdo->query($statsQuery);
        $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

        // Accommodated Meals Data
        $accommodatedQuery = "
            SELECT 
                mr.id,
                mr.date,
                mr.meals_package,
                mr.breakfast,
                mr.lunch,
                mr.dinner,
                mr.breakfast_packs,
                mr.lunch_packs,
                mr.dinner_packs,
                mr.status,
                mdp.point_name as delivery_point,
                r.room_no as roomNo,
                m.mess_name as mess,
                g.name as guestName
            FROM meals_requests mr
            JOIN meals_delivery_points mdp ON mr.delivery_point_id = mdp.id
            JOIN reservations res ON mr.reservation_id = res.id
            JOIN guests g ON res.guest_id = g.id
            JOIN rooms r ON res.room_id = r.id
            JOIN messes m ON r.mess_id = m.id
            WHERE mr.date = CURDATE() AND mr.guest_type = 'ACCOMMODATED'
            ORDER BY mr.id DESC
        ";
        $accommodatedStmt = $pdo->query($accommodatedQuery);
        $accommodatedData = $accommodatedStmt->fetchAll(PDO::FETCH_ASSOC);

        // Visitor Meals Data
        $visitorQuery = "
            SELECT 
                mr.id,
                mr.date,
                mr.visitor_name,
                mr.request_by,
                mr.approved_by,
                mr.meals_package,
                mr.breakfast,
                mr.lunch,
                mr.dinner,
                mr.breakfast_packs,
                mr.lunch_packs,
                mr.dinner_packs,
                mr.status,
                mdp.point_name as delivery_point
            FROM meals_requests mr
            JOIN meals_delivery_points mdp ON mr.delivery_point_id = mdp.id
            WHERE mr.date = CURDATE() AND mr.guest_type = 'VISITOR'
            ORDER BY mr.id DESC
        ";
        $visitorStmt = $pdo->query($visitorQuery);
        $visitorData = $visitorStmt->fetchAll(PDO::FETCH_ASSOC);


        echo json_encode([
            "stats" => [
                "breakfast" => $stats['breakfast'] ?? 0,
                "lunch" => $stats['lunch'] ?? 0,
                "dinner" => $stats['dinner'] ?? 0,
                "total" => $stats['total'] ?? 0
            ],
            "accommodatedData" => $accommodatedData,
            "visitorData" => $visitorData
        ]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['action']) && $input['action'] === 'update_status') {
        try {
            $stmt = $pdo->prepare("UPDATE meals_requests SET status = ? WHERE id = ?");
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
