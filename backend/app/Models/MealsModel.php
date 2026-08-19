<?php

namespace App\Models;

use App\Core\Database;

class MealsModel extends BaseModel
{
    public function getSchedule()
    {
        $query = "
            SELECT 
                CURDATE() as date,
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
        return Database::fetchAll($query);
    }

    public function getRequests()
    {
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
        return Database::fetchAll($query);
    }

    public function getDeliveryPoints()
    {
        $query = "SELECT id, delivery_point FROM meals_dp ORDER BY delivery_point";
        return Database::fetchAll($query);
    }

    public function createRequest($data)
    {
        $query = "
            INSERT INTO meals_on_request 
            (date, guest_name, request_by, meals_package, delivery_point_id, meal_time, no_of_packs, remark, status) 
            VALUES (CURDATE(), ?, ?, ?, ?, ?, ?, ?, 'PENDING')
        ";
        return Database::execute($query, [
            $data['guest_name'],
            $data['request_by'],
            $data['meals_package'],
            $data['delivery_point_id'],
            $data['meal_time'],
            $data['no_of_packs'],
            $data['remark'] ?? ''
        ]);
    }

    public function approveRequest($id, $approvedBy)
    {
        $query = "
            UPDATE meals_on_request 
            SET status = 'APPROVED', approved_by = ? 
            WHERE id = ?
        ";
        return Database::execute($query, [$approvedBy, $id]);
    }
}
