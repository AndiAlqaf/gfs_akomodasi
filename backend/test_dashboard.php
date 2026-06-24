<?php
require __DIR__ . '/db.php';
try {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
    
    echo "1. Room stats\n";
    $stmt = $pdo->query("SELECT room_status, COUNT(*) as count FROM rooms GROUP BY room_status"); 
    
    echo "2. Reservations\n";
    $stmt = $pdo->query("SELECT COUNT(*) FROM reservations WHERE guest_status = 'ON SITE'"); 
    
    echo "3. Meals\n";
    $stmt = $pdo->query("SELECT SUM(no_of_packs) FROM meals_on_request WHERE DATE(date) = CURDATE() AND status = 'APPROVED'"); 
    
    echo "4. Laundry\n";
    $stmt = $pdo->query("SELECT SUM(weight) as w, SUM(no_of_pcs_total) as pcs FROM laundry_transactions WHERE DATE(receiving_date) = CURDATE() OR DATE(created_at) = CURDATE()"); 
    
    echo 'ALL OK'; 
} catch (Exception $e) { 
    echo "ERROR: " . $e->getMessage(); 
}
