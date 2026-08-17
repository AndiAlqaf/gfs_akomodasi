<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/app/Core/helpers.php';
require_once __DIR__ . '/app/Core/Database.php';
require_once __DIR__ . '/app/Models/BaseModel.php';
require_once __DIR__ . '/app/Models/ReservationModel.php';

use App\Models\ReservationModel;
try {
    $m = new ReservationModel();
    $res = $m->getAllWithDetails();
    print_r(array_slice($res, 0, 5));
} catch (\Exception $e) {
    echo $e->getMessage();
}
