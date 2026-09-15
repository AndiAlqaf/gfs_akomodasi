<?php
$resp = json_decode(file_get_contents('http://localhost:31145/api/data-register?action=get_laundry_bag'), true);
echo "Count from API: " . count($resp['data']) . "\n";
echo "First item: " . json_encode($resp['data'][0]) . "\n";
echo "Last item: " . json_encode(end($resp['data'])) . "\n";
