<?php
require_once __DIR__ . '/db.php';
use App\Models\ReservationModel;
use App\Core\Database;
require_once __DIR__ . '/app/Core/helpers.php';
require_once __DIR__ . '/app/Models/BaseModel.php';
require_once __DIR__ . '/app/Models/ReservationModel.php';
require_once __DIR__ . '/app/Core/Database.php';

try {
    $model = new ReservationModel();
    $data = [
        'guestName' => 'TEST_GUEST_123',
        'category' => 'SPECIAL GUEST',
        'room_id' => '1',
        'estimated_arrival' => '2026-08-07 15:00:00',
        'estimated_departure' => '2026-08-08 10:00:00'
    ];
    Database::beginTransaction();
    $model->createBooking($data);
    Database::commit();
    echo "SUCCESS\n";
    $latest = Database::fetch("SELECT * FROM reservations ORDER BY id DESC LIMIT 1");
    print_r($latest);
} catch (\Exception $e) {
    Database::rollBack();
    echo "ERROR: " . $e->getMessage() . "\n";
}
