<?php

namespace App\Controllers;

use App\Core\Database;

class DashboardController
{
    public function index()
    {
        $stats = [];
        $company = isset($_GET['company']) ? trim((string)$_GET['company']) : '';
        if (strtoupper($company) === 'ALL') {
            $company = '';
        }

        // 0. Distinct Institution / Company list from Guest Register
        $companyRows = Database::fetchAll("
            SELECT DISTINCT TRIM(institution_company) as company
            FROM guests
            WHERE institution_company IS NOT NULL
              AND TRIM(institution_company) != ''
              AND TRIM(COALESCE(name, '')) != ''
              AND UPPER(name) NOT LIKE 'VACANT%'
            ORDER BY company ASC
        ");
        $stats['companies'] = array_values(array_filter(array_map(function ($row) {
            return $row['company'] ?? '';
        }, $companyRows)));

        // 1. Room Stats
        $stats['totalRooms'] = (int) Database::fetchColumn("SELECT COUNT(*) FROM rooms");
        $stats['underRepair'] = (int) Database::fetchColumn("SELECT COUNT(*) FROM rooms WHERE room_status IN ('UNDER REPAIRED', 'OUT OF ORDER')");
        if ($company !== '') {
            $stats['occupiedRooms'] = (int) Database::fetchColumn(
                "SELECT COUNT(DISTINCT r.room_id)
                 FROM reservations r
                 JOIN guests g ON r.guest_id = g.id
                 WHERE r.guest_status = 'ON SITE'
                   AND r.room_id IS NOT NULL
                   AND UPPER(TRIM(g.institution_company)) = UPPER(TRIM(?))",
                [$company]
            );
        } else {
            $stats['occupiedRooms'] = (int) Database::fetchColumn("SELECT COUNT(DISTINCT room_id) FROM reservations WHERE guest_status = 'ON SITE' AND room_id IS NOT NULL");
        }
        $stats['availableRooms'] = max(0, $stats['totalRooms'] - $stats['occupiedRooms'] - $stats['underRepair']);

        // 2. Guests
        if ($company !== '') {
            $stats['onSiteGuests'] = (int) Database::fetchColumn(
                "SELECT COUNT(*)
                 FROM reservations r
                 JOIN guests g ON r.guest_id = g.id
                 WHERE r.guest_status = 'ON SITE'
                   AND UPPER(TRIM(g.institution_company)) = UPPER(TRIM(?))",
                [$company]
            );
        } else {
            $stats['onSiteGuests'] = (int) Database::fetchColumn("SELECT COUNT(*) FROM reservations WHERE guest_status = 'ON SITE'");
        }

        // 3. Meals
        if ($company !== '') {
            $dailyReq = Database::fetchColumn(
                "SELECT SUM(mor.no_of_packs)
                 FROM meals_on_request mor
                 WHERE DATE(mor.date) = CURDATE()
                   AND mor.status = 'APPROVED'
                   AND EXISTS (
                       SELECT 1 FROM guests g
                       WHERE UPPER(TRIM(g.name)) = UPPER(TRIM(mor.guest_name))
                         AND UPPER(TRIM(g.institution_company)) = UPPER(TRIM(?))
                   )",
                [$company]
            ) ?: 0;
            $monthlyReq = Database::fetchColumn(
                "SELECT SUM(mor.no_of_packs)
                 FROM meals_on_request mor
                 WHERE MONTH(mor.date) = MONTH(CURDATE())
                   AND YEAR(mor.date) = YEAR(CURDATE())
                   AND mor.status = 'APPROVED'
                   AND EXISTS (
                       SELECT 1 FROM guests g
                       WHERE UPPER(TRIM(g.name)) = UPPER(TRIM(mor.guest_name))
                         AND UPPER(TRIM(g.institution_company)) = UPPER(TRIM(?))
                   )",
                [$company]
            ) ?: 0;
        } else {
            $dailyReq = Database::fetchColumn("SELECT SUM(no_of_packs) FROM meals_on_request WHERE DATE(date) = CURDATE() AND status = 'APPROVED'") ?: 0;
            $monthlyReq = Database::fetchColumn("SELECT SUM(no_of_packs) FROM meals_on_request WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE()) AND status = 'APPROVED'") ?: 0;
        }

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
        if ($company !== '') {
            $lDaily = Database::fetch(
                "SELECT SUM(lt.weight) as w, SUM(lt.no_of_pcs_total) as pcs
                 FROM laundry_transactions lt
                 WHERE (DATE(lt.receiving_date) = CURDATE() OR DATE(lt.created_at) = CURDATE())
                   AND EXISTS (
                       SELECT 1 FROM guests g
                       WHERE UPPER(TRIM(g.name)) = UPPER(TRIM(lt.guest_name))
                         AND UPPER(TRIM(g.institution_company)) = UPPER(TRIM(?))
                   )",
                [$company]
            );
            $lMonthly = Database::fetch(
                "SELECT SUM(lt.weight) as w, SUM(lt.no_of_pcs_total) as pcs
                 FROM laundry_transactions lt
                 WHERE (MONTH(lt.receiving_date) = MONTH(CURDATE()) OR MONTH(lt.created_at) = MONTH(CURDATE()))
                   AND EXISTS (
                       SELECT 1 FROM guests g
                       WHERE UPPER(TRIM(g.name)) = UPPER(TRIM(lt.guest_name))
                         AND UPPER(TRIM(g.institution_company)) = UPPER(TRIM(?))
                   )",
                [$company]
            );
        } else {
            $lDaily = Database::fetch("SELECT SUM(weight) as w, SUM(no_of_pcs_total) as pcs FROM laundry_transactions WHERE DATE(receiving_date) = CURDATE() OR DATE(created_at) = CURDATE()");
            $lMonthly = Database::fetch("SELECT SUM(weight) as w, SUM(no_of_pcs_total) as pcs FROM laundry_transactions WHERE MONTH(receiving_date) = MONTH(CURDATE()) OR MONTH(created_at) = MONTH(CURDATE())");
        }

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
