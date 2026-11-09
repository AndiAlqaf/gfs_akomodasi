<?php

namespace App\Models;

use App\Core\Database;
use App\Core\Crypto;

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
                ['Super Administrator', 'superadmin', 'superadmin@gfsceria.com', Crypto::encrypt('password123'), 'super'],
                ['System Administrator', 'admin', 'admin@gfsceria.com', Crypto::encrypt('password123'), 'admin'],
                ['Front Office Staff', 'frontoffice', 'frontoffice@gfsceria.com', Crypto::encrypt('password123'), 'fron'],
                ['Supervisor Staff', 'supervisor', 'supervisor@gfsceria.com', Crypto::encrypt('password123'), 'supervisor'],
                ['Canteen Officer', 'canteen', 'canteen@gfsceria.com', Crypto::encrypt('password123'), 'canteen'],
                ['Laundry Dropper', 'laundrydrop', 'laundr@gfsceria.com', Crypto::encrypt('password123'), 'laundr'],
                ['Transport Driver', 'driver', 'driver@gfsceria.com', Crypto::encrypt('password123'), 'driver'],
                ['Laundry Cleaner', 'laundry', 'laundry@gfsceria.com', Crypto::encrypt('password123'), 'laundry'],
                ['Hermansyah Marzuki', 'hermansm', 'hermansyah.marzuki@cmprima.com', Crypto::encrypt('gfs04'), 'admin'],
                ['Muhammad Idul', 'muhIdul', 'muhammad.idul@cerindocorp.co.id', Crypto::encrypt('654321'), 'admin'],
                ['Ummu Atia Ahmad', 'ummua', 'ummu.ahmad@cerindocorp.co.id', Crypto::encrypt('280900'), 'admin']
            ];

            $count = Database::fetchColumn("SELECT COUNT(*) FROM `users`");
            if ($count == 0) {
                foreach ($presets as $p) {
                    Database::execute("INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`) VALUES (?, ?, ?, ?, ?)", $p);
                }
            } else {
                // Ensure the 3 new admin accounts exist in existing databases
                $additionalAdmins = [
                    ['Hermansyah Marzuki', 'hermansm', 'hermansyah.marzuki@cmprima.com', Crypto::encrypt('gfs04'), 'admin'],
                    ['Muhammad Idul', 'muhIdul', 'muhammad.idul@cerindocorp.co.id', Crypto::encrypt('654321'), 'admin'],
                    ['Ummu Atia Ahmad', 'ummua', 'ummu.ahmad@cerindocorp.co.id', Crypto::encrypt('280900'), 'admin']
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

            // 3. Auto-encrypt any legacy unencrypted plaintext passwords in the database
            $unencryptedUsers = Database::fetchAll("SELECT id, password FROM `users` WHERE password NOT LIKE 'ENC:%'");
            if (is_array($unencryptedUsers)) {
                foreach ($unencryptedUsers as $u) {
                    if (!empty($u['password'])) {
                        $enc = Crypto::encrypt($u['password']);
                        Database::execute("UPDATE `users` SET password = ? WHERE id = ?", [$enc, $u['id']]);
                    }
                }
            }
        } catch (\Exception $e) {
            // Ignore DB init errors
        }
    }

    public function getAllUsers()
    {
        $users = Database::fetchAll("SELECT id, name, username, email, password, role, created_at FROM `users` ORDER BY id ASC");
        foreach ($users as &$user) {
            $raw = (string)($user['password'] ?? '');
            if (!Crypto::isEncrypted($raw)) {
                // Auto-encrypt in DB
                $encrypted = Crypto::encrypt($raw);
                Database::execute("UPDATE `users` SET password = ? WHERE id = ?", [$encrypted, $user['id']]);
                // Keep plain text for human readability on the website
            } else {
                // Decrypt into human-readable plain text ("bahasa manusia") for display in Manage Accounts
                $user['password'] = Crypto::decrypt($raw);
            }
        }
        unset($user);
        return $users;
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
                "SELECT id, name, username, email, role, password FROM `users` WHERE role = 'super' OR role = 'superadmin' OR role = 'super_admin' ORDER BY id ASC LIMIT 1"
            );
        }

        if ($user && Crypto::verifyPassword((string)$password, (string)$user['password'])) {
            // If the database had legacy plaintext password, auto-encrypt it now
            if (!Crypto::isEncrypted($user['password'])) {
                $enc = Crypto::encrypt($user['password']);
                Database::execute("UPDATE `users` SET password = ? WHERE id = ?", [$enc, $user['id']]);
            }

            unset($user['password']);
            $roleLower = strtolower(trim((string)($user['role'] ?? '')));
            if (in_array($roleLower, ['superadmin', 'super_admin', 'super admin', 'superadministrator'], true)) {
                $user['role'] = 'super';
            }
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

        $role = trim((string)($data['role'] ?? 'admin'));
        if (in_array(strtolower($role), ['superadmin', 'super_admin', 'super admin'], true)) {
            $role = 'super';
        }

        // Encrypt password before saving into database
        $rawPassword = (string)($data['password'] ?? 'password123');
        $encryptedPassword = Crypto::encrypt($rawPassword);

        Database::execute(
            "INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`) VALUES (?, ?, ?, ?, ?)",
            [
                trim((string)$data['name']),
                $username,
                $email,
                $encryptedPassword,
                $role
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

        $role = trim((string)($data['role'] ?? 'admin'));
        if (in_array(strtolower($role), ['superadmin', 'super_admin', 'super admin'], true)) {
            $role = 'super';
        }

        if (isset($data['password']) && trim((string)$data['password']) !== '') {
            // Encrypt new password before updating database
            $encryptedPassword = Crypto::encrypt(trim((string)$data['password']));
            Database::execute(
                "UPDATE `users` SET name=?, username=?, email=?, password=?, role=? WHERE id=?",
                [
                    trim((string)$data['name']),
                    $username,
                    $email,
                    $encryptedPassword,
                    $role,
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
                    $role,
                    $id
                ]
            );
        }
    }
}
