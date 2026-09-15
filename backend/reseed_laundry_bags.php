<?php
require_once __DIR__ . '/db.php';

try {
    // 1. Truncate laundry_bag
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    $pdo->exec('TRUNCATE TABLE laundry_bag');
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Fetch room map: room_no => room_id
    $rooms = $pdo->query("SELECT id, room_no FROM rooms")->fetchAll(PDO::FETCH_ASSOC);
    $room_map = [];
    foreach ($rooms as $r) {
        $room_map[trim($r['room_no'])] = $r['id'];
    }

    // 3. Define the 19 Laundry Bags from Sheet 2.8 with updated names matching the new Guest Register
    $bags = [
        ['room_no' => 'LH.01.01', 'nama' => 'SUNARTO URJOYO PURBA', 'bag' => 'LH.01.01 (SUNARTO)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.01.02', 'nama' => 'CHRISTIAN BAMBANG KHRISNA MUKTI', 'bag' => 'LH.01.02 (KHRISNA)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.02.01', 'nama' => 'MR. ZHENG BU DONG', 'bag' => 'LH.02.01 (MR. ZHENG)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.03.01', 'nama' => "TA'DUNG", 'bag' => "LH.03.01 (TA'DUNG)", 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.03.02', 'nama' => 'REYNHARD MP SIAHAAN', 'bag' => 'LH.03.02 (REINHARD)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.04.01', 'nama' => 'SUWARTO PRAWIROATMODJO', 'bag' => 'LH.04.01 (SUWARTO)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.04.02', 'nama' => 'ANDRE CH. DAENUWY', 'bag' => 'LH.04.02 (ANDRE. D)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.05.01', 'nama' => 'SLAMET SURYANTO', 'bag' => 'LH.05.01 (SLAMET. S)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.05.02', 'nama' => 'SYAMSI BUANG', 'bag' => 'LH.05.02 (SYAMSI. B)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.06.01', 'nama' => 'ROIMON BARUS', 'bag' => 'LH.06.01 (ROIMON. B)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.06.02', 'nama' => 'YARIS TANDI', 'bag' => 'LH.06.02 (YARIS. T)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH-07.01', 'nama' => 'ALIMUDDIN TOLA', 'bag' => 'LH-07.01 (ALIMUDDIN. T)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH-07.02', 'nama' => 'H. BUSYAIRI, S.T.', 'bag' => 'LH-07.02 (BUSYARI)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.08.01', 'nama' => 'IMRAN ROSJADI PABITJARA', 'bag' => 'LH.08.01 (IMRAN. R)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.08.02', 'nama' => 'AGUSTINUS LONTOH', 'bag' => 'LH.08.02 (AGUS. L)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.09.01', 'nama' => 'ANDI MAPPASELLE', 'bag' => 'LH.09.01 (A. MAPPASELLE)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.09.02', 'nama' => "LUSYAN TA'DUNG, ST", 'bag' => 'LH.09.02 (LUSYAN. T)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.10.01', 'nama' => 'ALFINA WIJANARNO', 'bag' => 'LH.10.01 (ALFINA. W)', 'box' => 'LANDED HOUSE'],
        ['room_no' => 'LH.10.02', 'nama' => 'ALIM SIDDIQ SOLEH', 'bag' => 'LH.10.02 (ALIM. S)', 'box' => 'LANDED HOUSE'],
    ];

    $stmt = $pdo->prepare("
        INSERT INTO laundry_bag (nama, room_id, laundry_bag, laundry_box, registered_by, last_registration, remarks)
        VALUES (?, ?, ?, ?, 'Admin', NOW(), '')
    ");

    $inserted = 0;
    foreach ($bags as $b) {
        $roomId = $room_map[$b['room_no']] ?? null;
        $stmt->execute([
            $b['nama'],
            $roomId,
            $b['bag'],
            $b['box']
        ]);
        $inserted++;
    }

    echo "Successfully inserted $inserted laundry bags into laundry_bag table.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
