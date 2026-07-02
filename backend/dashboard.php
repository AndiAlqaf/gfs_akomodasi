<?php
require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stats = [];

        // 1. Room Stats
        $stmt = $pdo->query("SELECT room_status, COUNT(*) as count FROM rooms GROUP BY room_status");
        $roomData = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $stats['totalRooms'] = 0;
        $stats['occupiedRooms'] = 0;
        $stats['availableRooms'] = 0;
        $stats['underRepair'] = 0;
        
        foreach ($roomData as $r) {
            $stats['totalRooms'] += $r['count'];
            if ($r['room_status'] === 'READY') {
                $stats['availableRooms'] += $r['count'];
            } elseif ($r['room_status'] === 'OCCUPIED' || $r['room_status'] === 'BOOKED') {
                $stats['occupiedRooms'] += $r['count'];
            } else {
                $stats['underRepair'] += $r['count'];
            }
        }

        // 2. Guests
        $stmt = $pdo->query("SELECT COUNT(*) FROM reservations WHERE guest_status = 'ON SITE'");
        $stats['onSiteGuests'] = $stmt->fetchColumn();

        // 3. Meals
        // Daily Requests
        $stmt = $pdo->query("SELECT SUM(no_of_packs) FROM meals_on_request WHERE DATE(date) = CURDATE() AND status = 'APPROVED'");
        $dailyReq = $stmt->fetchColumn() ?: 0;
        
        // Monthly Requests
        $stmt = $pdo->query("SELECT SUM(no_of_packs) FROM meals_on_request WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE()) AND status = 'APPROVED'");
        $monthlyReq = $stmt->fetchColumn() ?: 0;

        // Daily Scheduled (ON SITE guests * 3 meals)
        $dailySch = $stats['onSiteGuests'] * 3;
        // Monthly Scheduled Projection (Daily * days in month)
        $daysInMonth = date('t');
        $monthlySch = $dailySch * $daysInMonth;

        $stats['mealsToday'] = $dailyReq + $dailySch;
        $stats['mealsMonthly'] = $monthlyReq + $monthlySch;

        $stats['mealsChart'] = [
            ["name" => "Daily", "Requests" => (int)$dailyReq, "Scheduled" => (int)$dailySch],
            ["name" => "Monthly", "Requests" => (int)$monthlyReq, "Scheduled" => (int)$monthlySch]
        ];

        // 4. Laundry
        // Daily
        $stmt = $pdo->query("SELECT SUM(weight) as w, SUM(no_of_pcs_total) as pcs FROM laundry_transactions WHERE DATE(receiving_date) = CURDATE() OR DATE(created_at) = CURDATE()");
        $lDaily = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Monthly
        $stmt = $pdo->query("SELECT SUM(weight) as w, SUM(no_of_pcs_total) as pcs FROM laundry_transactions WHERE MONTH(receiving_date) = MONTH(CURDATE()) OR MONTH(created_at) = MONTH(CURDATE())");
        $lMonthly = $stmt->fetch(PDO::FETCH_ASSOC);

        $stats['laundryTodayWeight'] = floatval($lDaily['w'] ?: 0);
        $stats['laundryTodayPcs'] = intval($lDaily['pcs'] ?: 0);
        $stats['laundryMonthlyWeight'] = floatval($lMonthly['w'] ?: 0);
        $stats['laundryMonthlyPcs'] = intval($lMonthly['pcs'] ?: 0);

        $stats['laundryChart'] = [
            ["name" => "Today", "Weight (kg)" => $stats['laundryTodayWeight'], "Pieces" => $stats['laundryTodayPcs']],
            ["name" => "This Month", "Weight (kg)" => $stats['laundryMonthlyWeight'], "Pieces" => $stats['laundryMonthlyPcs']]
        ];

        echo json_encode(["data" => $stats]);

    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
