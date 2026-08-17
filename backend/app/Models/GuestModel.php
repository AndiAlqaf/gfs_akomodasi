<?php
namespace App\Models;

class GuestModel extends BaseModel
{
    protected $table = 'guests';

    public function allWithRelations()
    {
        return \App\Core\Database::fetchAll('
            SELECT g.*, 
                   m.mess_name, 
                   r.room_no 
            FROM guests g 
            LEFT JOIN rooms r ON g.room_id = r.id 
            LEFT JOIN messes m ON r.mess_id = m.id 
            ORDER BY g.id ASC
        ');
    }
}
