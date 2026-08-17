<?php

namespace App\Models;

use App\Core\Database;

class RoomModel extends BaseModel
{
    protected $table = 'rooms';

    public function allWithMesses()
    {
        return \App\Core\Database::fetchAll('SELECT r.*, m.mess_name FROM rooms r LEFT JOIN messes m ON r.mess_id = m.id ORDER BY r.id ASC');
    }

    public function allWithDetails($category = null)
    {
        $query = "
            SELECT r.*, m.mess_name, m.mess_id as mess_code, a.area_name
            FROM {$this->table} r
            LEFT JOIN messes m ON r.mess_id = m.id
            LEFT JOIN areas a ON m.area_id = a.id
        ";

        if ($category) {
            $query .= " WHERE r.room_allocation = :category AND r.room_status = 'READY'";
            return Database::fetchAll($query, ['category' => $category]);
        }

        return Database::fetchAll($query);
    }

    public function updateStatus($id, $status)
    {
        $query = "UPDATE {$this->table} SET room_status = ? WHERE id = ?";
        return Database::execute($query, [$status, $id]);
    }
}
