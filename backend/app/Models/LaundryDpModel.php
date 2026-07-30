<?php
namespace App\Models;

class LaundryDpModel extends BaseModel
{
    protected $table = 'laundry_dp';

    public function allWithAreas()
    {
        return \App\Core\Database::fetchAll('SELECT l.*, a.area_name FROM laundry_dp l LEFT JOIN areas a ON l.area_id = a.id ORDER BY l.id ASC');
    }
}
