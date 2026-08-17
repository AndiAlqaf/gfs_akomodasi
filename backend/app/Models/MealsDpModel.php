<?php
namespace App\Models;

class MealsDpModel extends BaseModel
{
    protected $table = 'meals_dp';

    public function allWithAreas()
    {
        return \App\Core\Database::fetchAll('SELECT m.*, a.area_name FROM meals_dp m LEFT JOIN areas a ON m.area_id = a.id ORDER BY m.id ASC');
    }
}
