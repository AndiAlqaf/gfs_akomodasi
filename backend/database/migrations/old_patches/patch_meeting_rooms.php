<?php
require 'db.php';

try {
    $pdo->beginTransaction();

    // Create table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS meeting_rooms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date VARCHAR(50) DEFAULT '-',
            room VARCHAR(100) NOT NULL,
            building VARCHAR(100) NOT NULL,
            capacity INT NOT NULL,
            booking_status VARCHAR(50) DEFAULT 'OPEN',
            reserved_by VARCHAR(100) DEFAULT '-',
            status VARCHAR(50) DEFAULT '-',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // Check if table is empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM meeting_rooms");
    $count = $stmt->fetchColumn();

    if ($count == 0) {
        $insertStmt = $pdo->prepare("
            INSERT INTO meeting_rooms (date, room, building, capacity, booking_status, reserved_by, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $meetingRoomsData = [
            ['-', 'TAMBORASI', 'OFFICE U', 17, 'OPEN', '-', '-'],
            ['-', 'TJ. MALAHA-1', 'OFFICE U', 10, 'OPEN', '-', '-'],
            ['-', 'TJ. MALAHA-2', 'OFFICE U', 10, 'OPEN', '-', '-'],
            ['-', 'PROCESS PLANT', 'OFFICE U', 10, 'OPEN', '-', '-'],
            ['-', 'SUPPORTING', 'OFFICE U', 30, 'OPEN', '-', '-'],
            ['-', 'BABARINA-1', 'OFFICE U', 50, 'OPEN', '-', '-'],
            ['-', 'BABARINA-2', 'OFFICE U', 40, 'OPEN', '-', '-'],
            ['-', 'BABARINA-3', 'OFFICE U', 50, 'OPEN', '-', '-'],
            ['-', 'BABARINA-4', 'OFFICE U', 60, 'OPEN', '-', '-'],
        ];

        foreach ($meetingRoomsData as $room) {
            $insertStmt->execute($room);
        }
        echo "Table created and seeded successfully.\n";
    } else {
        echo "Table already exists and has data.\n";
    }

    $pdo->commit();
} catch (\PDOException $e) {
    $pdo->rollBack();
    echo "Database Error: " . $e->getMessage() . "\n";
}
?>
