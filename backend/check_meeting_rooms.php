<?php
require 'db.php';
$stmt = $pdo->query('SELECT * FROM meeting_rooms');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
