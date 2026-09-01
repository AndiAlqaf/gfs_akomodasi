<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=gfs_akomodasi;charset=utf8mb4', 'root', '');
// insert BABARINA-1 with ID 6
$stmt = $pdo->prepare("INSERT INTO meeting_rooms (id, room, building, capacity, booking_status, reserved_by, status, created_at, departement, participants, start_time, finish_time, additional_info) VALUES (6, 'BABARINA-1', 'OFFICE U', 50, 'OPEN', '-', 'Ready', NOW(), '-', 0, '-', '-', '')");
$stmt->execute();
echo "Inserted BABARINA-1 successfully.";
