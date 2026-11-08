<?php

namespace App\Models;

use App\Core\Database;

class UserModel extends BaseModel
{
    protected $table = 'users';

    public function __construct()
    {
        // 1. Ensure table exists
        try {
            Database::execute("CREATE TABLE IF NOT EXISTS `users` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `name` VARCHAR(150) NOT NULL,
                `username` VARCHAR(100) NOT NULL UNIQUE,
                `email` VARCHAR(150) NOT NULL UNIQUE,
                `password` VARCHAR(255) NOT NULL,
                `role` VARCHAR(50) NOT NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;");
        } catch (\Exception $e) {
            // Ignore table DDL errors if table already exists
        }

        // 2. Ensure required preset accounts are seeded
        try {
            $presets = [
                ['Super Administrator', 'superadmin', 'superadmin@gfsceria.com', 'password123', 'super'],
                ['System Administrator', 'admin', 'admin@gfsceria.com', 'password123', 'admin'],
                ['Front Office Staff', 'frontoffice', 'frontoffice@gfsceria.com', 'password123', 'fron'],
                ['Supervisor Staff', 'supervisor', 'supervisor@gfsceria.com', 'password123', 'supervisor'],
                ['Canteen Officer', 'canteen', 'canteen@gfsceria.com', 'password123', 'canteen'],
                ['Laundry Dropper', 'laundrydrop', 'laundr@gfsceria.com', 'password123', 'laundr'],
                ['Transport Driver', 'driver', 'driver@gfsceria.com', 'password123', 'driver'],
                ['Laundry Cleaner', 'laundry', 'laundry@gfsceria.com', 'password123', 'laundry'],
                ['Hermansyah Marzuki', 'hermansm', 'hermansyah.marzuki@cmprima.com', 'gfs04', 'admin'],
                ['Muhammad Idul', 'muhIdul', 'muhammad.idul@cerindocorp.co.id', '654321', 'admin'],
                ['Ummu Atia Ahmad', 'ummua', 'ummu.ahmad@cerindocorp.co.id', '280900', 'admin']
            ];

            $count = Database::fetchColumn("SELECT COUNT(*) FROM `users`");
            if ($count == 0) {
                foreach ($presets as $p) {
                    Database::execute("INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`) VALUES (?, ?, ?, ?, ?)", $p);
                }
            } else {
                // Ensure the 3 new admin accounts exist in existing databases
                $additionalAdmins = [
                    ['Hermansyah Marzuki', 'hermansm', 'hermansyah.marzuki@cmprima.com', 'gfs04', 'admin'],
                    ['Muhammad Idul', 'muhIdul', 'muhammad.idul@cerindocorp.co.id', '654321', 'admin'],
                    ['Ummu Atia Ahmad', 'ummua', 'ummu.ahmad@cerindocorp.co.id', '280900', 'admin']
                ];
                foreach ($additionalAdmins as $adm) {
                    $exists = Database::fetch("SELECT id FROM `users` WHERE LOWER(TRIM(username)) = LOWER(?)", [$adm[1]]);
                    if (!$exists) {
                        Database::execute(
                            "INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`) VALUES (?, ?, ?, ?, ?)",
                            $adm
                        );
                    }
                }
            }
        } catch (\Exception $e) {
            // Ignore DB init errors
        }
    }

    public function getAllUsers()
    {
        return Database::fetchAll("SELECT id, name, username, email, password, role, created_at FROM `users` ORDER BY id ASC");
    }

    public function login($username, $password)
    {
        $cleanUsername = trim((string)$username);
        $user = Database::fetch(
            "SELECT id, name, username, email, role, password FROM `users` WHERE LOWER(TRIM(username)) = LOWER(?)",
            [$cleanUsername]
        );
        if (!$user && in_array(strtolower($cleanUsername), ['super admin', 'super_admin', 'superadmin'], true)) {
            $user = Database::fetch(
                "SELECT id, name, username, email, role, password FROM `users` WHERE role = 'super' ORDER BY id ASC LIMIT 1"
            );
        }

        if ($user && (string)$password === (string)$user['password']) {
            unset($user['password']);
            return $user;
        }
        return false;
    }

    public function createUser($data)
    {
        $username = trim((string)($data['username'] ?? ''));
        $email = trim((string)($data['email'] ?? ''));
        if ($email === '') {
            $email = strtolower(preg_replace('/[^a-zA-Z0-9._-]/', '', $username)) . '@gfsceria.com';
        }

        $existsUsername = Database::fetch("SELECT id FROM `users` WHERE LOWER(TRIM(username)) = LOWER(?)", [$username]);
        if ($existsUsername) {
            throw new \RuntimeException("Username '{$username}' sudah digunakan.");
        }

        $existsEmail = Database::fetch("SELECT id FROM `users` WHERE LOWER(TRIM(email)) = LOWER(?)", [$email]);
        if ($existsEmail) {
            throw new \RuntimeException("Email '{$email}' sudah digunakan.");
        }

        Database::execute(
            "INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`) VALUES (?, ?, ?, ?, ?)",
            [
                trim((string)$data['name']),
                $username,
                $email,
                (string)($data['password'] ?? 'password123'),
                trim((string)($data['role'] ?? 'admin'))
            ]
        );
        return Database::lastInsertId();
    }

    public function updateUser($data)
    {
        $id = $data['id'];
        $username = trim((string)($data['username'] ?? ''));
        $email = trim((string)($data['email'] ?? ''));
        if ($email === '') {
            $email = strtolower(preg_replace('/[^a-zA-Z0-9._-]/', '', $username)) . '@gfsceria.com';
        }

        $existsUsername = Database::fetch(
            "SELECT id FROM `users` WHERE LOWER(TRIM(username)) = LOWER(?) AND id != ?",
            [$username, $id]
        );
        if ($existsUsername) {
            throw new \RuntimeException("Username '{$username}' sudah digunakan oleh akun lain.");
        }

        $existsEmail = Database::fetch(
            "SELECT id FROM `users` WHERE LOWER(TRIM(email)) = LOWER(?) AND id != ?",
            [$email, $id]
        );
        if ($existsEmail) {
            throw new \RuntimeException("Email '{$email}' sudah digunakan oleh akun lain.");
        }

        if (isset($data['password']) && trim((string)$data['password']) !== '') {
            Database::execute(
                "UPDATE `users` SET name=?, username=?, email=?, password=?, role=? WHERE id=?",
                [
                    trim((string)$data['name']),
                    $username,
                    $email,
                    (string)$data['password'],
                    trim((string)$data['role']),
                    $id
                ]
            );
        } else {
            Database::execute(
                "UPDATE `users` SET name=?, username=?, email=?, role=? WHERE id=?",
                [
                    trim((string)$data['name']),
                    $username,
                    $email,
                    trim((string)$data['role']),
                    $id
                ]
            );
        }
    }
}
