<?php
$host = '127.0.0.1';
$db   = 'gfs_akomodasi';
$user = 'root';
$pass = '';

$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
try {
     $pdo = new PDO($dsn, $user, $pass);
     $stmt = $pdo->prepare("SELECT id, point_name FROM laundry_dp");
     $stmt->execute();
     print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (\PDOException $e) {
     echo "Error: " . $e->getMessage() . "\n";
}
