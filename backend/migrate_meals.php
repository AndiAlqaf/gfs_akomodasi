<?php
require 'db.php';

try {
    // 1. Add new columns to meals_requests
    $pdo->exec("
        ALTER TABLE meals_requests 
        ADD COLUMN IF NOT EXISTS guest_type VARCHAR(50) DEFAULT 'ACCOMMODATED' AFTER date,
        ADD COLUMN IF NOT EXISTS visitor_name VARCHAR(100) NULL AFTER guest_type,
        ADD COLUMN IF NOT EXISTS request_by VARCHAR(100) NULL AFTER visitor_name,
        ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100) NULL AFTER request_by,
        ADD COLUMN IF NOT EXISTS breakfast_packs INT DEFAULT 1 AFTER dinner,
        ADD COLUMN IF NOT EXISTS lunch_packs INT DEFAULT 1 AFTER breakfast_packs,
        ADD COLUMN IF NOT EXISTS dinner_packs INT DEFAULT 1 AFTER lunch_packs;
    ");
    
    // 2. Modify reservation_id to allow NULL (In MySQL, INT is nullable by default if NOT NULL is omitted, but let's be sure)
    $pdo->exec("ALTER TABLE meals_requests MODIFY reservation_id INT NULL;");

    // 3. Insert mock visitor data if not exists
    $stmt = $pdo->query("SELECT COUNT(*) FROM meals_requests WHERE guest_type = 'VISITOR'");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("
            INSERT INTO meals_requests (reservation_id, date, guest_type, visitor_name, request_by, approved_by, meals_package, delivery_point_id, breakfast, lunch, dinner, breakfast_packs, lunch_packs, dinner_packs, status) 
            VALUES (NULL, CURDATE(), 'VISITOR', 'VISITOR GROUP A (5 PAX)', 'Mr. Alex', 'Mr. Manager', 'VIP BUFFET', 1, FALSE, TRUE, FALSE, 0, 5, 0, 'PREPARING');
        ");
    }

    echo "Migration successful!";
} catch (\PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
