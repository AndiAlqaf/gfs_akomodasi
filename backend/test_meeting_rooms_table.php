<?php
require 'db.php';
require 'app/Core/helpers.php';
require 'app/Core/Database.php';

$db = \App\Core\Database::getInstance()->getConnection();
$stmt = $db->query('SELECT * FROM meeting_rooms');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
