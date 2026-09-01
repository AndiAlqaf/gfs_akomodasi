<?php
$host = '127.0.0.1';
$db   = 'gfs_akomodasi';
$user = 'root';
$pass = '';
$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
try {
     $pdo = new PDO($dsn, $user, $pass);
     $pdo->exec("ALTER TABLE guests ADD COLUMN department VARCHAR(100) AFTER level_category");
     echo "Column added successfully.\n";
} catch (\PDOException $e) {
     echo "Error: " . $e->getMessage() . "\n";
}
