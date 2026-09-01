<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=gfs_akomodasi;charset=utf8mb4', 'root', '');
$rooms = $pdo->query('SELECT room_no FROM rooms')->fetchAll(PDO::FETCH_COLUMN);
echo "Total rooms in db: " . count($rooms) . "\n";
if (!in_array('MC.06.01', $rooms)) echo "MC.06.01 not found\n";
if (!in_array('WM.01', $rooms)) echo "WM.01 not found\n";
if (!in_array('TBM.01.01', $rooms)) echo "TBM.01.01 not found\n";
if (!in_array('SLM.01.01', $rooms)) echo "SLM.01.01 not found\n";
