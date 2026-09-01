<?php
$csv_file = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\6e173e50-c36d-4df3-8e6f-dfba036f0b15\\.user_uploaded\\media_1788151431516.csv';
$lines = file($csv_file);

$host = '127.0.0.1';
$db   = 'gfs_akomodasi';
$user = 'root';
$pass = '';

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$rooms = $pdo->query("SELECT room_no FROM rooms")->fetchAll(PDO::FETCH_COLUMN);
$room_map = array_flip($rooms);

$missing_rooms = [];
$total_data = 0;
foreach ($lines as $line) {
    $line = trim($line);
    if (empty($line) || str_starts_with($line, 'NO;') || str_starts_with($line, ';')) continue;
    $cols = explode(";", $line);
    if (count($cols) < 3) continue;
    
    $total_data++;
    $room_no = trim($cols[1]);
    
    // applying same fix from earlier
    if ($room_no === 'DM.A3.115' && strpos($line, 'DORMITORY B1') !== false) {
        $room_no = 'DM.B1.115';
    }
    
    if (!isset($room_map[$room_no])) {
        $missing_rooms[$room_no] = ($missing_rooms[$room_no] ?? 0) + 1;
    }
}

echo "Total Data Rows: $total_data\n";
echo "Total Missing Rooms: " . count($missing_rooms) . "\n";
foreach ($missing_rooms as $room => $count) {
    echo "$room ($count times)\n";
}
