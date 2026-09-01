<?php
require 'db.php';
try {
    $stmt = $pdo->prepare("
        SELECT g.id as guest_id, g.room_id 
        FROM guests g
        LEFT JOIN reservations r ON g.id = r.guest_id
        WHERE g.occupants_category = 'REGULAR GUEST' AND r.id IS NULL
    ");
    $stmt->execute();
    $guestsWithoutRes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $insertStmt = $pdo->prepare("
        INSERT INTO reservations (guest_id, room_id, guest_status, check_in, check_out) 
        VALUES (?, ?, 'OFF SITE', NULL, NULL)
    ");

    $count = 0;
    foreach ($guestsWithoutRes as $g) {
        // If room_id is empty or null, we might insert it anyway. Let's just pass whatever room_id they have.
        $insertStmt->execute([$g['guest_id'], $g['room_id']]);
        $count++;
    }

    echo "Successfully inserted $count reservations.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
