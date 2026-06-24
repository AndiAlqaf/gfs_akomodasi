<?php
require __DIR__ . '/db.php';
$pdo->query("UPDATE rooms SET room_status = 'READY'");
$pdo->query("UPDATE rooms SET room_status = 'OCCUPIED' WHERE id IN (SELECT room_id FROM reservations WHERE guest_status = 'ON SITE')");
$pdo->query("UPDATE rooms SET room_status = 'BOOKED' WHERE id IN (SELECT room_id FROM reservations WHERE guest_status = 'SCHEDULED')");
echo "Done";
