<?php
require 'db.php';
$stmt = $pdo->query('SELECT id, name, occupants_category, level_category, position, department FROM guests WHERE occupants_category = "" OR occupants_category IS NULL LIMIT 20');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
