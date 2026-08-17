<?php
namespace App\Models;

class LaundryBagModel extends BaseModel
{
    protected $table = 'laundry_bag';

    public function allWithRooms()
    {
        return \App\Core\Database::fetchAll('SELECT l.*, r.room_no FROM laundry_bag l LEFT JOIN rooms r ON l.room_id = r.id ORDER BY l.id ASC');
    }
}
