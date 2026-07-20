<?php
require 'db.php';
$stmt = $pdo->query("SELECT * FROM areas LIMIT 5");
$areas = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Areas:\n";
print_r($areas);
