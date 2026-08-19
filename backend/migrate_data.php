<?php
require 'db.php';
try {
    $pdo->exec("
        INSERT INTO meeting_room_bookings (booking_date, requested_by, department, meeting_room, participants, start_time, finish_time, additional_info, action_status, created_at)
        SELECT date, reserved_by, departement, room, participants, start_time, finish_time, additional_info, status, created_at
        FROM meeting_rooms
        WHERE booking_status = 'BOOKED' OR status != '-'
    ");
    echo "Data migrated successfully.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
