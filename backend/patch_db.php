<?php
require 'db.php';

try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS meals_on_request (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE NOT NULL,
            guest_name VARCHAR(150) NOT NULL,
            request_by VARCHAR(100),
            approved_by VARCHAR(100),
            meals_package VARCHAR(100),
            delivery_point_id INT,
            meal_time VARCHAR(50),
            no_of_packs INT DEFAULT 1,
            remark TEXT,
            status VARCHAR(50) DEFAULT 'PENDING',
            FOREIGN KEY (delivery_point_id) REFERENCES meals_dp(id) ON DELETE SET NULL
        )
    ");
    echo "Table meals_on_request created.\n";

    $pdo->exec("
        INSERT INTO meals_on_request (date, guest_name, request_by, approved_by, meals_package, delivery_point_id, meal_time, no_of_packs, remark, status) VALUES 
        (CURDATE(), 'Kunjungan Instansi Terkait', 'Canteen Officer A', 'Canteen Supervisor B', 'VIP Buffet', 6, 'LUNCH', 10, 'Tamu Khusus', 'APPROVED'),
        (CURDATE(), 'Tamu Perusahaan', 'Canteen Officer A', '', 'Standard Buffet', 1, 'DINNER', 5, 'Tambahan', 'PENDING')
    ");
    echo "Dummy data inserted.\n";

} catch (\PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
