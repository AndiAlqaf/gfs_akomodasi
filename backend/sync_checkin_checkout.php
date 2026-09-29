<?php
require 'db.php';

try {
    $pdo->beginTransaction();

    // 1. Update empty occupants_category in guests to 'REGULAR GUEST'
    $affected = $pdo->exec("UPDATE guests SET occupants_category = 'REGULAR GUEST' WHERE occupants_category = '' OR occupants_category IS NULL");
    echo "1. Updated empty occupants_category to REGULAR GUEST: $affected rows\n";

    // 2. Remove duplicate reservations, keeping the latest one per guest_id
    $dups = $pdo->query("SELECT guest_id, MAX(id) as keep_id FROM reservations WHERE guest_id IS NOT NULL GROUP BY guest_id HAVING count(*) > 1")->fetchAll(PDO::FETCH_ASSOC);
    $deletedDups = 0;
    foreach ($dups as $dup) {
        $stmtDel = $pdo->prepare("DELETE FROM reservations WHERE guest_id = ? AND id != ?");
        $stmtDel->execute([$dup['guest_id'], $dup['keep_id']]);
        $deletedDups += $stmtDel->rowCount();
    }
    echo "2. Deleted duplicate reservations: $deletedDups rows\n";

    // 3. Remove reservations where guest_id is null or guest does not exist
    $deletedOrphans = $pdo->exec("DELETE FROM reservations WHERE guest_id IS NULL OR guest_id NOT IN (SELECT id FROM guests)");
    echo "3. Deleted orphaned reservations: $deletedOrphans rows\n";

    // 4. Insert reservations for any guest in guests that does not have one
    $missingGuests = $pdo->query("
        SELECT g.id, g.room_id, g.occupants_category, g.last_registration 
        FROM guests g 
        LEFT JOIN reservations r ON g.id = r.guest_id 
        WHERE r.id IS NULL
    ")->fetchAll(PDO::FETCH_ASSOC);

    $insertStmt = $pdo->prepare("
        INSERT INTO reservations (guest_id, room_id, guest_status, check_in, check_out) 
        VALUES (?, ?, ?, ?, NULL)
    ");

    $inserted = 0;
    foreach ($missingGuests as $mg) {
        $isRegular = ($mg['occupants_category'] === 'REGULAR GUEST' || empty($mg['occupants_category']));
        $status = $isRegular ? 'ON SITE' : 'SCHEDULED';
        $checkIn = $isRegular ? ($mg['last_registration'] ?: date('Y-m-d H:i:s')) : null;
        $insertStmt->execute([$mg['id'], $mg['room_id'], $status, $checkIn]);
        $inserted++;
    }
    echo "4. Inserted missing guest reservations: $inserted rows\n";

    // 5. For ALL REGULAR GUESTs, set guest_status = 'ON SITE'
    // as instructed: "jika kategori tamu reguler guest maka guest statusnya langsung on site"
    $stmtReg = $pdo->prepare("
        UPDATE reservations r
        JOIN guests g ON r.guest_id = g.id
        SET r.guest_status = 'ON SITE',
            r.room_id = g.room_id,
            r.check_in = COALESCE(r.check_in, g.last_registration, NOW()),
            r.check_out = NULL
        WHERE g.occupants_category = 'REGULAR GUEST'
    ");
    $stmtReg->execute();
    echo "5. Updated regular guests to ON SITE: " . $stmtReg->rowCount() . " rows\n";

    // 6. Update room_id for non-regular guests if mismatched
    $stmtSyncRoom = $pdo->prepare("
        UPDATE reservations r
        JOIN guests g ON r.guest_id = g.id
        SET r.room_id = g.room_id
        WHERE r.room_id != g.room_id OR r.room_id IS NULL
    ");
    $stmtSyncRoom->execute();
    echo "6. Synced room_id with guests table: " . $stmtSyncRoom->rowCount() . " rows\n";

    // 7. Update rooms status to OCCUPIED if there is any ON SITE guest
    $pdo->exec("UPDATE rooms SET room_status = 'READY' WHERE room_status = 'OCCUPIED'");
    $stmtOcc = $pdo->exec("
        UPDATE rooms r
        SET room_status = 'OCCUPIED'
        WHERE r.id IN (
            SELECT DISTINCT room_id FROM reservations WHERE guest_status = 'ON SITE' AND room_id IS NOT NULL
        )
    ");
    echo "7. Marked rooms as OCCUPIED: $stmtOcc rooms\n";

    $pdo->commit();
    echo "SUCCESS: Sync completed successfully!\n";
} catch (Exception $e) {
    $pdo->rollBack();
    echo "ERROR: " . $e->getMessage() . "\n";
}
