<?php
$host = '127.0.0.1';
$db   = 'gfs_akomodasi';
$user = 'root';
$pass = '';
$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
try {
     $pdo = new PDO($dsn, $user, $pass);
     echo "GUESTS TABLE SCHEMA:\n";
     $desc = $pdo->query("DESCRIBE guests");
     while ($col = $desc->fetch(PDO::FETCH_ASSOC)) {
         echo "  " . $col['Field'] . " - " . $col['Type'] . "\n";
     }
} catch (\PDOException $e) {
     echo "Error: " . $e->getMessage() . "\n";
}
