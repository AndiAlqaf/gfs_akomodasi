<?php
$resp = json_decode(file_get_contents('http://localhost:31145/api/data-register?action=get_guests'), true);
echo "Count from API: " . count($resp['data']) . "\n";
echo "Sample 0: " . json_encode($resp['data'][0]) . "\n";
echo "Sample last: " . json_encode(end($resp['data'])) . "\n";
