<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $type = $_GET['type'] ?? 'room';

    try {
        if ($type === 'room') {
            // INFORMATION_ROOM query
            $query = "
                SELECT 
                    r.id,
                    r.room_no as room,
                    m.mess_name as mess,
                    a.area_name as area,
                    g.name as guest_name,
                    r.room_allocation,
                    r.beds as beds_total,
                    IF(res.id IS NOT NULL, 1, 0) as beds_occupied,
                    IF(res.id IS NOT NULL, r.beds - 1, r.beds) as beds_vacant,
                    IF(res.id IS NOT NULL, 'FULL OCCUPIED', 'VACANT') as status,
                    r.room_status as remark
                FROM rooms r
                LEFT JOIN messes m ON r.mess_id = m.id
                LEFT JOIN areas a ON m.area_id = a.id
                LEFT JOIN reservations res ON res.room_id = r.id AND res.guest_status = 'ON SITE'
                LEFT JOIN guests g ON res.guest_id = g.id
                ORDER BY r.room_no
            ";
            $stmt = $pdo->query($query);
            $data = $stmt->fetchAll();
            echo json_encode(["data" => $data]);
            
        } elseif ($type === 'pob') {
            // INFORMATION_PERSON_ON_BOARD query
            // Including ON SITE and SCHEDULED as per the screenshot (though screenshot says boarding status ON BOARD / OFF BOARD)
            $query = "
                SELECT 
                    res.check_in as date,
                    r.room_no,
                    m.mess_name as mess,
                    a.area_name as area,
                    g.name,
                    g.reg_id_card,
                    g.job,
                    g.position,
                    g.level_category,
                    g.institution_company,
                    g.occupants_category,
                    res.guest_status as boarding_status,
                    res.remarks
                FROM reservations res
                JOIN guests g ON res.guest_id = g.id
                JOIN rooms r ON res.room_id = r.id
                JOIN messes m ON r.mess_id = m.id
                JOIN areas a ON m.area_id = a.id
                WHERE res.guest_status IN ('ON SITE', 'OFF SITE')
                ORDER BY res.check_in DESC
            ";
            $stmt = $pdo->query($query);
            $data = $stmt->fetchAll();
            
            // Map ON SITE to ON BOARD, OFF SITE to OFF BOARD just to match screenshot
            $mappedData = array_map(function($row) {
                if ($row['boarding_status'] === 'ON SITE') $row['boarding_status'] = 'ON BOARD';
                if ($row['boarding_status'] === 'OFF SITE') $row['boarding_status'] = 'OFF BOARD';
                return $row;
            }, $data);

            echo json_encode(["data" => $mappedData]);
        }
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
