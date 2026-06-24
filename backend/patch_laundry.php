<?php
require __DIR__ . '/db.php';

try {
    // 1. Create laundry_transactions
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS laundry_transactions (
        id VARCHAR(50) PRIMARY KEY,
        room VARCHAR(50),
        guest_name VARCHAR(100),
        laundry_bag_id VARCHAR(50),
        laundry_box_id VARCHAR(50),
        services_package VARCHAR(50) DEFAULT 'Regular',
        drop_point VARCHAR(100),
        drop_date DATETIME NULL,
        distribute_date DATETIME NULL,
        deliver_date DATETIME NULL,
        return_date DATETIME NULL,
        receiving_date DATETIME NULL,
        bag_status VARCHAR(50) DEFAULT 'Pending',
        weight DECIMAL(5,2) NULL,
        no_of_pcs_total INT DEFAULT 0,
        current_status VARCHAR(50) DEFAULT 'DROPPED_AT_POINT',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    echo "laundry_transactions created successfully.\n";

    // 2. Create laundry_details
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS laundry_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(50),
        clothes_no INT,
        clothes_type VARCHAR(100),
        brand VARCHAR(100),
        colour VARCHAR(50),
        size VARCHAR(20),
        no_of_pcs INT,
        FOREIGN KEY (transaction_id) REFERENCES laundry_transactions(id) ON DELETE CASCADE
    )");

    echo "laundry_details created successfully.\n";

} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage() . "\n");
}
?>
