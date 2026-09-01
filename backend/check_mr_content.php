<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=gfs_akomodasi;charset=utf8mb4', 'root', '');
$stmt = $pdo->query('SELECT * FROM meeting_rooms');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
