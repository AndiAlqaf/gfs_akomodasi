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

    // ---- POST METHODS (For adding new entry - skeleton) ----
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        // We can implement actual inserts here later when the frontend form is fully functional.
        // For now, just return success so the UI doesn't crash if it tries to POST.
        echo json_encode(['success' => true, 'message' => 'API POST endpoint ready', 'data_received' => $data]);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
