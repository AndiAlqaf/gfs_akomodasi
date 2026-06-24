<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM laundry_transactions ORDER BY created_at DESC");
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch all details
        $stmtDet = $pdo->query("SELECT * FROM laundry_details");
        $details = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

        // Group details by transaction_id
        $detailsByTx = [];
        foreach ($details as $det) {
            $detailsByTx[$det['transaction_id']][] = $det;
        }

        foreach ($transactions as &$tx) {
            $tx['details'] = $detailsByTx[$tx['id']] ?? [];
        }

        echo json_encode(["data" => $transactions]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $action = $_GET['action'] ?? ($input['action'] ?? '');
    
    try {
        if ($action === 'create_drop') {
            $id = uniqid('LD_');
            $room = $input['room'];
            $guest = $input['guest_name'];
            $bag = $input['laundry_bag_id'];
            $box = $input['laundry_box_id'];
            $pkg = $input['services_package'] ?? 'Regular';
            $dp = $input['drop_point'];
            
            $stmt = $pdo->prepare("INSERT INTO laundry_transactions 
                (id, room, guest_name, laundry_bag_id, laundry_box_id, services_package, drop_point, drop_date, current_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'DROPPED_AT_POINT')");
            $stmt->execute([$id, $room, $guest, $bag, $box, $pkg, $dp]);
            
            echo json_encode(["success" => true, "id" => $id]);
            
        } elseif ($action === 'deliver_to_laundry') {
            $box_id = $input['laundry_box_id'];
            $stmt = $pdo->prepare("UPDATE laundry_transactions 
                SET current_status = 'DELIVERED_TO_LAUNDRY', deliver_date = NOW() 
                WHERE laundry_box_id = ? AND current_status = 'DROPPED_AT_POINT'");
            $stmt->execute([$box_id]);
            echo json_encode(["success" => true, "updated" => $stmt->rowCount()]);
            
        } elseif ($action === 'receive_bag') {
            $bag_id = $input['laundry_bag_id'];
            $bag_status = $input['bag_status']; // Accepted / Rejected
            $weight = $input['weight'] ?? null;
            
            $stmt = $pdo->prepare("UPDATE laundry_transactions 
                SET bag_status = ?, weight = ?, current_status = 'RECEIVED_AT_LAUNDRY', receiving_date = NOW() 
                WHERE laundry_bag_id = ? AND current_status = 'DELIVERED_TO_LAUNDRY'");
            $stmt->execute([$bag_status, $weight, $bag_id]);
            echo json_encode(["success" => true]);
            
        } elseif ($action === 'add_details') {
            $tx_id = $input['transaction_id'];
            $details = $input['details']; // Array of objects
            
            // clear existing just in case
            $pdo->prepare("DELETE FROM laundry_details WHERE transaction_id = ?")->execute([$tx_id]);
            
            $stmt = $pdo->prepare("INSERT INTO laundry_details (transaction_id, clothes_no, clothes_type, brand, colour, size, no_of_pcs) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $totalPcs = 0;
            $c_no = 1;
            foreach ($details as $d) {
                $stmt->execute([$tx_id, $c_no++, $d['clothes_type'], $d['brand'], $d['colour'], $d['size'], $d['no_of_pcs']]);
                $totalPcs += intval($d['no_of_pcs']);
            }
            
            // update total pcs and status
            $pdo->prepare("UPDATE laundry_transactions SET no_of_pcs_total = ?, current_status = 'DETAILS_ADDED' WHERE id = ?")->execute([$totalPcs, $tx_id]);
            echo json_encode(["success" => true]);
            
        } elseif ($action === 'complete_process') {
            $bag_id = $input['laundry_bag_id'];
            $stmt = $pdo->prepare("UPDATE laundry_transactions SET current_status = 'PROCESS_COMPLETED' WHERE laundry_bag_id = ? AND current_status = 'DETAILS_ADDED'");
            $stmt->execute([$bag_id]);
            echo json_encode(["success" => true]);
            
        } elseif ($action === 'return_to_drop') {
            $box_id = $input['laundry_box_id'];
            $stmt = $pdo->prepare("UPDATE laundry_transactions 
                SET current_status = 'RETURNED_TO_DROP', return_date = NOW() 
                WHERE laundry_box_id = ? AND (current_status = 'PROCESS_COMPLETED' OR bag_status = 'Rejected')");
            $stmt->execute([$box_id]);
            echo json_encode(["success" => true, "updated" => $stmt->rowCount()]);
            
        } elseif ($action === 'distribute_to_room') {
            $bag_id = $input['laundry_bag_id'];
            $stmt = $pdo->prepare("UPDATE laundry_transactions 
                SET current_status = 'DISTRIBUTED_TO_ROOM', distribute_date = NOW() 
                WHERE laundry_bag_id = ? AND current_status = 'RETURNED_TO_DROP'");
            $stmt->execute([$bag_id]);
            echo json_encode(["success" => true]);
            
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid action"]);
        }
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
