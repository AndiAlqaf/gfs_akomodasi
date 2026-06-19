<?php
require 'db.php';

try {
    // 1. Check if occupants_category exists in guests
    $stmt = $pdo->query("SHOW COLUMNS FROM guests LIKE 'occupants_category'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE guests ADD COLUMN occupants_category VARCHAR(100) AFTER name");
        echo "Added occupants_category to guests.\n";
    } else {
        echo "occupants_category already exists.\n";
    }

    // 2. Create reservations table if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS reservations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            guest_id INT,
            room_id INT,
            check_in DATETIME NULL,
            check_out DATETIME NULL,
            estimated_arrival DATETIME NULL,
            estimated_departure DATETIME NULL,
            guest_status VARCHAR(50),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
        )
    ");
    echo "Reservations table checked/created.\n";

    // 3. Create laundry_services table if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS laundry_services (
            id VARCHAR(50) PRIMARY KEY,
            roomNo VARCHAR(50),
            guestName VARCHAR(150),
            laundryBagId VARCHAR(100),
            weight DECIMAL(5,2) DEFAULT 0.00,
            status VARCHAR(50),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "Laundry_services table checked/created.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
