<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=gfs_akomodasi;charset=utf8mb4', 'root', '');
$count = $pdo->query('SELECT COUNT(*) FROM guests')->fetchColumn();
echo "Total guests: $count\n";
