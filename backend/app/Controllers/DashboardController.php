<?php

namespace App\Controllers;

use App\Core\Database;

class DashboardController
{
    public function index()
    {
        $stats = [];

        // 1. Room Stats
        $stats['totalRooms'] = (int) Database::fetchColumn("SELECT COUNT(*) FROM rooms");
        $stats['underRepair'] = (int) Database::fetchColumn("SELECT COUNT(*) FROM rooms WHERE room_status IN ('UNDER REPAIRED', 'OUT OF ORDER')");
        $stats['occupiedRooms'] = (int) Database::fetchColumn("SELECT COUNT(DISTINCT room_id) FROM reservations WHERE guest_status = 'ON SITE' AND room_id IS NOT NULL");
        $stats['availableRooms'] = max(0, $stats['totalRooms'] - $stats['occupiedRooms'] - $stats['underRepair']);

        // 2. Guests
        $stats['onSiteGuests'] = Database::fetchColumn("SELECT COUNT(*) FROM reservations WHERE guest_status = 'ON SITE'");

        // 3. Meals
        $dailyReq = Database::fetchColumn("SELECT SUM(no_of_packs) FROM meals_on_request WHERE DATE(date) = CURDATE() AND status = 'APPROVED'") ?: 0;
        $monthlyReq = Database::fetchColumn("SELECT SUM(no_of_packs) FROM meals_on_request WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE()) AND status = 'APPROVED'") ?: 0;

        $dailySch = $stats['onSiteGuests'] * 3;
        $daysInMonth = date('t');
        $monthlySch = $dailySch * $daysInMonth;

        $stats['mealsToday'] = $dailyReq + $dailySch;
        $stats['mealsMonthly'] = $monthlyReq + $monthlySch;

        $stats['mealsChart'] = [
            ["name" => "Daily", "Requests" => (int)$dailyReq, "Scheduled" => (int)$dailySch],
            ["name" => "Monthly", "Requests" => (int)$monthlyReq, "Scheduled" => (int)$monthlySch]
        ];

        // 4. Laundry
        $lDaily = Database::fetch("SELECT SUM(weight) as w, SUM(no_of_pcs_total) as pcs FROM laundry_transactions WHERE DATE(receiving_date) = CURDATE() OR DATE(created_at) = CURDATE()");
        $lMonthly = Database::fetch("SELECT SUM(weight) as w, SUM(no_of_pcs_total) as pcs FROM laundry_transactions WHERE MONTH(receiving_date) = MONTH(CURDATE()) OR MONTH(created_at) = MONTH(CURDATE())");

        $stats['laundryTodayWeight'] = floatval($lDaily['w'] ?: 0);
        $stats['laundryTodayPcs'] = intval($lDaily['pcs'] ?: 0);
        $stats['laundryMonthlyWeight'] = floatval($lMonthly['w'] ?: 0);
        $stats['laundryMonthlyPcs'] = intval($lMonthly['pcs'] ?: 0);

        $stats['laundryChart'] = [
            ["name" => "Today", "Weight (kg)" => $stats['laundryTodayWeight'], "Pieces" => $stats['laundryTodayPcs']],
            ["name" => "This Month", "Weight (kg)" => $stats['laundryMonthlyWeight'], "Pieces" => $stats['laundryMonthlyPcs']]
        ];

        jsonResponse(["data" => $stats]);
    }
}
