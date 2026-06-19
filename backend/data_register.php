<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = 'localhost';
$db = 'gfs_akomodasi_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Connection failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

try {
    // ---- GET METHODS ----
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if ($action === 'get_areas') {
            $stmt = $pdo->query("SELECT * FROM areas ORDER BY id ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($action === 'get_messes') {
            $stmt = $pdo->query("SELECT m.*, a.area_name FROM messes m LEFT JOIN areas a ON m.area_id = a.id ORDER BY m.id ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($action === 'get_rooms') {
            $stmt = $pdo->query("SELECT r.*, m.mess_name, m.mess_id as mess_id_str FROM rooms r LEFT JOIN messes m ON r.mess_id = m.id ORDER BY r.id ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($action === 'get_meals_dp') {
            $stmt = $pdo->query("SELECT md.*, a.area_name FROM meals_dp md LEFT JOIN areas a ON md.area_id = a.id ORDER BY md.id ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($action === 'get_laundry_dp') {
            $stmt = $pdo->query("SELECT ld.*, a.area_name FROM laundry_dp ld LEFT JOIN areas a ON ld.area_id = a.id ORDER BY ld.id ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($action === 'get_laundry_bag') {
            $stmt = $pdo->query("SELECT lb.*, r.room_no FROM laundry_bag lb LEFT JOIN rooms r ON lb.room_id = r.id ORDER BY lb.id ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } elseif ($action === 'get_guests') {
            $stmt = $pdo->query("SELECT g.*, r.room_no, m.mess_name FROM guests g LEFT JOIN rooms r ON g.room_id = r.id LEFT JOIN messes m ON r.mess_id = m.id ORDER BY g.id ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } else {
            echo json_encode(['error' => 'Invalid GET action']);
        }
    }

    // ---- POST METHODS ----
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $registeredBy = $data['registered_by'] ?? 'System';

        if ($action === 'add_area') {
            $stmt = $pdo->prepare("INSERT INTO areas (area_name, area_id, registered_by, remarks) VALUES (?, ?, ?, ?)");
            $stmt->execute([$data['area_name'], $data['area_id'], $registeredBy, $data['remarks'] ?? '']);
            echo json_encode(['success' => true]);
        } elseif ($action === 'add_mess') {
            $stmt = $pdo->prepare("INSERT INTO messes (mess_name, mess_id, area_id, rooms_count, mess_status, managed_by, registered_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['mess_name'], $data['mess_id'], $data['area_id'], 
                $data['rooms_count'] ?? 0, $data['mess_status'] ?? 'OWNED BY CERIA', 
                $data['managed_by'] ?? '', $registeredBy, $data['remarks'] ?? ''
            ]);
            echo json_encode(['success' => true]);
        } elseif ($action === 'add_room') {
            $stmt = $pdo->prepare("INSERT INTO rooms (room_no, mess_id, room_allocation, beds, room_status, registered_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['room_no'], $data['mess_id'], $data['room_allocation'] ?? 'REGULAR GUEST',
                $data['beds'] ?? 1, $data['room_status'] ?? 'READY', $registeredBy, $data['remarks'] ?? ''
            ]);
            // update room count in mess
            $pdo->prepare("UPDATE messes SET rooms_count = rooms_count + 1 WHERE id = ?")->execute([$data['mess_id']]);
            echo json_encode(['success' => true]);
        } elseif ($action === 'add_meals_dp') {
            $stmt = $pdo->prepare("INSERT INTO meals_dp (delivery_point, area_id, canteen_status, registered_by, remarks) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$data['delivery_point'], $data['area_id'], $data['canteen_status'] ?? 'READY', $registeredBy, $data['remarks'] ?? '']);
            echo json_encode(['success' => true]);
        } elseif ($action === 'add_laundry_dp') {
            $stmt = $pdo->prepare("INSERT INTO laundry_dp (point_name, area_id, dp_status, registered_by, remarks) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$data['point_name'], $data['area_id'], $data['dp_status'] ?? 'READY', $registeredBy, $data['remarks'] ?? '']);
            echo json_encode(['success' => true]);
        } elseif ($action === 'add_laundry_bag') {
            $stmt = $pdo->prepare("INSERT INTO laundry_bag (nama, room_id, laundry_bag, laundry_box, registered_by, remarks) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data['nama'], $data['room_id'], $data['laundry_bag'] ?? '', $data['laundry_box'] ?? '', $registeredBy, $data['remarks'] ?? '']);
            echo json_encode(['success' => true]);
        } elseif ($action === 'add_guest') {
            $stmt = $pdo->prepare("INSERT INTO guests (room_id, name, occupants_category, personal_identification, reg_id_card, job, position, level_category, registered_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['room_id'], $data['name'], $data['occupants_category'] ?? 'REGULAR GUEST',
                $data['personal_identification'] ?? '', $data['reg_id_card'] ?? '',
                $data['job'] ?? '', $data['position'] ?? '', $data['level_category'] ?? '',
                $registeredBy, $data['remarks'] ?? ''
            ]);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Invalid POST action']);
        }
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
