-- GFS Ceria Accommodation System - Database Schema v2
-- DROP EXISTING DATABASE IF YOU WANT A CLEAN SLATE (Uncomment below if needed)
DROP DATABASE IF EXISTS gfs_akomodasi_db;
CREATE DATABASE gfs_akomodasi_db;
USE gfs_akomodasi_db;

-- 1. AREA
CREATE TABLE IF NOT EXISTS areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    area_id VARCHAR(50) NOT NULL UNIQUE,
    registered_by VARCHAR(100),
    last_registration DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    remarks TEXT
);

-- 2. MESS
CREATE TABLE IF NOT EXISTS messes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mess_name VARCHAR(100) NOT NULL,
    mess_id VARCHAR(50) NOT NULL UNIQUE,
    area_id INT,
    rooms_count INT DEFAULT 0,
    mess_status VARCHAR(50),
    managed_by VARCHAR(100),
    registered_by VARCHAR(100),
    last_registration DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
);

-- 3. ROOM
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_no VARCHAR(50) NOT NULL UNIQUE,
    mess_id INT,
    room_allocation VARCHAR(100),
    beds INT DEFAULT 1,
    room_status VARCHAR(50) DEFAULT 'READY',
    registered_by VARCHAR(100),
    last_registration DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (mess_id) REFERENCES messes(id) ON DELETE CASCADE
);

-- 4. MEALS DELIVERY POINT
CREATE TABLE IF NOT EXISTS meals_dp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_point VARCHAR(100) NOT NULL,
    area_id INT,
    canteen_status VARCHAR(50) DEFAULT 'READY',
    registered_by VARCHAR(100),
    last_registration DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
);

-- 5. LAUNDRY DELIVERY AND DROP POINT
CREATE TABLE IF NOT EXISTS laundry_dp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    point_name VARCHAR(100) NOT NULL,
    area_id INT,
    dp_status VARCHAR(50),
    registered_by VARCHAR(100),
    last_registration DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
);

-- 6. LAUNDRY BAG & BOX
CREATE TABLE IF NOT EXISTS laundry_bag (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    room_id INT,
    laundry_bag VARCHAR(100),
    laundry_box VARCHAR(100),
    registered_by VARCHAR(100),
    last_registration DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- 7. GUEST
CREATE TABLE IF NOT EXISTS guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    name VARCHAR(150) NOT NULL,
    personal_identification VARCHAR(100),
    reg_id_card VARCHAR(100),
    job VARCHAR(100),
    position VARCHAR(100),
    level_category VARCHAR(100),
    registered_by VARCHAR(100),
    last_registration DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- INSERT DUMMY DATA FOR TESTING
INSERT INTO areas (area_name, area_id, registered_by, remarks) VALUES 
('LIVING RESIDENCE 1', 'LIV.RES.01', 'Admin', ''),
('LIVING RESIDENCE 2', 'LIV.RES.02', 'Admin', ''),
('SAMAENRE RESIDENCE', 'SAM.RES.01', 'Admin', '');

INSERT INTO messes (mess_name, mess_id, area_id, rooms_count, mess_status, managed_by) VALUES 
('LANDED HOUSE-01', 'CMP.MES.LH.01', 1, 2, 'OWNED BY CERIA', 'PT. CMP'),
('LANDED HOUSE-02', 'CMP.MES.LH.02', 1, 2, 'OWNED BY CERIA', 'PT. CMP');

INSERT INTO rooms (room_no, mess_id, room_allocation, beds, room_status) VALUES 
('LH.01.01', 1, 'REGULAR GUEST', 1, 'READY'),
('LH.01.02', 1, 'REGULAR GUEST', 1, 'READY'),
('LH.02.01', 2, 'EXECUTIVE/VIPs GUEST', 1, 'READY');

INSERT INTO meals_dp (delivery_point, area_id, canteen_status) VALUES 
('SATELIT CANTEEN', 1, 'READY'),
('EXPAT CANTEEN', 1, 'UNDER REPAIRED');

INSERT INTO laundry_dp (point_name, area_id) VALUES 
('LDP SAMAENRE', 1),
('LDP LIVING 3', 3);

INSERT INTO laundry_bag (nama, room_id, laundry_bag, laundry_box) VALUES 
('SUNARTO URJOYO PURBA', 1, 'LH.01.01 (ENDANG)', 'LANDED HOUSE');

INSERT INTO guests (room_id, name, personal_identification, reg_id_card, job, position, level_category) VALUES 
(1, 'SUNARTO URJOYO PURBA', '', '', 'EMPLOYEE', 'HSE MANAGER', 'SENIOR STAFF'),
(3, 'MR. ZHENG BU DONG', '', '', 'CONSULTANT', 'ENFI DIRECTOR', 'BOD');
