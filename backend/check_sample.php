<?php
require 'db.php';
try {
    $stmt = $pdo->prepare("SELECT * FROM guests WHERE occupants_category = 'REGULAR GUEST' LIMIT 5");
    $stmt->execute();
    $guests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($guests);
    
    $stmt2 = $pdo->prepare("SELECT * FROM reservations LIMIT 5");
    $stmt2->execute();
    $reservations = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    print_r($reservations);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
