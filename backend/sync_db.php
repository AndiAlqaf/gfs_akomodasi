<?php
require 'db.php';
try {
    $stmt = $pdo->query('SELECT * FROM meeting_room_bookings ORDER BY id ASC');
    foreach($stmt->fetchAll() as $row) {
        $updateStmt = $pdo->prepare('UPDATE meeting_rooms SET date=?, reserved_by=?, departement=?, participants=?, start_time=?, finish_time=?, additional_info=?, booking_status=\'BOOKED\', status=? WHERE room=?');
        $updateStmt->execute([
            $row['booking_date'],
            $row['requested_by'],
            $row['department'],
            $row['participants'],
            $row['start_time'],
            $row['finish_time'],
            $row['additional_info'],
            $row['action_status'],
            $row['meeting_room']
        ]);
    }
    echo "Synced!";
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
