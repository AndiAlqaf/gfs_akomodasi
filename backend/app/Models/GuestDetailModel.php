<?php

namespace App\Models;

use App\Core\Database;

class GuestDetailModel extends BaseModel
{
    protected $table = 'guest_details';

    public function __construct()
    {
        $this->ensureTableAndSeed();
    }

    public function ensureTableAndSeed()
    {
        Database::execute("
            CREATE TABLE IF NOT EXISTS `guest_details` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `name` varchar(150) NOT NULL,
              `institution_company` varchar(100) DEFAULT NULL,
              `occupants_category` varchar(100) DEFAULT NULL,
              `personal_identification` varchar(100) DEFAULT NULL,
              `reg_id_card` varchar(100) DEFAULT NULL,
              `job` varchar(100) DEFAULT NULL,
              `position` varchar(100) DEFAULT NULL,
              `level_category` varchar(100) DEFAULT NULL,
              `department` varchar(100) DEFAULT NULL,
              `meals_packages` varchar(100) DEFAULT NULL,
              `breakfast_dp` varchar(100) DEFAULT NULL,
              `lunch_dp` varchar(100) DEFAULT NULL,
              `dinner_dp` varchar(100) DEFAULT NULL,
              `registered_by` varchar(100) DEFAULT NULL,
              `last_registration` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
              `remarks` text DEFAULT NULL,
              PRIMARY KEY (`id`),
              KEY `idx_guest_details_name` (`name`),
              KEY `idx_guest_details_reg_id` (`reg_id_card`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        ");

        // Sync any existing guests from `guests` table that are not yet in `guest_details`
        Database::execute("
            INSERT INTO `guest_details` (
                `name`, `institution_company`, `occupants_category`, `personal_identification`,
                `reg_id_card`, `job`, `position`, `level_category`, `department`,
                `meals_packages`, `breakfast_dp`, `lunch_dp`, `dinner_dp`,
                `registered_by`, `last_registration`, `remarks`
            )
            SELECT
                g.`name`, g.`institution_company`, g.`occupants_category`, g.`personal_identification`,
                g.`reg_id_card`, g.`job`, g.`position`, g.`level_category`, g.`department`,
                g.`meals_packages`, g.`breakfast_dp`, g.`lunch_dp`, g.`dinner_dp`,
                g.`registered_by`, COALESCE(g.`last_registration`, NOW()), g.`remarks`
            FROM `guests` g
            WHERE g.`id` IN (
                SELECT MIN(g2.`id`)
                FROM `guests` g2
                WHERE TRIM(COALESCE(g2.`name`, '')) != ''
                  AND UPPER(TRIM(g2.`name`)) NOT LIKE 'VACANT%'
                GROUP BY UPPER(TRIM(g2.`name`)), COALESCE(TRIM(g2.`reg_id_card`), '')
            )
              AND NOT EXISTS (
                  SELECT 1 FROM `guest_details` gd
                  WHERE UPPER(TRIM(gd.`name`)) = UPPER(TRIM(g.`name`))
                    AND COALESCE(TRIM(gd.`reg_id_card`), '') = COALESCE(TRIM(g.`reg_id_card`), '')
              )
        ");
    }

    public function upsertFromGuestData(array $data, string $registeredBy = 'System')
    {
        $name = trim($data['name'] ?? '');
        if ($name === '' || stripos($name, 'VACANT') === 0) {
            return;
        }

        $regId = trim($data['reg_id_card'] ?? '');
        if ($regId !== '') {
            $existing = Database::fetch(
                "SELECT id FROM guest_details WHERE UPPER(TRIM(name)) = UPPER(TRIM(?)) OR TRIM(reg_id_card) = ? LIMIT 1",
                [$name, $regId]
            );
        } else {
            $existing = Database::fetch(
                "SELECT id FROM guest_details WHERE UPPER(TRIM(name)) = UPPER(TRIM(?)) LIMIT 1",
                [$name]
            );
        }

        if ($existing) {
            Database::execute(
                "UPDATE guest_details SET
                    name = ?, institution_company = ?, occupants_category = ?,
                    personal_identification = ?, reg_id_card = ?, job = ?,
                    position = ?, level_category = ?, department = ?,
                    meals_packages = ?, breakfast_dp = ?, lunch_dp = ?,
                    dinner_dp = ?, remarks = ?
                 WHERE id = ?",
                [
                    $name,
                    $data['institution_company'] ?? '',
                    $data['occupants_category'] ?? 'REGULAR GUEST',
                    $data['personal_identification'] ?? '',
                    $regId,
                    $data['job'] ?? '',
                    $data['position'] ?? '',
                    $data['level_category'] ?? '',
                    $data['department'] ?? '',
                    $data['meals_packages'] ?? '',
                    $data['breakfast_dp'] ?? '',
                    $data['lunch_dp'] ?? '',
                    $data['dinner_dp'] ?? '',
                    $data['remarks'] ?? '',
                    $existing['id']
                ]
            );
        } else {
            Database::execute(
                "INSERT INTO guest_details (
                    name, institution_company, occupants_category, personal_identification,
                    reg_id_card, job, position, level_category, department,
                    meals_packages, breakfast_dp, lunch_dp, dinner_dp,
                    registered_by, remarks
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $name,
                    $data['institution_company'] ?? '',
                    $data['occupants_category'] ?? 'REGULAR GUEST',
                    $data['personal_identification'] ?? '',
                    $regId,
                    $data['job'] ?? '',
                    $data['position'] ?? '',
                    $data['level_category'] ?? '',
                    $data['department'] ?? '',
                    $data['meals_packages'] ?? '',
                    $data['breakfast_dp'] ?? '',
                    $data['lunch_dp'] ?? '',
                    $data['dinner_dp'] ?? '',
                    $registeredBy,
                    $data['remarks'] ?? ''
                ]
            );
        }
    }
}
