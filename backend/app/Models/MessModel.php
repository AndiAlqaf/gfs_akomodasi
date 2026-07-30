<?php
namespace App\Models;

class MessModel extends BaseModel
{
    protected $table = 'messes';

    public function allWithAreas()
    {
        return \App\Core\Database::fetchAll('SELECT m.*, a.area_name FROM messes m LEFT JOIN areas a ON m.area_id = a.id ORDER BY m.id ASC');
    }
}
