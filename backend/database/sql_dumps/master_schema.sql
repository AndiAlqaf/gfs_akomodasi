-- ====================================================================
-- MASTER SCHEMA SQL DUMP - SILARIA (GFS CERIA ACCOMMODATION SYSTEM)
-- Database: gfs_akomodasi
-- Compatible for clean install or update via phpMyAdmin / MySQL CLI
-- Includes 14 operational tables & default seeds (including 8 Roles in users table)
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Table structure for table `areas`
CREATE TABLE IF NOT EXISTS `areas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `area_name` varchar(150) NOT NULL,
  `area_id` varchar(50) NOT NULL,
  `registered_by` varchar(100) DEFAULT NULL,
  `last_registration` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `area_id` (`area_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table structure for table `messes`
CREATE TABLE IF NOT EXISTS `messes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mess_name` varchar(150) NOT NULL,
  `area_id` int(11) DEFAULT NULL,
  `total_rooms` int(11) DEFAULT 0,
  `available_rooms` int(11) DEFAULT 0,
  `status` varchar(50) DEFAULT 'Active',
  `remarks` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `area_id` (`area_id`),
  CONSTRAINT `fk_mess_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table structure for table `rooms`
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_number` varchar(50) NOT NULL,
  `mess_id` int(11) DEFAULT NULL,
  `capacity` int(11) DEFAULT 1,
  `status` varchar(50) DEFAULT 'Available',
  `remarks` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mess_id` (`mess_id`),
  CONSTRAINT `fk_room_mess` FOREIGN KEY (`mess_id`) REFERENCES `messes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table structure for table `meals_dp`
CREATE TABLE IF NOT EXISTS `meals_dp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dp_name` varchar(150) NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table structure for table `laundry_dp`
CREATE TABLE IF NOT EXISTS `laundry_dp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dp_name` varchar(150) NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Table structure for table `laundry_bag`
CREATE TABLE IF NOT EXISTS `laundry_bag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bag_number` varchar(50) NOT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Available',
  PRIMARY KEY (`id`),
  UNIQUE KEY `bag_number` (`bag_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Table structure for table `guests`
CREATE TABLE IF NOT EXISTS `guests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `occupants_category` varchar(100) DEFAULT NULL,
  `institution_company` varchar(150) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Checked-In',
  `meals_packages` varchar(100) DEFAULT NULL,
  `breakfast_dp` varchar(100) DEFAULT NULL,
  `lunch_dp` varchar(100) DEFAULT NULL,
  `dinner_dp` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `fk_guest_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Table structure for table `reservations`
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guest_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `check_in` datetime DEFAULT NULL,
  `check_out` datetime DEFAULT NULL,
  `estimated_arrival` datetime DEFAULT NULL,
  `estimated_departure` datetime DEFAULT NULL,
  `guest_status` varchar(50) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `guest_id` (`guest_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `fk_res_guest` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_res_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Table structure for table `laundry_services`
CREATE TABLE IF NOT EXISTS `laundry_services` (
  `id` varchar(50) NOT NULL,
  `roomNo` varchar(50) DEFAULT NULL,
  `guestName` varchar(150) DEFAULT NULL,
  `laundryBagId` varchar(100) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT 0.00,
  `status` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Table structure for table `laundry_transactions`
CREATE TABLE IF NOT EXISTS `laundry_transactions` (
  `id` varchar(50) NOT NULL,
  `room` varchar(50) DEFAULT NULL,
  `guest_name` varchar(100) DEFAULT NULL,
  `laundry_bag_id` varchar(50) DEFAULT NULL,
  `laundry_box_id` varchar(50) DEFAULT NULL,
  `services_package` varchar(50) DEFAULT 'Regular',
  `drop_point` varchar(100) DEFAULT NULL,
  `drop_date` datetime DEFAULT NULL,
  `distribute_date` datetime DEFAULT NULL,
  `deliver_date` datetime DEFAULT NULL,
  `return_date` datetime DEFAULT NULL,
  `receiving_date` datetime DEFAULT NULL,
  `bag_status` varchar(50) DEFAULT 'Pending',
  `weight` decimal(5,2) DEFAULT NULL,
  `no_of_pcs_total` int(11) DEFAULT 0,
  `current_status` varchar(50) DEFAULT 'DROPPED_AT_POINT',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Table structure for table `laundry_details`
CREATE TABLE IF NOT EXISTS `laundry_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(50) DEFAULT NULL,
  `clothes_no` int(11) DEFAULT NULL,
  `clothes_type` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `colour` varchar(50) DEFAULT NULL,
  `size` varchar(20) DEFAULT NULL,
  `no_of_pcs` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `transaction_id` (`transaction_id`),
  CONSTRAINT `fk_laundry_trans` FOREIGN KEY (`transaction_id`) REFERENCES `laundry_transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Table structure for table `meals_on_request`
CREATE TABLE IF NOT EXISTS `meals_on_request` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `guest_name` varchar(150) NOT NULL,
  `request_by` varchar(100) DEFAULT NULL,
  `approved_by` varchar(100) DEFAULT NULL,
  `meals_package` varchar(100) DEFAULT NULL,
  `delivery_point_id` int(11) DEFAULT NULL,
  `meal_time` varchar(50) DEFAULT NULL,
  `no_of_packs` int(11) DEFAULT 1,
  `remark` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'PENDING',
  PRIMARY KEY (`id`),
  KEY `delivery_point_id` (`delivery_point_id`),
  CONSTRAINT `fk_meals_dp` FOREIGN KEY (`delivery_point_id`) REFERENCES `meals_dp` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Table structure for table `meeting_rooms`
CREATE TABLE IF NOT EXISTS `meeting_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` varchar(50) DEFAULT '-',
  `room` varchar(100) NOT NULL,
  `building` varchar(100) NOT NULL,
  `capacity` int(11) NOT NULL,
  `booking_status` varchar(50) DEFAULT 'OPEN',
  `reserved_by` varchar(100) DEFAULT '-',
  `status` varchar(50) DEFAULT '-',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default meeting rooms if table is empty
INSERT INTO `meeting_rooms` (`date`, `room`, `building`, `capacity`, `booking_status`, `reserved_by`, `status`)
SELECT '-', 'TAMBORASI', 'OFFICE U', 17, 'OPEN', '-', '-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `meeting_rooms` LIMIT 1);
INSERT INTO `meeting_rooms` (`date`, `room`, `building`, `capacity`, `booking_status`, `reserved_by`, `status`)
SELECT '-', 'TJ. MALAHA-1', 'OFFICE U', 10, 'OPEN', '-', '-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `meeting_rooms` WHERE `room` = 'TJ. MALAHA-1');
INSERT INTO `meeting_rooms` (`date`, `room`, `building`, `capacity`, `booking_status`, `reserved_by`, `status`)
SELECT '-', 'TJ. MALAHA-2', 'OFFICE U', 10, 'OPEN', '-', '-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `meeting_rooms` WHERE `room` = 'TJ. MALAHA-2');
INSERT INTO `meeting_rooms` (`date`, `room`, `building`, `capacity`, `booking_status`, `reserved_by`, `status`)
SELECT '-', 'PROCESS PLANT', 'OFFICE U', 10, 'OPEN', '-', '-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `meeting_rooms` WHERE `room` = 'PROCESS PLANT');
INSERT INTO `meeting_rooms` (`date`, `room`, `building`, `capacity`, `booking_status`, `reserved_by`, `status`)
SELECT '-', 'SUPPORTING', 'OFFICE U', 30, 'OPEN', '-', '-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `meeting_rooms` WHERE `room` = 'SUPPORTING');
INSERT INTO `meeting_rooms` (`date`, `room`, `building`, `capacity`, `booking_status`, `reserved_by`, `status`)
SELECT '-', 'BABARINA-1', 'OFFICE U', 50, 'OPEN', '-', '-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `meeting_rooms` WHERE `room` = 'BABARINA-1');
INSERT INTO `meeting_rooms` (`date`, `room`, `building`, `capacity`, `booking_status`, `reserved_by`, `status`)
SELECT '-', 'BABARINA-2', 'OFFICE U', 40, 'OPEN', '-', '-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `meeting_rooms` WHERE `room` = 'BABARINA-2');
INSERT INTO `meeting_rooms` (`date`, `room`, `building`, `capacity`, `booking_status`, `reserved_by`, `status`)
SELECT '-', 'BABARINA-3', 'OFFICE U', 50, 'OPEN', '-', '-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `meeting_rooms` WHERE `room` = 'BABARINA-3');
INSERT INTO `meeting_rooms` (`date`, `room`, `building`, `capacity`, `booking_status`, `reserved_by`, `status`)
SELECT '-', 'BABARINA-4', 'OFFICE U', 60, 'OPEN', '-', '-' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `meeting_rooms` WHERE `room` = 'BABARINA-4');

-- 14. Table structure for table `users` (User Management & 8 Roles)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default 8 role accounts if table is empty
INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`)
SELECT 'Super Administrator', 'superadmin', 'superadmin@gfsceria.com', 'password123', 'super' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `users` LIMIT 1);
INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`)
SELECT 'System Administrator', 'admin', 'admin@gfsceria.com', 'password123', 'admin' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `username` = 'admin');
INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`)
SELECT 'Front Office Staff', 'frontoffice', 'frontoffice@gfsceria.com', 'password123', 'fron' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `username` = 'frontoffice');
INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`)
SELECT 'Supervisor Staff', 'supervisor', 'supervisor@gfsceria.com', 'password123', 'supervisor' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `username` = 'supervisor');
INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`)
SELECT 'Canteen Officer', 'canteen', 'canteen@gfsceria.com', 'password123', 'canteen' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `username` = 'canteen');
INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`)
SELECT 'Laundry Dropper', 'laundrydrop', 'laundr@gfsceria.com', 'password123', 'laundr' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `username` = 'laundrydrop');
INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`)
SELECT 'Transport Driver', 'driver', 'driver@gfsceria.com', 'password123', 'driver' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `username` = 'driver');
INSERT INTO `users` (`name`, `username`, `email`, `password`, `role`)
SELECT 'Laundry Cleaner', 'laundry', 'laundry@gfsceria.com', 'password123', 'laundry' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `username` = 'laundry');

SET FOREIGN_KEY_CHECKS = 1;
