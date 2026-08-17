<?php
require 'db.php';

try {
    $columnsToAdd = [
        "institution_company VARCHAR(150) NULL AFTER name",
        "meals_packages VARCHAR(100) NULL",
        "breakfast_dp VARCHAR(100) NULL",
        "lunch_dp VARCHAR(100) NULL",
        "dinner_dp VARCHAR(100) NULL"
    ];

    foreach ($columnsToAdd as $col) {
        try {
            $pdo->exec("ALTER TABLE guests ADD COLUMN $col");
            echo "Added $col\n";
        } catch (\PDOException $e) {
            echo "Error adding $col: " . $e->getMessage() . "\n";
        }
    }
} catch (\PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
}
