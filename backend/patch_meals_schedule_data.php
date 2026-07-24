<?php
require __DIR__ . '/db.php';

try {
    $pdo->beginTransaction();

    $data = [
        ['LH.01.01', 'LANDED HOUSE-01', 'SUNARTO URJOYO PURBA', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH.01.02', 'LANDED HOUSE-01', 'CHRISTIAN BAMBANG KHRISNA MUKTI', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH.02.01', 'LANDED HOUSE-02', 'MR. ZHENG BU DONG', 'STANDARD BUFFET', 'ENFI CANTEEN', 'ENFI CANTEEN', 'ENFI CANTEEN'],
        ['LH.03.01', 'LANDED HOUSE-03', "TA'DUNG", 'STANDARD BUFFET', 'SATELIT CANTEEN', 'SATELIT CANTEEN', 'SATELIT CANTEEN'],
        ['LH.03.02', 'LANDED HOUSE-03', 'REINHARD SIAHAAN', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'SATELIT CANTEEN', 'SATELIT CANTEEN'],
        ['LH.04.01', 'LANDED HOUSE-04', 'SUWARTO PRAWIROATMODJO', 'ROOM DELIVERY', 'STAY MESS', 'OFFICE U SMELTER CANTEEN', 'STAY MESS'],
        ['LH.04.02', 'LANDED HOUSE-04', 'ANDRE CH MR DAENUWY', 'ROOM DELIVERY', 'STAY MESS', 'OFFICE U SMELTER CANTEEN', 'STAY MESS'],
        ['LH.05.01', 'LANDED HOUSE-05', 'SLAMET SURYANTO', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH.05.02', 'LANDED HOUSE-05', 'SYAMSI BUANG', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH.06.01', 'LANDED HOUSE-06', 'ROIMON BARUS', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH.06.02', 'LANDED HOUSE-06', 'YARIS TANDI', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH-07.01', 'LANDED HOUSE-07', 'ALIMUDDIN TOLA', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH-07.02', 'LANDED HOUSE-07', 'BUSYAIRI', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH.08.01', 'LANDED HOUSE-08', 'IMRAN ROSJADI PABITJARA', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH.08.02', 'LANDED HOUSE-08', 'AGUSTINUS LONTOH', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH.09.01', 'LANDED HOUSE-09', 'ANDI MAPPASELA', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH.09.02', 'LANDED HOUSE-09', 'LUSYAN TADUNG', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH.10.01', 'LANDED HOUSE-10', 'ALFINA WIJANARNO', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN'],
        ['LH.10.02', 'LANDED HOUSE-10', 'ALIM SIDDIQ SOLEH', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN']
    ];

    // Get a default area
    $areaId = $pdo->query("SELECT id FROM areas LIMIT 1")->fetchColumn();
    if (!$areaId) {
        $pdo->exec("INSERT INTO areas (area_name, area_id) VALUES ('LIVING RESIDENCE', 'LIV.RES.01')");
        $areaId = $pdo->lastInsertId();
    }

    // Clear existing reservations and guests to avoid duplicates if re-running
    $pdo->exec("DELETE FROM reservations");
    $pdo->exec("DELETE FROM guests");

    foreach ($data as $row) {
        $roomNo = $row[0];
        $messName = $row[1];
        $guestName = $row[2];
        $mealsPackages = $row[3];
        $breakfast = $row[4];
        $lunch = $row[5];
        $dinner = $row[6];

        // 1. Mess
        $stmt = $pdo->prepare("SELECT id FROM messes WHERE mess_name = ?");
        $stmt->execute([$messName]);
        $messId = $stmt->fetchColumn();
        if (!$messId) {
            $messIdCode = 'CMP.MES.' . str_replace(' ', '', $messName);
            $stmt = $pdo->prepare("INSERT INTO messes (mess_name, mess_id, area_id) VALUES (?, ?, ?)");
            $stmt->execute([$messName, $messIdCode, $areaId]);
            $messId = $pdo->lastInsertId();
        }

        // 2. Room
        $stmt = $pdo->prepare("SELECT id FROM rooms WHERE room_no = ?");
        $stmt->execute([$roomNo]);
        $roomId = $stmt->fetchColumn();
        if (!$roomId) {
            $stmt = $pdo->prepare("INSERT INTO rooms (room_no, mess_id, room_status) VALUES (?, ?, 'OCCUPIED')");
            $stmt->execute([$roomNo, $messId]);
            $roomId = $pdo->lastInsertId();
        } else {
            $pdo->prepare("UPDATE rooms SET room_status = 'OCCUPIED' WHERE id = ?")->execute([$roomId]);
        }

        // 3. Guest
        $stmt = $pdo->prepare("INSERT INTO guests (room_id, name, meals_packages, breakfast_dp, lunch_dp, dinner_dp, occupants_category, job, position) VALUES (?, ?, ?, ?, ?, ?, 'REGULAR GUEST', 'EMPLOYEE', 'STAFF')");
        $stmt->execute([$roomId, $guestName, $mealsPackages, $breakfast, $lunch, $dinner]);
        $guestId = $pdo->lastInsertId();

        // 4. Reservation (ON SITE)
        // Hardcode the check_in date to be June 1, 2026 12:00 AM so it matches the frontend if frontend is reading from res.check_in, 
        // but actually our frontend is hardcoded to output formatted date. Let's provide a real check_in date.
        $stmt = $pdo->prepare("INSERT INTO reservations (guest_id, room_id, guest_status, check_in, remark) VALUES (?, ?, 'ON SITE', '2026-06-01 00:00:00', '')");
        $stmt->execute([$guestId, $roomId]);
    }

    $pdo->commit();
    echo "Successfully updated meals schedule data to match the image!\n";
} catch (\Exception $e) {
    $pdo->rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}
