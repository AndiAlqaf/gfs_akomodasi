<?php
$lines = file('C:/Users/ASUS/.gemini/antigravity-ide/brain/6e173e50-c36d-4df3-8e6f-dfba036f0b15/.system_generated/logs/transcript.jsonl');
$last_user_msg = '';
foreach($lines as $line) {
    $data = json_decode($line, true);
    if($data && isset($data['type']) && $data['type'] == 'USER_INPUT') {
        // Just keep the last user msg
        $last_user_msg = $data['content'];
    }
}
$csv_start = strpos($last_user_msg, 'NO;ROOM NO;MESS;');
if($csv_start !== false) {
    $csv_data = substr($last_user_msg, $csv_start);
    $end_pos = strpos($csv_data, '</USER_REQUEST>');
    if ($end_pos !== false) {
        $csv_data = substr($csv_data, 0, $end_pos);
    }
    
    $host = '127.0.0.1';
    $db   = 'gfs_akomodasi';
    $user = 'root';
    $pass = '';

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
        $pdo->exec("TRUNCATE TABLE guests");
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

        $rooms = $pdo->query("SELECT id, room_no FROM rooms")->fetchAll(PDO::FETCH_ASSOC);
        $room_map = [];
        foreach ($rooms as $r) {
            $room_map[$r['room_no']] = $r['id'];
        }

        $lines = explode("\n", trim($csv_data));
        $stmt = $pdo->prepare("INSERT INTO guests (room_id, name, personal_identification, reg_id_card, job, position, level_category, department, institution_company, occupants_category, meals_packages, breakfast_dp, lunch_dp, dinner_dp, registered_by, last_registration, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), '')");

        $count = 0;
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || str_starts_with($line, 'NO;') || str_starts_with($line, ';')) continue;
            
            $cols = explode(";", $line);
            if (count($cols) < 16) continue;

            $room_no = trim($cols[1]);
            // Apply the same typo fix as before
            if ($room_no === 'DM.A3.115' && strpos($line, 'DORMITORY B1') !== false) {
                $room_no = 'DM.B1.115';
            }
            if (!isset($room_map[$room_no])) {
                continue; // Skip if room doesn't exist
            }

            $stmt->execute([
                $room_map[$room_no],
                trim($cols[3]), // name
                trim($cols[4]), // personal_identification
                trim($cols[5]), // reg_id_card
                trim($cols[6]), // job
                trim($cols[7]), // position
                trim($cols[8]), // level_category
                trim($cols[9]), // department
                trim($cols[10]), // institution_company
                trim($cols[11]), // occupants_category
                trim($cols[12]), // meals_packages
                trim($cols[13]), // breakfast_dp
                trim($cols[14]), // lunch_dp
                trim($cols[15]), // dinner_dp
                'Admin' // registered_by
            ]);
            $count++;
        }
        
        echo "Successfully inserted $count records into the guests table.\n";
        
    } catch (\PDOException $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }

} else {
    echo "CSV not found\n";
}
