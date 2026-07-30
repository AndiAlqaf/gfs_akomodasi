<?php

namespace App\Controllers;

use App\Core\Database;

class InformationController
{
    public function index()
    {
        $type = $_GET['type'] ?? 'room';

        if ($type === 'room') {
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
            jsonResponse(["data" => Database::fetchAll($query)]);
            
        } elseif ($type === 'pob') {
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
            $data = Database::fetchAll($query);
            
            $mappedData = array_map(function($row) {
                if ($row['boarding_status'] === 'ON SITE') $row['boarding_status'] = 'ON BOARD';
                if ($row['boarding_status'] === 'OFF SITE') $row['boarding_status'] = 'OFF BOARD';
                return $row;
            }, $data);

            jsonResponse(["data" => $mappedData]);

        } elseif ($type === 'meals_delivery' || $type === 'meals_info') {
            $is_overall = ($type === 'meals_info');
            
            $scheduleQuery = "
                SELECT 
                    CURDATE() as date,
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
            $scheduleData = Database::fetchAll($scheduleQuery);

            $requestQuery = "
                SELECT 
                    mor.date,
                    mor.meals_package as meals_packages,
                    mdp.delivery_point,
                    a.area_name as area,
                    mor.meal_time,
                    mor.no_of_packs
                FROM meals_on_request mor
                JOIN meals_dp mdp ON mor.delivery_point_id = mdp.id
                LEFT JOIN areas a ON mdp.area_id = a.id
                WHERE mor.status = 'APPROVED'
            ";
            if (!$is_overall) {
                $requestQuery .= " AND mor.date = CURDATE()";
            }
            $requestData = Database::fetchAll($requestQuery);

            $aggregated = [];
            $addAggregated = function(&$agg, $date, $package, $dp, $area, $meal_time, $packs, $status) {
                if (!$dp) return; 
                $key = $date . '|' . $dp . '|' . $package . '|' . $meal_time . '|' . $status;
                if (!isset($agg[$key])) {
                    $agg[$key] = [
                        'date' => $date,
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

            foreach ($scheduleData as $row) {
                $pkg = $row['meals_packages'];
                $area = $row['area'];
                $date = $row['date'];
                if ($row['breakfast_dp']) $addAggregated($aggregated, $date, $pkg, $row['breakfast_dp'], $area, 'BREAKFAST', 1, 'PROVIDED');
                if ($row['lunch_dp']) $addAggregated($aggregated, $date, $pkg, $row['lunch_dp'], $area, 'LUNCH', 1, 'PROVIDED');
                if ($row['dinner_dp']) $addAggregated($aggregated, $date, $pkg, $row['dinner_dp'], $area, 'DINNER', 1, 'PROVIDED');
            }

            foreach ($requestData as $row) {
                $pkg = $row['meals_packages'];
                $area = $row['area'];
                $dp = $row['delivery_point'];
                $time = strtoupper($row['meal_time']);
                $packs = (int)$row['no_of_packs'];
                $date = $row['date'];
                $addAggregated($aggregated, $date, $pkg, $dp, $area, $time, $packs, 'NOT PROVIDED');
            }

            $result = array_values($aggregated);
            usort($result, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });
            jsonResponse(["data" => $result]);

        } elseif ($type === 'meeting') {
            jsonResponse(["data" => Database::fetchAll("SELECT * FROM meeting_rooms ORDER BY id ASC")]);
        } else {
            jsonResponse(["error" => "Invalid type parameter"], 400);
        }
    }
}
