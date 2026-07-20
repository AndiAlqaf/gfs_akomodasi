<?php
require 'db.php';

try {
    $pdo->exec("ALTER TABLE reservations ADD COLUMN remark TEXT NULL");
    echo "Added remark\n";
} catch (\PDOException $e) {
    echo "Error adding remark: " . $e->getMessage() . "\n";
}
