<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=gfs_akomodasi;charset=utf8mb4', 'root', '');

echo "--- MEALS DP COLUMNS ---\n";
print_r($pdo->query('SHOW COLUMNS FROM meals_dp')->fetchAll(PDO::FETCH_ASSOC));

echo "--- MEALS DP CONTENT ---\n";
print_r($pdo->query('SELECT * FROM meals_dp')->fetchAll(PDO::FETCH_ASSOC));

echo "--- AREAS ---\n";
print_r($pdo->query('SELECT * FROM areas')->fetchAll(PDO::FETCH_ASSOC));
