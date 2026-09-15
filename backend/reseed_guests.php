<?php
require_once __DIR__ . '/db.php';

$csv_file = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\94ddfced-e6be-4902-aa5d-61fba6d970ad\\.user_uploaded\\media_1789478922905.csv';
if (!file_exists($csv_file)) {
    die("CSV file not found: $csv_file\n");
}

$lines = file($csv_file);

try {
    // 1. Fetch existing room map: room_no => room_id
    $rooms = $pdo->query("SELECT id, room_no FROM rooms")->fetchAll(PDO::FETCH_ASSOC);
    $room_map = [];
    foreach ($rooms as $r) {
        $room_map[trim($r['room_no'])] = $r['id'];
    }

    // 2. Fetch existing reservations to preserve active ones (checked in / on site / history)
    $oldReservations = $pdo->query("
        SELECT r.*, g.name as guest_name, g.reg_id_card 
        FROM reservations r 
        LEFT JOIN guests g ON r.guest_id = g.id
    ")->fetchAll(PDO::FETCH_ASSOC);

    // 3. Clear guests table safely
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    $pdo->exec('TRUNCATE TABLE guests');
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

    $stmt = $pdo->prepare("
        INSERT INTO guests (
            room_id, name, personal_identification, reg_id_card, job, position,
            level_category, department, institution_company, occupants_category,
            meals_packages, breakfast_dp, lunch_dp, dinner_dp,
            registered_by, last_registration, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    ");

    $count = 0;
    $skipped = [];
    $newGuestsMap = []; // name => guest_id

    foreach ($lines as $idx => $line) {
        $line = trim($line);
        if (empty($line)) continue;
        // Skip header lines
        if (str_starts_with($line, 'NO;') || str_starts_with($line, ';') || str_contains($line, 'DATA REGISTER')) continue;

        $cols = explode(";", $line);
        if (count($cols) < 4) continue;

        $no = trim($cols[0]);
        if (!is_numeric($no)) continue;

        $room_no = trim($cols[1]);
        $mess = trim($cols[2] ?? '');
        $name = trim($cols[3] ?? '');

        // Fix known typo if any: DM.A3.115 in DORMITORY B1 is DM.B1.115
        if ($room_no === 'DM.A3.115' && strpos($mess, 'DORMITORY B1') !== false) {
            $room_no = 'DM.B1.115';
        }

        if (!isset($room_map[$room_no])) {
            $skipped[] = "Row $no: Room '$room_no' not found in rooms table for guest '$name'";
            continue;
        }

        $roomId = $room_map[$room_no];
        $personalId = trim($cols[4] ?? '');
        $regIdCard = trim($cols[5] ?? '');
        $job = trim($cols[6] ?? '');
        $position = trim($cols[7] ?? '');
        $levelCategory = trim($cols[8] ?? '');
        $department = trim($cols[9] ?? '');
        $institutionCompany = trim($cols[10] ?? '');
        $occupantsCategory = trim($cols[11] ?? 'REGULAR GUEST');
        $mealsPackages = trim($cols[12] ?? '');
        $breakfastDp = trim($cols[13] ?? '');
        $lunchDp = trim($cols[14] ?? '');
        $dinnerDp = trim($cols[15] ?? '');
        $registeredBy = !empty(trim($cols[16] ?? '')) ? trim($cols[16]) : 'Admin';
        $remarks = trim($cols[18] ?? '');

        $stmt->execute([
            $roomId,
            $name,
            $personalId,
            $regIdCard,
            $job,
            $position,
            $levelCategory,
            $department,
            $institutionCompany,
            $occupantsCategory,
            $mealsPackages,
            $breakfastDp,
            $lunchDp,
            $dinnerDp,
            $registeredBy,
            $remarks
        ]);

        $newId = $pdo->lastInsertId();
        $newGuestsMap[$name] = $newId;
        $count++;
    }

    echo "Successfully inserted $count guest records.\n";
    if (!empty($skipped)) {
        echo "Skipped " . count($skipped) . " records:\n";
        print_r($skipped);
    }

    // 4. Resync reservations:
    // Update reservations.guest_id to point to the new guest_id matching by guest name
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    $resUpdated = 0;
    foreach ($oldReservations as $oldRes) {
        $gName = $oldRes['guest_name'] ?? '';
        if ($gName && isset($newGuestsMap[$gName])) {
            $newGid = $newGuestsMap[$gName];
            $upStmt = $pdo->prepare("UPDATE reservations SET guest_id = ? WHERE id = ?");
            $upStmt->execute([$newGid, $oldRes['id']]);
            $resUpdated++;
        }
    }
    echo "Re-linked $resUpdated existing reservations to new guest records.\n";

    // 5. Ensure all REGULAR GUEST have a reservation record (for check-in / check-out page)
    $regStmt = $pdo->query("
        SELECT g.id as guest_id, g.room_id 
        FROM guests g
        LEFT JOIN reservations r ON g.id = r.guest_id
        WHERE g.occupants_category = 'REGULAR GUEST' AND r.id IS NULL
    ");
    $missingRegs = $regStmt->fetchAll(PDO::FETCH_ASSOC);

    $insRes = $pdo->prepare("
        INSERT INTO reservations (guest_id, room_id, guest_status, check_in, check_out) 
        VALUES (?, ?, 'OFF SITE', NULL, NULL)
    ");
    $newResCount = 0;
    foreach ($missingRegs as $mr) {
        $insRes->execute([$mr['guest_id'], $mr['room_id']]);
        $newResCount++;
    }
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
    echo "Added $newResCount new reservation entries for REGULAR GUESTs without one.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
