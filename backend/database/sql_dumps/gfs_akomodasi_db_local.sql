-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 08, 2026 at 07:14 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gfs_akomodasi_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `areas`
--

CREATE TABLE `areas` (
  `id` int(11) NOT NULL,
  `area_name` varchar(100) NOT NULL,
  `area_id` varchar(50) NOT NULL,
  `registered_by` varchar(100) DEFAULT NULL,
  `last_registration` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `areas`
--

INSERT INTO `areas` (`id`, `area_name`, `area_id`, `registered_by`, `last_registration`, `remarks`) VALUES
(1, 'LIVING RESIDENCE 1', 'LIV.RES.01', 'Admin', '2026-06-24 10:41:08', ''),
(2, 'LIVING RESIDENCE 2', 'LIV.RES.02', 'Admin', '2026-06-24 10:41:08', ''),
(3, 'LIVING RESIDENCE 3', 'LIV.RES.03', 'Admin', '2026-06-24 10:41:08', ''),
(4, 'SAMAENRE RESIDENCE', 'SAM.RES.01', 'Admin', '2026-06-24 10:41:08', ''),
(5, 'SAMAENRE VILLAGE', 'SAM.VIL.01', 'Admin', '2026-06-24 10:41:08', ''),
(6, 'SAMAENRE EX MESS PP', 'SAM.EXP.01', 'Admin', '2026-06-24 10:41:08', ''),
(7, 'MINING OFFICE', 'MIN.OFF.01', 'Admin', '2026-06-24 10:41:08', ''),
(8, 'SMELTER PT. CMP', 'SML.CMP.01', 'Admin', '2026-06-24 10:41:08', ''),
(9, 'WOLO LABORATORY', 'WOL.LAB.01', 'Admin', '2026-06-24 10:41:08', '');

-- --------------------------------------------------------

--
-- Table structure for table `guests`
--

CREATE TABLE `guests` (
  `id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `institution_company` varchar(100) DEFAULT NULL,
  `occupants_category` varchar(100) DEFAULT NULL,
  `personal_identification` varchar(100) DEFAULT NULL,
  `reg_id_card` varchar(100) DEFAULT NULL,
  `job` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `level_category` varchar(100) DEFAULT NULL,
  `meals_packages` varchar(100) DEFAULT NULL,
  `breakfast_dp` varchar(100) DEFAULT NULL,
  `lunch_dp` varchar(100) DEFAULT NULL,
  `dinner_dp` varchar(100) DEFAULT NULL,
  `registered_by` varchar(100) DEFAULT NULL,
  `last_registration` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guests`
--

INSERT INTO `guests` (`id`, `room_id`, `name`, `institution_company`, `occupants_category`, `personal_identification`, `reg_id_card`, `job`, `position`, `level_category`, `meals_packages`, `breakfast_dp`, `lunch_dp`, `dinner_dp`, `registered_by`, `last_registration`, `remarks`) VALUES
(1, 1, 'SUNARTO URJOYO PURBA', 'PT. CMP', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'HSE MANAGER', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(2, 2, 'CHRISTIAN BAMBANG KHRISNA MUKTI', 'PT. CMP', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'FURNACE MANAGER', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(3, 3, 'MR. ZHENG BU DONG', 'ENFI', 'SPECIAL GUEST', '', '', 'CONSULTANT', 'ENFI DIRECTOR', 'BOD', 'STANDARD BUFFET', 'ENFI CANTEEN', 'ENFI CANTEEN', 'ENFI CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(4, 5, 'TA\'DUNG', 'PT. CMP', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'OPERATIONAL SMELTER SPECIALIST', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'SATELIT CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(5, 6, 'REINHARD SIAHAAN', 'PT. CMP', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'EMU GENERAL MANAGER', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'SATELIT CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(6, 7, 'SUWARTO PRAWIROATMODJO', 'PT. CNI', 'SPECIAL GUEST', '', '', 'EMPLOYEE', 'ADVISOR', 'SENIOR STAFF', 'ROOM DELIVERY', 'STAY MESS', 'OFFICE U SMELTER CANTEEN', 'STAY MESS', NULL, '2026-06-24 10:41:09', NULL),
(7, 8, 'ANDRE CH MR DAENUWY', 'PT. CNI', 'SPECIAL GUEST', '', '', 'EMPLOYEE', 'ADVISOR', 'SENIOR STAFF', 'ROOM DELIVERY', 'STAY MESS', 'OFFICE U SMELTER CANTEEN', 'STAY MESS', NULL, '2026-06-24 10:41:09', NULL),
(8, 9, 'SLAMET SURYANTO', 'PT. CMP', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'ENGINEERING MAINTENANCE & UTILITIES SPECIALIST', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(9, 10, 'SYAMSI BUANG', 'PT. CMP', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'PROCESS OPERATION GENERAL MANAGER', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(10, 11, 'ROIMON BARUS', 'PT. CNI', 'REGULAR GUEST', '', '', 'EXECUTIVE', 'PT. CMP SMELTER DIRECTOR', 'BOD', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(11, 12, 'YARIS TANDI', 'PT. CNI', 'SPECIAL GUEST', '', '', 'EMPLOYEE', 'ADVISOR', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(12, 13, 'ALIMUDDIN TOLA', 'PT. CNI', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'DRYER MANAGER', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(13, 14, 'BUSYAIRI', 'PT. CMP', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'PROCESS PLANT MAINTENANCE MANAGER', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(14, 15, 'IMRAN ROSJADI PABITJARA', 'PT. CMP', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'OR SR. SPECIALIST', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(15, 16, 'AGUSTINUS LONTOH', 'PT. CMP', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'OR SR. SPECIALIST', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(16, 17, 'ANDI MAPPASELA', 'PT. CNI', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'GENERAL FACILITIES SERFICES GENERAL MANAGER', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(17, 18, 'LUSYAN TADUNG', 'PT. CMP', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'MANAGER UTILITIES', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(18, 19, 'ALFINA WIJANARNO', 'PT. CMP', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'EMU MANAGER', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(19, 20, 'ALIM SIDDIQ SOLEH', 'PT. CMP', 'REGULAR GUEST', '', '', 'EMPLOYEE', 'REDUCTION KILN MANAGER', 'SENIOR STAFF', 'STANDARD BUFFET', 'SATELIT CANTEEN', 'OFFICE U SMELTER CANTEEN', 'SATELIT CANTEEN', NULL, '2026-06-24 10:41:09', NULL),
(20, NULL, 'AL', NULL, 'REGULAR GUEST', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-03 19:26:20', NULL),
(21, NULL, 'Ryan', NULL, 'SPECIAL GUEST', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-03 19:48:08', NULL),
(22, NULL, 'tess', NULL, 'SPECIAL GUEST', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-05 20:56:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `laundry_bag`
--

CREATE TABLE `laundry_bag` (
  `id` int(11) NOT NULL,
  `nama` varchar(150) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `laundry_bag` varchar(100) DEFAULT NULL,
  `laundry_box` varchar(100) DEFAULT NULL,
  `registered_by` varchar(100) DEFAULT NULL,
  `last_registration` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `laundry_bag`
--

INSERT INTO `laundry_bag` (`id`, `nama`, `room_id`, `laundry_bag`, `laundry_box`, `registered_by`, `last_registration`, `remarks`) VALUES
(1, 'SUNARTO URJOYO PURBA', 1, 'LH.01.01 (SUNARTO)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(2, 'CHRISTIAN BAMBANG KHRISNA MUKTI', 2, 'LH.01.02 (KHRISNA)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(3, 'MR. ZHENG BU DONG', 3, 'LH.02.01 (MR. ZHENG)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(4, 'TA\'DUNG', 5, 'LH.03.01 (TA\'DUNG)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(5, 'REINHARD SIAHAAN', 6, 'LH.03.02 (REINHARD)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(6, 'SUWARTO PRAWIROATMODJO', 7, 'LH.04.01 (SUWARTO)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(7, 'ANDRE CH MR DAENUWY', 8, 'LH.04.02 (ANDRE. D)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(8, 'SLAMET SURYANTO', 9, 'LH.05.01 (SLAMET. S)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(9, 'SYAMSI BUANG', 10, 'LH.05.02 (SYAMSI. B)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(10, 'ROIMON BARUS', 11, 'LH.06.01 (ROIMON. B)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(11, 'YARIS TANDI', 12, 'LH.06.02 (YARIS. T)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(12, 'ALIMUDDIN TOLA', 13, 'LH.07.01 (ALIMUDDIN. T)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(13, 'BUSYAIRI', 14, 'LH.07.02 (BUSYARI)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(14, 'IMRAN ROSJADI PABITJARA', 15, 'LH.08.01 (IMRAN. R)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(15, 'AGUSTINUS LONTOH', 16, 'LH.08.02 (AGUS. L)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(16, 'ANDI MAPPASELA', 17, 'LH.09.01 (A. MAPPASELLE)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(17, 'LUSYAN TADUNG', 18, 'LH.09.02 (LUSYAN. T)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(18, 'ALFINA WIJANARNO', 19, 'LH.10.01 (ALFINA. W)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL),
(19, 'ALIM SIDDIQ SOLEH', 20, 'LH.10.02 (ALIM. S)', 'LANDED HOUSE', NULL, '2026-06-24 10:41:09', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `laundry_details`
--

CREATE TABLE `laundry_details` (
  `id` int(11) NOT NULL,
  `transaction_id` varchar(50) DEFAULT NULL,
  `clothes_no` int(11) DEFAULT NULL,
  `clothes_type` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `colour` varchar(50) DEFAULT NULL,
  `size` varchar(20) DEFAULT NULL,
  `no_of_pcs` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `laundry_dp`
--

CREATE TABLE `laundry_dp` (
  `id` int(11) NOT NULL,
  `point_name` varchar(100) NOT NULL,
  `area_id` int(11) DEFAULT NULL,
  `dp_status` varchar(50) DEFAULT NULL,
  `registered_by` varchar(100) DEFAULT NULL,
  `last_registration` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `laundry_dp`
--

INSERT INTO `laundry_dp` (`id`, `point_name`, `area_id`, `dp_status`, `registered_by`, `last_registration`, `remarks`) VALUES
(1, 'LDP SAMAENRE', 1, NULL, NULL, '2026-06-24 10:41:09', NULL),
(2, 'LDP LIVING 3', 3, NULL, NULL, '2026-06-24 10:41:09', NULL),
(3, 'LAUNDRY HOUSE LIVING 1', 1, NULL, NULL, '2026-06-24 10:41:09', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `laundry_transactions`
--

CREATE TABLE `laundry_transactions` (
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meals_dp`
--

CREATE TABLE `meals_dp` (
  `id` int(11) NOT NULL,
  `delivery_point` varchar(100) NOT NULL,
  `area_id` int(11) DEFAULT NULL,
  `canteen_status` varchar(50) DEFAULT 'READY',
  `registered_by` varchar(100) DEFAULT NULL,
  `last_registration` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meals_dp`
--

INSERT INTO `meals_dp` (`id`, `delivery_point`, `area_id`, `canteen_status`, `registered_by`, `last_registration`, `remarks`) VALUES
(1, 'SATELIT CANTEEN', 1, 'READY', NULL, '2026-06-24 10:41:09', NULL),
(2, 'EXPAT CANTEEN', 1, 'UNDER REPAIRED', NULL, '2026-06-24 10:41:09', NULL),
(3, 'CENTRAL CANTEEN', 2, 'READY', NULL, '2026-06-24 10:41:09', NULL),
(4, 'LIVING 3 CANTEEN', 3, 'READY', NULL, '2026-06-24 10:41:09', NULL),
(5, 'SAMAENRE CANTEEN', 4, 'READY', NULL, '2026-06-24 10:41:09', NULL),
(6, 'VIP A1 VENUE', 4, 'READY', NULL, '2026-06-24 10:41:09', NULL),
(7, 'VIP A2 VENUE', 4, 'READY', NULL, '2026-06-24 10:41:09', NULL),
(8, 'MINING CANTEEN', 7, 'READY', NULL, '2026-06-24 10:41:09', NULL),
(9, 'OFFICE U SMELTER CANTEEN', 8, 'READY', NULL, '2026-06-24 10:41:09', NULL),
(10, 'EXPLORATION MESS CANTEEN', 6, 'READY', NULL, '2026-06-24 10:41:09', NULL),
(11, 'WOLO CANTEEN', 9, 'READY', NULL, '2026-06-24 10:41:09', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `meals_on_request`
--

CREATE TABLE `meals_on_request` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `guest_name` varchar(150) NOT NULL,
  `request_by` varchar(100) DEFAULT NULL,
  `approved_by` varchar(100) DEFAULT NULL,
  `meals_package` varchar(100) DEFAULT NULL,
  `delivery_point_id` int(11) DEFAULT NULL,
  `meal_time` varchar(50) DEFAULT NULL,
  `no_of_packs` int(11) DEFAULT 1,
  `remark` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'PENDING'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meals_on_request`
--

INSERT INTO `meals_on_request` (`id`, `date`, `guest_name`, `request_by`, `approved_by`, `meals_package`, `delivery_point_id`, `meal_time`, `no_of_packs`, `remark`, `status`) VALUES
(1, '2026-06-24', 'Kunjungan Instansi Terkait', 'Canteen Officer A', 'Canteen Supervisor B', 'VIP Buffet', 6, 'LUNCH', 10, 'Tamu Khusus', 'APPROVED'),
(2, '2026-06-24', 'Tamu Perusahaan', 'Canteen Officer A', '', 'Standard Buffet', 1, 'DINNER', 5, 'Tambahan', 'PENDING');

-- --------------------------------------------------------

--
-- Table structure for table `meeting_rooms`
--

CREATE TABLE `meeting_rooms` (
  `id` int(11) NOT NULL,
  `date` varchar(50) DEFAULT '-',
  `room` varchar(100) NOT NULL,
  `building` varchar(100) NOT NULL,
  `capacity` int(11) NOT NULL,
  `booking_status` varchar(50) DEFAULT 'OPEN',
  `reserved_by` varchar(100) DEFAULT '-',
  `status` varchar(50) DEFAULT '-',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meeting_rooms`
--

INSERT INTO `meeting_rooms` (`id`, `date`, `room`, `building`, `capacity`, `booking_status`, `reserved_by`, `status`, `created_at`) VALUES
(1, '-', 'TAMBORASI', 'OFFICE U', 17, 'OPEN', '-', '-', '2026-07-02 13:53:17'),
(2, '-', 'TJ. MALAHA-1', 'OFFICE U', 10, 'OPEN', '-', '-', '2026-07-02 13:53:17'),
(3, '-', 'TJ. MALAHA-2', 'OFFICE U', 10, 'OPEN', '-', '-', '2026-07-02 13:53:17'),
(4, '-', 'PROCESS PLANT', 'OFFICE U', 10, 'OPEN', '-', '-', '2026-07-02 13:53:17'),
(5, '-', 'SUPPORTING', 'OFFICE U', 30, 'OPEN', '-', '-', '2026-07-02 13:53:17'),
(6, '-', 'BABARINA-1', 'OFFICE U', 50, 'OPEN', '-', '-', '2026-07-02 13:53:17'),
(7, '-', 'BABARINA-2', 'OFFICE U', 40, 'OPEN', '-', '-', '2026-07-02 13:53:17'),
(8, '-', 'BABARINA-3', 'OFFICE U', 50, 'OPEN', '-', '-', '2026-07-02 13:53:17'),
(9, '-', 'BABARINA-4', 'OFFICE U', 60, 'OPEN', '-', '-', '2026-07-02 13:53:17');

-- --------------------------------------------------------

--
-- Table structure for table `messes`
--

CREATE TABLE `messes` (
  `id` int(11) NOT NULL,
  `mess_name` varchar(100) NOT NULL,
  `mess_id` varchar(50) NOT NULL,
  `area_id` int(11) DEFAULT NULL,
  `rooms_count` int(11) DEFAULT 0,
  `mess_status` varchar(50) DEFAULT NULL,
  `managed_by` varchar(100) DEFAULT NULL,
  `registered_by` varchar(100) DEFAULT NULL,
  `last_registration` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messes`
--

INSERT INTO `messes` (`id`, `mess_name`, `mess_id`, `area_id`, `rooms_count`, `mess_status`, `managed_by`, `registered_by`, `last_registration`, `remarks`) VALUES
(1, 'LANDED HOUSE-01', 'CMP.MES.LH.01', 1, 2, 'OWNED BY CERIA', 'PT. CMP', NULL, '2026-06-24 10:41:08', NULL),
(2, 'LANDED HOUSE-02', 'CMP.MES.LH.02', 1, 2, 'OWNED BY CERIA', 'PT. CMP', NULL, '2026-06-24 10:41:08', NULL),
(3, 'LANDED HOUSE-03', 'CMP.MES.LH.03', 1, 2, 'OWNED BY CERIA', 'PT. CMP', NULL, '2026-06-24 10:41:08', NULL),
(4, 'LANDED HOUSE-04', 'CMP.MES.LH.04', 1, 2, 'OWNED BY CERIA', 'PT. CMP', NULL, '2026-06-24 10:41:08', NULL),
(5, 'LANDED HOUSE-05', 'CMP.MES.LH.05', 1, 2, 'OWNED BY CERIA', 'PT. CMP', NULL, '2026-06-24 10:41:08', NULL),
(6, 'LANDED HOUSE-06', 'CMP.MES.LH.06', 1, 2, 'OWNED BY CERIA', 'PT. CMP', NULL, '2026-06-24 10:41:08', NULL),
(7, 'LANDED HOUSE-07', 'CMP.MES.LH.07', 1, 2, 'OWNED BY CERIA', 'PT. CMP', NULL, '2026-06-24 10:41:08', NULL),
(8, 'LANDED HOUSE-08', 'CMP.MES.LH.08', 1, 2, 'OWNED BY CERIA', 'PT. CMP', NULL, '2026-06-24 10:41:08', NULL),
(9, 'LANDED HOUSE-09', 'CMP.MES.LH.09', 1, 2, 'OWNED BY CERIA', 'PT. CMP', NULL, '2026-06-24 10:41:08', NULL),
(10, 'LANDED HOUSE-10', 'CMP.MES.LH.10', 1, 2, 'OWNED BY CERIA', 'PT. CMP', NULL, '2026-06-24 10:41:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `guest_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `estimated_arrival` datetime DEFAULT NULL,
  `estimated_departure` datetime DEFAULT NULL,
  `check_in` datetime DEFAULT NULL,
  `check_out` datetime DEFAULT NULL,
  `guest_status` varchar(50) DEFAULT NULL,
  `remark` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `guest_id`, `room_id`, `estimated_arrival`, `estimated_departure`, `check_in`, `check_out`, `guest_status`, `remark`) VALUES
(1, 1, 1, NULL, NULL, '2026-06-01 00:00:00', NULL, 'ON SITE', ''),
(2, 2, 2, NULL, NULL, '2026-06-01 00:00:00', NULL, 'ON SITE', ''),
(3, 3, 3, NULL, NULL, NULL, '2026-06-01 00:00:00', 'OFF SITE', ''),
(4, 4, 5, NULL, NULL, '2026-06-01 00:00:00', NULL, 'ON SITE', ''),
(5, 5, 6, NULL, NULL, '2026-06-01 00:00:00', NULL, 'ON SITE', ''),
(6, 6, 7, NULL, NULL, NULL, '2026-06-02 00:00:00', 'OFF SITE', ''),
(7, 7, 8, NULL, NULL, NULL, '2026-06-02 00:00:00', 'OFF SITE', ''),
(8, 8, 9, NULL, NULL, '2026-06-01 00:00:00', NULL, 'ON SITE', ''),
(9, 9, 10, NULL, NULL, NULL, '2026-06-01 00:00:00', 'ON SITE', ''),
(10, 10, 11, NULL, NULL, '2026-06-01 00:00:00', NULL, 'ON SITE', ''),
(11, 11, 12, NULL, NULL, NULL, '2026-06-03 00:00:00', 'OFF SITE', ''),
(12, 12, 13, NULL, NULL, NULL, '2026-06-03 00:00:00', 'OFF SITE', ''),
(13, 13, 14, NULL, NULL, '2026-06-01 00:00:00', NULL, 'ON SITE', ''),
(14, 14, 15, NULL, NULL, '2026-06-01 00:00:00', NULL, 'ON SITE', ''),
(15, 15, 16, NULL, NULL, '2026-06-01 00:00:00', '2026-06-24 12:36:29', 'OFF SITE', ''),
(16, 16, 17, NULL, NULL, '2026-06-01 00:00:00', '2026-06-15 00:00:00', 'OFF SITE', ''),
(17, 17, 18, NULL, NULL, '2026-06-01 00:00:00', NULL, 'ON SITE', ''),
(18, 18, 19, NULL, NULL, '2026-06-01 00:00:00', '2026-07-03 19:29:19', 'OFF SITE', ''),
(19, 19, 20, NULL, NULL, '2026-06-01 00:00:00', '2026-07-03 19:25:38', 'OFF SITE', ''),
(20, 12, 13, NULL, NULL, '2026-07-02 21:38:10', '2026-07-03 19:25:30', 'OFF SITE', ''),
(21, 3, 3, NULL, NULL, '2026-06-17 00:00:00', '2026-07-02 21:02:53', 'OFF SITE', ''),
(22, 6, 7, '2026-06-20 00:00:00', '2026-06-30 00:00:00', '2026-06-24 12:40:58', '2026-06-24 12:41:16', 'OFF SITE', ''),
(23, 7, 8, '2026-06-20 00:00:00', '2026-06-30 00:00:00', '2026-06-24 11:03:16', '2026-06-24 11:03:18', 'OFF SITE', ''),
(24, 20, 13, '2026-07-03 11:26:20', '2026-07-08 11:26:20', '2026-07-05 20:20:47', '2026-07-05 20:20:49', 'OFF SITE', NULL),
(25, 21, 7, '2026-07-03 11:48:08', '2026-07-08 11:48:08', '2026-07-05 20:20:32', '2026-07-05 20:20:33', 'OFF SITE', NULL),
(26, 20, 13, NULL, NULL, NULL, NULL, 'OFF SITE', NULL),
(27, 22, 7, '2026-07-05 12:56:06', '2026-07-10 12:56:06', NULL, NULL, 'SCHEDULED', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `room_no` varchar(50) NOT NULL,
  `mess_id` int(11) DEFAULT NULL,
  `room_allocation` varchar(100) DEFAULT NULL,
  `beds` int(11) DEFAULT 1,
  `room_status` varchar(50) DEFAULT 'READY',
  `registered_by` varchar(100) DEFAULT NULL,
  `last_registration` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `room_no`, `mess_id`, `room_allocation`, `beds`, `room_status`, `registered_by`, `last_registration`, `remarks`) VALUES
(1, 'LH.01.01', 1, 'REGULAR GUEST', 1, 'OCCUPIED', NULL, '2026-06-24 12:40:07', NULL),
(2, 'LH.01.02', 1, 'REGULAR GUEST', 1, 'OCCUPIED', NULL, '2026-06-24 12:40:07', NULL),
(3, 'LH.02.01', 2, 'EXECUTIVE/VIPs GUEST', 1, 'READY', NULL, '2026-07-02 21:02:53', NULL),
(4, 'LH.02.02', 2, 'EXECUTIVE/VIPs GUEST', 1, 'READY', NULL, '2026-06-24 10:41:08', NULL),
(5, 'LH.03.01', 3, 'REGULAR GUEST', 1, 'OCCUPIED', NULL, '2026-06-24 12:40:07', NULL),
(6, 'LH.03.02', 3, 'REGULAR GUEST', 1, 'OCCUPIED', NULL, '2026-06-24 12:40:07', NULL),
(7, 'LH.04.01', 4, 'SPECIAL GUEST', 1, 'READY', NULL, '2026-07-05 20:56:28', NULL),
(8, 'LH.04.02', 4, 'SPECIAL GUEST', 1, 'READY', NULL, '2026-06-24 10:41:08', NULL),
(9, 'LH.05.01', 5, 'REGULAR GUEST', 1, 'OCCUPIED', NULL, '2026-06-24 12:40:07', NULL),
(10, 'LH.05.02', 5, 'REGULAR GUEST', 1, 'OCCUPIED', NULL, '2026-06-24 12:40:07', NULL),
(11, 'LH.06.01', 6, 'EXECUTIVE/VIPs GUEST', 1, 'OCCUPIED', NULL, '2026-06-24 12:40:07', NULL),
(12, 'LH.06.02', 6, 'SPECIAL GUEST', 1, 'READY', NULL, '2026-06-24 10:41:08', NULL),
(13, 'LH.07.01', 7, 'REGULAR GUEST', 1, 'READY', NULL, '2026-07-05 20:20:49', NULL),
(14, 'LH.07.02', 7, 'REGULAR GUEST', 1, 'OCCUPIED', NULL, '2026-06-24 12:40:07', NULL),
(15, 'LH.08.01', 8, 'REGULAR GUEST', 1, 'OCCUPIED', NULL, '2026-06-24 12:40:07', NULL),
(16, 'LH.08.02', 8, 'REGULAR GUEST', 1, 'NOT READY YET', NULL, '2026-06-24 12:41:26', NULL),
(17, 'LH.09.01', 9, 'REGULAR GUEST', 1, 'NOT READY YET', NULL, '2026-07-02 21:07:27', NULL),
(18, 'LH.09.02', 9, 'REGULAR GUEST', 1, 'OCCUPIED', NULL, '2026-06-24 12:40:07', NULL),
(19, 'LH.10.01', 10, 'REGULAR GUEST', 1, 'READY', NULL, '2026-07-03 19:29:19', NULL),
(20, 'LH.10.02', 10, 'REGULAR GUEST', 1, 'READY', NULL, '2026-07-03 19:25:38', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `area_id` (`area_id`);

--
-- Indexes for table `guests`
--
ALTER TABLE `guests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `laundry_bag`
--
ALTER TABLE `laundry_bag`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `laundry_details`
--
ALTER TABLE `laundry_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`);

--
-- Indexes for table `laundry_dp`
--
ALTER TABLE `laundry_dp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `area_id` (`area_id`);

--
-- Indexes for table `laundry_transactions`
--
ALTER TABLE `laundry_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `meals_dp`
--
ALTER TABLE `meals_dp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `area_id` (`area_id`);

--
-- Indexes for table `meals_on_request`
--
ALTER TABLE `meals_on_request`
  ADD PRIMARY KEY (`id`),
  ADD KEY `delivery_point_id` (`delivery_point_id`);

--
-- Indexes for table `meeting_rooms`
--
ALTER TABLE `meeting_rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messes`
--
ALTER TABLE `messes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mess_id` (`mess_id`),
  ADD KEY `area_id` (`area_id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_no` (`room_no`),
  ADD KEY `mess_id` (`mess_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `areas`
--
ALTER TABLE `areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `guests`
--
ALTER TABLE `guests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `laundry_bag`
--
ALTER TABLE `laundry_bag`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `laundry_details`
--
ALTER TABLE `laundry_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `laundry_dp`
--
ALTER TABLE `laundry_dp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `meals_dp`
--
ALTER TABLE `meals_dp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `meals_on_request`
--
ALTER TABLE `meals_on_request`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `meeting_rooms`
--
ALTER TABLE `meeting_rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `messes`
--
ALTER TABLE `messes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `guests`
--
ALTER TABLE `guests`
  ADD CONSTRAINT `guests_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `laundry_bag`
--
ALTER TABLE `laundry_bag`
  ADD CONSTRAINT `laundry_bag_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `laundry_details`
--
ALTER TABLE `laundry_details`
  ADD CONSTRAINT `laundry_details_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `laundry_transactions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `laundry_dp`
--
ALTER TABLE `laundry_dp`
  ADD CONSTRAINT `laundry_dp_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `meals_dp`
--
ALTER TABLE `meals_dp`
  ADD CONSTRAINT `meals_dp_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `meals_on_request`
--
ALTER TABLE `meals_on_request`
  ADD CONSTRAINT `meals_on_request_ibfk_1` FOREIGN KEY (`delivery_point_id`) REFERENCES `meals_dp` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `messes`
--
ALTER TABLE `messes`
  ADD CONSTRAINT `messes_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`mess_id`) REFERENCES `messes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
