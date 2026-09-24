<?php

namespace App\Controllers;

use App\Core\Database;

class InformationController
{
    public function index()
    {
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
                            GROUP_CONCAT(g.name SEPARATOR ', ') as guest_name,
                            r.room_allocation,
                            r.beds as beds_total,
                            COUNT(g.id) as beds_occupied,
                            GREATEST(r.beds - COUNT(g.id), 0) as beds_vacant,
                            CASE
                                WHEN COUNT(g.id) >= r.beds AND r.beds > 0 THEN 'FULL OCCUPIED'
                                WHEN COUNT(g.id) > 0 THEN 'PARTIAL OCCUPIED'
                                ELSE 'VACANT'
                            END as status,
                            r.room_status as remark
                        FROM rooms r
                        LEFT JOIN messes m ON r.mess_id = m.id
                        LEFT JOIN areas a ON m.area_id = a.id
                        LEFT JOIN guests g ON g.room_id = r.id AND TRIM(COALESCE(g.name, '')) != '' AND UPPER(g.name) NOT LIKE 'VACANT%'
                        GROUP BY r.id
                        ORDER BY r.room_no
                    ";
                    $data = Database::fetchAll($query);
                    jsonResponse(["data" => $data]);
                    
                } elseif ($type === 'pob') {
                    // INFORMATION_PERSON_ON_BOARD query
                    $query = "
                        SELECT 
                            COALESCE(DATE(res.check_in), DATE(g.last_registration), CURDATE()) as date,
                            DATE(res.check_out) as check_out_date,
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
                        /* Data remains so it can be filtered by date */
                        ORDER BY COALESCE(res.check_in, res.check_out) DESC
                    ";
                    $data = Database::fetchAll($query);
                    
                    // Map ON SITE to ON BOARD, OFF SITE to OFF BOARD just to match screenshot
                    $mappedData = array_map(function($row) {
                        if ($row['boarding_status'] === 'ON SITE') $row['boarding_status'] = 'ON BOARD';
                        if ($row['boarding_status'] === 'OFF SITE') $row['boarding_status'] = 'OFF BOARD';
                        return $row;
                    }, $data);

                    jsonResponse(["data" => $mappedData]);

                } elseif ($type === 'meals_delivery' || $type === 'meals_info') {
                    // Aggregate meals for Meals Services Delivery Info or Overall Info
                    $is_overall = ($type === 'meals_info');
                    
                    // 1. Meals on Schedule (ON SITE guests) - These are for today
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

                    // 2. Meals on Request (APPROVED requests)
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

                    // Grouping array
                    $aggregated = [];

                    // Helper to add to aggregated
                    $addAggregated = function(&$agg, $date, $package, $dp, $area, $meal_time, $packs, $status) {
                        if (!$dp) return; // Skip if no delivery point
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

                    // Process Schedule Data
                    foreach ($scheduleData as $row) {
                        $pkg = $row['meals_packages'];
                        $area = $row['area'];
                        $date = $row['date'];
                        if ($row['breakfast_dp']) $addAggregated($aggregated, $date, $pkg, $row['breakfast_dp'], $area, 'BREAKFAST', 1, 'PROVIDED');
                        if ($row['lunch_dp']) $addAggregated($aggregated, $date, $pkg, $row['lunch_dp'], $area, 'LUNCH', 1, 'PROVIDED');
                        if ($row['dinner_dp']) $addAggregated($aggregated, $date, $pkg, $row['dinner_dp'], $area, 'DINNER', 1, 'PROVIDED');
                    }

                    // Process Request Data
                    foreach ($requestData as $row) {
                        $pkg = $row['meals_packages'];
                        $area = $row['area'];
                        $dp = $row['delivery_point'];
                        $time = strtoupper($row['meal_time']);
                        $packs = (int)$row['no_of_packs'];
                        $date = $row['date'];
                        $addAggregated($aggregated, $date, $pkg, $dp, $area, $time, $packs, 'NOT PROVIDED');
                    }

                    // Flatten and return, optionally sorting by date desc
                    $result = array_values($aggregated);
                    usort($result, function($a, $b) {
                        return strtotime($b['date']) - strtotime($a['date']);
                    });
                    jsonResponse(["data" => $result]);
                } elseif ($type === 'meeting') {
                    // INFORMATION_MEETING_ROOMS query (Historical data from meeting_room_bookings + unbooked rooms)
                    $query = "
                        SELECT 
                            b.id,
                            COALESCE(NULLIF(b.booking_date, ''), '-') as date,
                            COALESCE(NULLIF(b.meeting_room, ''), m.room) as room,
                            COALESCE(NULLIF(m.building, ''), 'OFFICE U') as building,
                            COALESCE(m.capacity, '-') as capacity,
                            COALESCE(NULLIF(b.start_time, ''), '-') as start_time,
                            COALESCE(NULLIF(b.finish_time, ''), '-') as finish_time,
                            COALESCE(NULLIF(b.additional_info, ''), '-') as additional_info,
                            COALESCE(NULLIF(b.action_status, ''), 'OPEN') as booking_status,
                            COALESCE(NULLIF(b.requested_by, ''), '-') as reserved_by,
                            COALESCE(NULLIF(m.status, ''), '-') as status
                        FROM meeting_room_bookings b
                        LEFT JOIN meeting_rooms m ON UPPER(TRIM(b.meeting_room)) = UPPER(TRIM(m.room))
                        UNION ALL
                        SELECT 
                            NULL as id,
                            '-' as date,
                            m.room,
                            COALESCE(NULLIF(m.building, ''), 'OFFICE U') as building,
                            COALESCE(m.capacity, '-') as capacity,
                            '-' as start_time,
                            '-' as finish_time,
                            '-' as additional_info,
                            'OPEN' as booking_status,
                            '-' as reserved_by,
                            COALESCE(NULLIF(m.status, ''), '-') as status
                        FROM meeting_rooms m
                        WHERE NOT EXISTS (
                            SELECT 1 FROM meeting_room_bookings b2 
                            WHERE UPPER(TRIM(b2.meeting_room)) = UPPER(TRIM(m.room))
                        )
                        ORDER BY 
                            CASE WHEN date IS NOT NULL AND date != '-' THEN 0 ELSE 1 END,
                            date DESC,
                            start_time DESC,
                            room ASC
                    ";
                    $data = Database::fetchAll($query);
                    jsonResponse(["data" => $data]);
                }

            } catch (\PDOException $e) {
                http_response_code(500);
                jsonResponse(["error" => $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            jsonResponse(["error" => "Method not allowed"]);
        }
    }
}
