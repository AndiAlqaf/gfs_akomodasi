<?php
$host = '127.0.0.1';
$db   = 'gfs_akomodasi';
$user = 'root';
$pass = '';

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Try to insert directly via API
$url = "http://localhost:8000/server.php?action=add_guest";

// Find a room_id to use
$room = $pdo->query("SELECT id FROM rooms LIMIT 1")->fetchColumn();

$data = [
    "room_id" => $room,
    "name" => "TEST GUEST DEPT",
    "department" => "TESTING DEPT",
    "registered_by" => "TestScript"
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ],
];
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "API Response: $result\n";

// Verify in DB
$guest = $pdo->query("SELECT * FROM guests WHERE name = 'TEST GUEST DEPT'")->fetch(PDO::FETCH_ASSOC);
echo "Guest Department in DB: " . ($guest['department'] ?? 'NULL') . "\n";

// Clean up
$pdo->exec("DELETE FROM guests WHERE name = 'TEST GUEST DEPT'");
