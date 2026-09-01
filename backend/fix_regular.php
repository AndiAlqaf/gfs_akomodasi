<?php
$host = '127.0.0.1';
$db   = 'gfs_akomodasi';
$user = 'root';
$pass = '';

$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
try {
     $pdo = new PDO($dsn, $user, $pass);
     
     // Find all REGULAR GUESTs
     $stmt = $pdo->query("SELECT id FROM guests WHERE occupants_category = 'REGULAR GUEST'");
     $guests = $stmt->fetchAll(PDO::FETCH_ASSOC);
     
     $added = 0;
     foreach ($guests as $guest) {
         $gId = $guest['id'];
         
         // Check if they already have an empty slot (check_in IS NULL)
         $stmtCheck = $pdo->prepare("SELECT id FROM reservations WHERE guest_id = ? AND check_in IS NULL");
         $stmtCheck->execute([$gId]);
         $hasEmpty = $stmtCheck->fetch();
         
         if (!$hasEmpty) {
             // Find their most recent room_id and status
             $stmtLast = $pdo->prepare("SELECT room_id, guest_status FROM reservations WHERE guest_id = ? ORDER BY id DESC LIMIT 1");
             $stmtLast->execute([$gId]);
             $lastRes = $stmtLast->fetch(PDO::FETCH_ASSOC);
             
             if ($lastRes && $lastRes['guest_status'] === 'OFF SITE') {
                 // Insert an empty row
                 $stmtInsert = $pdo->prepare("INSERT INTO reservations (guest_id, room_id, guest_status, check_in, check_out) VALUES (?, ?, 'OFF SITE', NULL, NULL)");
                 $stmtInsert->execute([$gId, $lastRes['room_id']]);
                 $added++;
             }
         }
     }
     
     echo "Added $added empty slots for REGULAR GUESTs.\n";
} catch (\PDOException $e) {
     echo "Error: " . $e->getMessage() . "\n";
}
