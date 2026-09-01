<?php
require 'db.php';
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM guests WHERE occupants_category = 'REGULAR GUEST'");
    $stmt->execute();
    echo "Total REGULAR GUESTs: " . $stmt->fetchColumn() . "\n";
    
    $stmt2 = $pdo->prepare("
        SELECT COUNT(*) FROM guests g 
        LEFT JOIN reservations r ON g.id = r.guest_id 
        WHERE g.occupants_category = 'REGULAR GUEST' AND r.id IS NULL
    ");
    $stmt2->execute();
    echo "REGULAR GUESTs without any reservation: " . $stmt2->fetchColumn() . "\n";

    $stmt3 = $pdo->prepare("
        SELECT COUNT(*) FROM guests g 
        JOIN reservations r ON g.id = r.guest_id 
        WHERE g.occupants_category = 'REGULAR GUEST'
    ");
    $stmt3->execute();
    echo "Reservations for REGULAR GUESTs: " . $stmt3->fetchColumn() . "\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
