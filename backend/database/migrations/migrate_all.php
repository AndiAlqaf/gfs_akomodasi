<?php
/**
 * MASTER DATABASE MIGRATION & SYNC SCRIPT - SILARIA (GFS CERIA)
 * 
 * Script ini aman dijalankan di server baru (fresh deploy) maupun server lama (existing database).
 * Menggunakan prinsip "CREATE TABLE IF NOT EXISTS" dan "ALTER TABLE CHECK" sehingga tidak menghapus data yang sudah ada.
 * 
 * Cara menjalankan:
 * 1. Melalui Terminal / Command Prompt: php migrate_all.php
 * 2. Melalui Web Browser: http://domain-anda.com/backend/migrate_all.php
 */

require_once dirname(__DIR__, 2) . '/db.php';

header('Content-Type: text/plain; charset=utf-8');
echo "=== SILARIA (GFS CERIA) - MASTER DATABASE MIGRATION ===\n";
echo "Starting migration at: " . date('Y-m-d H:i:s') . "\n\n";

try {
    // 1. TABLE: areas
    $pdo->exec("CREATE TABLE IF NOT EXISTS `areas` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `area_name` VARCHAR(150) NOT NULL,
        `area_id` VARCHAR(50) NOT NULL UNIQUE,
        `registered_by` VARCHAR(100) NULL,
        `last_registration` DATETIME NULL,
        `remarks` TEXT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'areas' checked/created.\n";

    // 2. TABLE: messes
    $pdo->exec("CREATE TABLE IF NOT EXISTS `messes` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `mess_name` VARCHAR(150) NOT NULL,
        `area_id` INT NULL,
        `total_rooms` INT DEFAULT 0,
        `available_rooms` INT DEFAULT 0,
        `status` VARCHAR(50) DEFAULT 'Active',
        `remarks` TEXT NULL,
        FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'messes' checked/created.\n";

    // 3. TABLE: rooms
    $pdo->exec("CREATE TABLE IF NOT EXISTS `rooms` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `room_number` VARCHAR(50) NOT NULL,
        `mess_id` INT NULL,
        `capacity` INT DEFAULT 1,
        `status` VARCHAR(50) DEFAULT 'Available',
        `remarks` TEXT NULL,
        FOREIGN KEY (`mess_id`) REFERENCES `messes`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'rooms' checked/created.\n";

    // 4. TABLE: meals_dp (Meals Delivery Points)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `meals_dp` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `dp_name` VARCHAR(150) NOT NULL,
        `location` VARCHAR(150) NULL,
        `status` VARCHAR(50) DEFAULT 'Active'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'meals_dp' checked/created.\n";

    // 5. TABLE: laundry_dp (Laundry Drop Points)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `laundry_dp` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `dp_name` VARCHAR(150) NOT NULL,
        `location` VARCHAR(150) NULL,
        `status` VARCHAR(50) DEFAULT 'Active'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'laundry_dp' checked/created.\n";

    // 6. TABLE: laundry_bag
    $pdo->exec("CREATE TABLE IF NOT EXISTS `laundry_bag` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `bag_number` VARCHAR(50) NOT NULL UNIQUE,
        `room_number` VARCHAR(50) NULL,
        `status` VARCHAR(50) DEFAULT 'Available'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'laundry_bag' checked/created.\n";

    // 7. TABLE: guests
    $pdo->exec("CREATE TABLE IF NOT EXISTS `guests` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(150) NOT NULL,
        `occupants_category` VARCHAR(100) NULL,
        `institution_company` VARCHAR(150) NULL,
        `gender` VARCHAR(20) NULL,
        `id_number` VARCHAR(50) NULL,
        `phone` VARCHAR(50) NULL,
        `email` VARCHAR(100) NULL,
        `room_id` INT NULL,
        `status` VARCHAR(50) DEFAULT 'Checked-In',
        `meals_packages` VARCHAR(100) NULL,
        `breakfast_dp` VARCHAR(100) NULL,
        `lunch_dp` VARCHAR(100) NULL,
        `dinner_dp` VARCHAR(100) NULL,
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'guests' checked/created.\n";

    // Patch columns for existing 'guests' table if upgraded from old schema
    $guestCols = [
        "occupants_category VARCHAR(100) NULL AFTER name",
        "institution_company VARCHAR(150) NULL AFTER occupants_category",
        "meals_packages VARCHAR(100) NULL",
        "breakfast_dp VARCHAR(100) NULL",
        "lunch_dp VARCHAR(100) NULL",
        "dinner_dp VARCHAR(100) NULL"
    ];
    foreach ($guestCols as $colDef) {
        $colName = explode(' ', trim($colDef))[0];
        $check = $pdo->query("SHOW COLUMNS FROM `guests` LIKE '$colName'");
        if ($check->rowCount() == 0) {
            $pdo->exec("ALTER TABLE `guests` ADD COLUMN $colDef");
            echo "   -> Added missing column '$colName' to table 'guests'.\n";
        }
    }

    // 8. TABLE: reservations
    $pdo->exec("CREATE TABLE IF NOT EXISTS `reservations` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `guest_id` INT NULL,
        `room_id` INT NULL,
        `check_in` DATETIME NULL,
        `check_out` DATETIME NULL,
        `estimated_arrival` DATETIME NULL,
        `estimated_departure` DATETIME NULL,
        `guest_status` VARCHAR(50) NULL,
        `remark` TEXT NULL,
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'reservations' checked/created.\n";

    // Patch column 'remark' for reservations
    $checkRes = $pdo->query("SHOW COLUMNS FROM `reservations` LIKE 'remark'");
    if ($checkRes->rowCount() == 0) {
        $pdo->exec("ALTER TABLE `reservations` ADD COLUMN `remark` TEXT NULL");
        echo "   -> Added missing column 'remark' to table 'reservations'.\n";
    }

    // 9. TABLE: laundry_services
    $pdo->exec("CREATE TABLE IF NOT EXISTS `laundry_services` (
        `id` VARCHAR(50) PRIMARY KEY,
        `roomNo` VARCHAR(50) NULL,
        `guestName` VARCHAR(150) NULL,
        `laundryBagId` VARCHAR(100) NULL,
        `weight` DECIMAL(5,2) DEFAULT 0.00,
        `status` VARCHAR(50) NULL,
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'laundry_services' checked/created.\n";

    // 10. TABLE: laundry_transactions
    $pdo->exec("CREATE TABLE IF NOT EXISTS `laundry_transactions` (
        `id` VARCHAR(50) PRIMARY KEY,
        `room` VARCHAR(50) NULL,
        `guest_name` VARCHAR(100) NULL,
        `laundry_bag_id` VARCHAR(50) NULL,
        `laundry_box_id` VARCHAR(50) NULL,
        `services_package` VARCHAR(50) DEFAULT 'Regular',
        `drop_point` VARCHAR(100) NULL,
        `drop_date` DATETIME NULL,
        `distribute_date` DATETIME NULL,
        `deliver_date` DATETIME NULL,
        `return_date` DATETIME NULL,
        `receiving_date` DATETIME NULL,
        `bag_status` VARCHAR(50) DEFAULT 'Pending',
        `weight` DECIMAL(5,2) NULL,
        `no_of_pcs_total` INT DEFAULT 0,
        `current_status` VARCHAR(50) DEFAULT 'DROPPED_AT_POINT',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'laundry_transactions' checked/created.\n";

    // 11. TABLE: laundry_details
    $pdo->exec("CREATE TABLE IF NOT EXISTS `laundry_details` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `transaction_id` VARCHAR(50) NULL,
        `clothes_no` INT NULL,
        `clothes_type` VARCHAR(100) NULL,
        `brand` VARCHAR(100) NULL,
        `colour` VARCHAR(50) NULL,
        `size` VARCHAR(20) NULL,
        `no_of_pcs` INT DEFAULT 0,
        FOREIGN KEY (`transaction_id`) REFERENCES `laundry_transactions`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'laundry_details' checked/created.\n";

    // 12. TABLE: meals_on_request
    $pdo->exec("CREATE TABLE IF NOT EXISTS `meals_on_request` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `date` DATE NOT NULL,
        `guest_name` VARCHAR(150) NOT NULL,
        `request_by` VARCHAR(100) NULL,
        `approved_by` VARCHAR(100) NULL,
        `meals_package` VARCHAR(100) NULL,
        `delivery_point_id` INT NULL,
        `meal_time` VARCHAR(50) NULL,
        `no_of_packs` INT DEFAULT 1,
        `remark` TEXT NULL,
        `status` VARCHAR(50) DEFAULT 'PENDING',
        FOREIGN KEY (`delivery_point_id`) REFERENCES `meals_dp`(`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'meals_on_request' checked/created.\n";

    // 13. TABLE: meeting_rooms
    $pdo->exec("CREATE TABLE IF NOT EXISTS `meeting_rooms` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `date` VARCHAR(50) DEFAULT '-',
        `room` VARCHAR(100) NOT NULL,
        `building` VARCHAR(100) NOT NULL,
        `capacity` INT NOT NULL,
        `booking_status` VARCHAR(50) DEFAULT 'OPEN',
        `reserved_by` VARCHAR(100) DEFAULT '-',
        `status` VARCHAR(50) DEFAULT '-',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'meeting_rooms' checked/created.\n";

    // Seed meeting rooms if empty
    $countMR = $pdo->query("SELECT COUNT(*) FROM `meeting_rooms`")->fetchColumn();
    if ($countMR == 0) {
        $insertMR = $pdo->prepare("INSERT INTO `meeting_rooms` (`date`, `room`, `building`, `capacity`, `booking_status`, `reserved_by`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $roomsData = [
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
        foreach ($roomsData as $rm) {
            $insertMR->execute($rm);
        }
        echo "   -> Seeded 9 default meeting rooms.\n";
    }

    // Patch new columns for meeting_rooms if missing
    $mrNewCols = [
        "departement VARCHAR(100) NULL",
        "participants INT NULL DEFAULT 0",
        "start_time VARCHAR(10) NULL",
        "finish_time VARCHAR(10) NULL",
        "additional_info TEXT NULL",
    ];
    foreach ($mrNewCols as $colDef) {
        $colName = explode(' ', trim($colDef))[0];
        $check = $pdo->query("SHOW COLUMNS FROM `meeting_rooms` LIKE '$colName'");
        if ($check->rowCount() == 0) {
            $pdo->exec("ALTER TABLE `meeting_rooms` ADD COLUMN $colDef");
            echo "   -> Added column '$colName' to 'meeting_rooms'.\n";
        }
    }

    // 14. TABLE: users (User Management & Role Authentication)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(150) NOT NULL,
        `username` VARCHAR(100) NOT NULL UNIQUE,
        `email` VARCHAR(150) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL,
        `role` VARCHAR(50) NOT NULL,
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "[OK] Table 'users' checked/created.\n";

    // Seed 8 preset role accounts into users if table is empty
    $countUsers = $pdo->query("SELECT COUNT(*) FROM `users`")->fetchColumn();
    if ($countUsers == 0) {
        $insertUser = $pdo->prepare("INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`) VALUES (?, ?, ?, ?, ?)");
        $presets = [
            ['Super Administrator', 'superadmin', 'superadmin@gfsceria.com', 'password123', 'super'],
            ['System Administrator', 'admin', 'admin@gfsceria.com', 'password123', 'admin'],
            ['Front Office Staff', 'frontoffice', 'frontoffice@gfsceria.com', 'password123', 'fron'],
            ['Supervisor Staff', 'supervisor', 'supervisor@gfsceria.com', 'password123', 'supervisor'],
            ['Canteen Officer', 'canteen', 'canteen@gfsceria.com', 'password123', 'canteen'],
            ['Laundry Dropper', 'laundrydrop', 'laundr@gfsceria.com', 'password123', 'laundr'],
            ['Transport Driver', 'driver', 'driver@gfsceria.com', 'password123', 'driver'],
            ['Laundry Cleaner', 'laundry', 'laundry@gfsceria.com', 'password123', 'laundry']
        ];
        foreach ($presets as $p) {
            $insertUser->execute($p);
        }
        echo "   -> Seeded 8 default user role accounts into 'users' table.\n";
    }

    echo "\n=== [SUCCESS] ALL 14 DATABASE TABLES ARE UP-TO-DATE & READY! ===\n";
    echo "Migration completed successfully at: " . date('Y-m-d H:i:s') . "\n";

} catch (Exception $e) {
    echo "\n[ERROR] Migration failed: " . $e->getMessage() . "\n";
    http_response_code(500);
}
?>
