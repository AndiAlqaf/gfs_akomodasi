<?php
require 'db.php';
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS meeting_room_bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            booking_date VARCHAR(50),
            requested_by VARCHAR(100),
            department VARCHAR(100),
            meeting_room VARCHAR(100),
            participants INT,
            start_time VARCHAR(50),
            finish_time VARCHAR(50),
            additional_info TEXT,
            action_status VARCHAR(50),
            remark TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    echo "Table created successfully.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
