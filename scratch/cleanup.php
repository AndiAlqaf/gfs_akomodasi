<?php
require_once __DIR__ . '/../backend/app/Core/Database.php';
require_once __DIR__ . '/../backend/db.php';

try {
    $count = \App\Core\Database::execute("DELETE FROM reservations WHERE guest_status = 'OFF SITE' AND check_in IS NULL");
    echo "Successfully deleted $count empty OFF SITE reservations.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
