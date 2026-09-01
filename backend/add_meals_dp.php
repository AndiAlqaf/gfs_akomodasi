<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=gfs_akomodasi;charset=utf8mb4', 'root', '');

// Insert 12: ENFI CANTEEN | SMELTER PT. CMP (id 8) | READY
$stmt1 = $pdo->prepare("INSERT INTO meals_dp (id, delivery_point, area_id, canteen_status, registered_by, remarks) VALUES (12, 'ENFI CANTEEN', 8, 'READY', '', '')");
$stmt1->execute();

// Insert 13: STAY MESS | (NULL) | READY (or blank, I'll use READY as default or just empty string since it's blank in the image)
// Actually in the image the Canteen Status for 13 is empty, but the DB default is READY. I will insert empty or NULL.
$stmt2 = $pdo->prepare("INSERT INTO meals_dp (id, delivery_point, area_id, canteen_status, registered_by, remarks) VALUES (13, 'STAY MESS', NULL, '', '', '')");
$stmt2->execute();

echo "Inserted 12 and 13 successfully.";
