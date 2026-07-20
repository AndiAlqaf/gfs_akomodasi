<?php
$host = '127.0.0.1';
$port = '3306';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;charset=$charset", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("USE gfs_akomodasi;");
    
    $sql = file_get_contents(__DIR__ . '/database_clean.sql');
    
    // Remove BOM
    if (substr($sql, 0, 3) == "\xEF\xBB\xBF") {
        $sql = substr($sql, 3);
    }
    
    // Execute
    $pdo->exec($sql);
    echo "Database imported successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
