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
                    COALESCE(res.check_in, res.check_out) as date,
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
                    res.remark as remarks
                FROM reservations res
                JOIN guests g ON res.guest_id = g.id
                JOIN rooms r ON res.room_id = r.id
                JOIN messes m ON r.mess_id = m.id
                JOIN areas a ON m.area_id = a.id
                WHERE res.guest_status = 'ON SITE' 
                   OR (res.guest_status = 'OFF SITE' AND g.occupants_category IN ('REGULAR GUEST', 'SPECIAL GUEST', 'EXECUTIVE/VIPs GUEST'))
                ORDER BY COALESCE(res.check_in, res.check_out) DESC
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

        } elseif ($type === 'meals') {
            // Aggregate meals for Meals Services Delivery Info
            
            // 1. Meals on Schedule (ON SITE guests)
            $scheduleQuery = "
                SELECT 
                    g.meals_packages,
                    g.breakfast_dp,
                    g.lunch_dp,
                    g.dinner_dp,
                    a.area_name as area
                FROM reservations res
                JOIN guests g ON res.guest_id = g.id
                JOIN rooms r ON res.room_id = r.id
                JOIN messes m ON r.mess_id = m.id
                JOIN areas a ON m.area_id = a.id
                WHERE res.guest_status = 'ON SITE'
            ";
            $scheduleStmt = $pdo->query($scheduleQuery);
            $scheduleData = $scheduleStmt->fetchAll(PDO::FETCH_ASSOC);

            // 2. Meals on Request (APPROVED requests)
            $requestQuery = "
                SELECT 
                    mor.meals_package as meals_packages,
                    mdp.delivery_point,
                    a.area_name as area,
                    mor.meal_time,
                    mor.no_of_packs
                FROM meals_on_request mor
                JOIN meals_dp mdp ON mor.delivery_point_id = mdp.id
                LEFT JOIN areas a ON mdp.area_id = a.id
                WHERE mor.status = 'APPROVED' AND mor.date = CURDATE()
            ";
            $requestStmt = $pdo->query($requestQuery);
            $requestData = $requestStmt->fetchAll(PDO::FETCH_ASSOC);

            // Grouping array
            $aggregated = [];

            // Helper to add to aggregated
            $addAggregated = function(&$agg, $package, $dp, $area, $meal_time, $packs, $status) {
                if (!$dp) return; // Skip if no delivery point
                $key = $dp . '|' . $package . '|' . $meal_time . '|' . $status;
                if (!isset($agg[$key])) {
                    $agg[$key] = [
                        'meals_packages' => $package,
                        'delivery_point' => $dp,
                        'area' => $area ?? '-',
                        'meal_time' => $meal_time,
                        'no_of_packs' => 0,
                        'accommodation_status' => $status
                    ];
                }
                $agg[$key]['no_of_packs'] += $packs;
            };

            // Process Schedule Data
            foreach ($scheduleData as $row) {
                $pkg = $row['meals_packages'];
                $area = $row['area'];
                if ($row['breakfast_dp']) $addAggregated($aggregated, $pkg, $row['breakfast_dp'], $area, 'BREAKFAST', 1, 'PROVIDED');
                if ($row['lunch_dp']) $addAggregated($aggregated, $pkg, $row['lunch_dp'], $area, 'LUNCH', 1, 'PROVIDED');
                if ($row['dinner_dp']) $addAggregated($aggregated, $pkg, $row['dinner_dp'], $area, 'DINNER', 1, 'PROVIDED');
            }

            // Process Request Data
            foreach ($requestData as $row) {
                $pkg = $row['meals_packages'];
                $area = $row['area'];
                $dp = $row['delivery_point'];
                $time = strtoupper($row['meal_time']);
                $packs = (int)$row['no_of_packs'];
                $addAggregated($aggregated, $pkg, $dp, $area, $time, $packs, 'NOT PROVIDED');
            }

            // Flatten and return
            $result = array_values($aggregated);
            echo json_encode(["data" => $result]);
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
