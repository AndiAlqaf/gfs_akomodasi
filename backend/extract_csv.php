<?php
$lines = file('C:/Users/ASUS/.gemini/antigravity-ide/brain/6e173e50-c36d-4df3-8e6f-dfba036f0b15/.system_generated/logs/transcript.jsonl');
$last_user_msg = '';
foreach($lines as $line) {
    $data = json_decode($line, true);
    if($data && isset($data['type']) && $data['type'] == 'USER_INPUT') {
        $last_user_msg = $data['content'];
    }
}
$csv_start = strpos($last_user_msg, 'NO;ROOM NO;MESS;');
if($csv_start !== false) {
    // Also remove everything after the CSV if there is any trailing text
    $csv_data = substr($last_user_msg, $csv_start);
    $end_pos = strpos($csv_data, '</USER_REQUEST>');
    if ($end_pos !== false) {
        $csv_data = substr($csv_data, 0, $end_pos);
    }
    file_put_contents('guests_raw.csv', trim($csv_data));
    echo "CSV extracted to guests_raw.csv\n";
} else {
    echo "CSV not found\n";
}
