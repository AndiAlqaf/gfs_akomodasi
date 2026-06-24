<?php
require __DIR__ . '/db.php';

if (!function_exists('requireFields')) {
    function requireFields($data, $fields)
    {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
                jsonResponse(['error' => 'Field "' . $field . '" is required'], 422);
            }
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

try {
    if ($method === 'GET') {
        switch ($action) {
            case 'get_areas':
                $stmt = $pdo->query('SELECT * FROM areas ORDER BY id ASC');
                jsonResponse(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                break;

            case 'get_messes':
                $stmt = $pdo->query('SELECT m.*, a.area_name FROM messes m LEFT JOIN areas a ON m.area_id = a.id ORDER BY m.id ASC');
                jsonResponse(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                break;

            case 'get_rooms':
                $stmt = $pdo->query('SELECT r.*, m.mess_name, m.mess_id as mess_id_str FROM rooms r LEFT JOIN messes m ON r.mess_id = m.id ORDER BY r.id ASC');
                jsonResponse(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                break;

            case 'get_meals_dp':
                $stmt = $pdo->query('SELECT md.*, a.area_name FROM meals_dp md LEFT JOIN areas a ON md.area_id = a.id ORDER BY md.id ASC');
                jsonResponse(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                break;

            case 'get_laundry_dp':
                $stmt = $pdo->query('SELECT ld.*, a.area_name FROM laundry_dp ld LEFT JOIN areas a ON ld.area_id = a.id ORDER BY ld.id ASC');
                jsonResponse(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                break;

            case 'get_laundry_bag':
                $stmt = $pdo->query('SELECT lb.*, r.room_no FROM laundry_bag lb LEFT JOIN rooms r ON lb.room_id = r.id ORDER BY lb.id ASC');
                jsonResponse(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                break;

            case 'get_guests':
                $stmt = $pdo->query('SELECT g.*, r.room_no, m.mess_name FROM guests g LEFT JOIN rooms r ON g.room_id = r.id LEFT JOIN messes m ON r.mess_id = m.id ORDER BY g.id ASC');
                jsonResponse(['data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                break;

            default:
                jsonResponse(['error' => 'Invalid GET action'], 400);
        }
    }

    if ($method === 'POST') {
        $data = jsonInput();
        $registeredBy = $data['registered_by'] ?? 'System';

        switch ($action) {
            case 'add_area':
                requireFields($data, ['area_name', 'area_id']);
                $stmt = $pdo->prepare('INSERT INTO areas (area_name, area_id, registered_by, remarks) VALUES (?, ?, ?, ?)');
                $stmt->execute([$data['area_name'], $data['area_id'], $registeredBy, $data['remarks'] ?? '']);
                jsonResponse(['success' => true], 201);
                break;

            case 'add_mess':
                requireFields($data, ['mess_name', 'mess_id', 'area_id']);
                $stmt = $pdo->prepare('INSERT INTO messes (mess_name, mess_id, area_id, rooms_count, mess_status, managed_by, registered_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([
                    $data['mess_name'],
                    $data['mess_id'],
                    $data['area_id'],
                    $data['rooms_count'] ?? 0,
                    $data['mess_status'] ?? 'OWNED BY CERIA',
                    $data['managed_by'] ?? '',
                    $registeredBy,
                    $data['remarks'] ?? '',
                ]);
                jsonResponse(['success' => true], 201);
                break;

            case 'add_room':
                requireFields($data, ['room_no', 'mess_id']);
                $stmt = $pdo->prepare('INSERT INTO rooms (room_no, mess_id, room_allocation, beds, room_status, registered_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([
                    $data['room_no'],
                    $data['mess_id'],
                    $data['room_allocation'] ?? 'REGULAR GUEST',
                    $data['beds'] ?? 1,
                    $data['room_status'] ?? 'READY',
                    $registeredBy,
                    $data['remarks'] ?? '',
                ]);
                $pdo->prepare('UPDATE messes SET rooms_count = rooms_count + 1 WHERE id = ?')->execute([$data['mess_id']]);
                jsonResponse(['success' => true], 201);
                break;

            case 'add_meals_dp':
                requireFields($data, ['delivery_point', 'area_id']);
                $stmt = $pdo->prepare('INSERT INTO meals_dp (delivery_point, area_id, canteen_status, registered_by, remarks) VALUES (?, ?, ?, ?, ?)');
                $stmt->execute([
                    $data['delivery_point'],
                    $data['area_id'],
                    $data['canteen_status'] ?? 'READY',
                    $registeredBy,
                    $data['remarks'] ?? '',
                ]);
                jsonResponse(['success' => true], 201);
                break;

            case 'add_laundry_dp':
                requireFields($data, ['point_name', 'area_id']);
                $stmt = $pdo->prepare('INSERT INTO laundry_dp (point_name, area_id, dp_status, registered_by, remarks) VALUES (?, ?, ?, ?, ?)');
                $stmt->execute([
                    $data['point_name'],
                    $data['area_id'],
                    $data['dp_status'] ?? 'READY',
                    $registeredBy,
                    $data['remarks'] ?? '',
                ]);
                jsonResponse(['success' => true], 201);
                break;

            case 'add_laundry_bag':
                requireFields($data, ['nama', 'room_id']);
                $stmt = $pdo->prepare('INSERT INTO laundry_bag (nama, room_id, laundry_bag, laundry_box, registered_by, remarks) VALUES (?, ?, ?, ?, ?, ?)');
                $stmt->execute([
                    $data['nama'],
                    $data['room_id'],
                    $data['laundry_bag'] ?? '',
                    $data['laundry_box'] ?? '',
                    $registeredBy,
                    $data['remarks'] ?? '',
                ]);
                jsonResponse(['success' => true], 201);
                break;

            case 'add_guest':
                requireFields($data, ['room_id', 'name']);
                $stmt = $pdo->prepare('INSERT INTO guests (room_id, name, institution_company, occupants_category, personal_identification, reg_id_card, job, position, level_category, meals_packages, breakfast_dp, lunch_dp, dinner_dp, registered_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([
                    $data['room_id'],
                    $data['name'],
                    $data['institution_company'] ?? '',
                    $data['occupants_category'] ?? 'REGULAR GUEST',
                    $data['personal_identification'] ?? '',
                    $data['reg_id_card'] ?? '',
                    $data['job'] ?? '',
                    $data['position'] ?? '',
                    $data['level_category'] ?? '',
                    $data['meals_packages'] ?? '',
                    $data['breakfast_dp'] ?? '',
                    $data['lunch_dp'] ?? '',
                    $data['dinner_dp'] ?? '',
                    $registeredBy,
                    $data['remarks'] ?? '',
                ]);
                jsonResponse(['success' => true], 201);
                break;

            default:
                jsonResponse(['error' => 'Invalid POST action'], 400);
        }
    }

    jsonResponse(['error' => 'Method not allowed'], 405);
} catch (\Throwable $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
?>
