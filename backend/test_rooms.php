<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/app/Core/helpers.php';
require_once __DIR__ . '/app/Core/Database.php';
use App\Core\Database;

try {
    $rooms = Database::fetchAll("SELECT room_no, room_allocation, room_status FROM rooms WHERE room_allocation != 'REGULAR GUEST'");
    print_r($rooms);
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
