<?php 
require 'app/Core/Database.php'; 
require 'config/database.php'; 
$db = new \App\Core\Database(); 
print_r($db::fetchAll("SELECT r.id, r.room_no, r.beds, res.id as res_id, g.name as guest_name, res.guest_status FROM rooms r LEFT JOIN reservations res ON res.room_id = r.id LEFT JOIN guests g ON res.guest_id = g.id LIMIT 20;"));
