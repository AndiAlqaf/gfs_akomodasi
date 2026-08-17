<?php
$data = json_encode([
    'guestName' => 'SUNARTO URJOYO PURBA',
    'category' => 'SPECIAL GUEST',
    'room_id' => '3',
    'estimated_arrival' => '2026-08-07 14:00:00',
    'estimated_departure' => '2026-08-08 10:00:00',
    'remark' => 'test api call'
]);

$ch = curl_init('http://localhost:31145/api/reservations');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($data)
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpcode\n";
echo "Response: $response\n";
