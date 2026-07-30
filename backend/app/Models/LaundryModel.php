<?php

namespace App\Models;

use App\Core\Database;

class LaundryModel extends BaseModel
{
    public function getAllTransactionsWithDetails()
    {
        $transactions = Database::fetchAll("SELECT * FROM laundry_transactions ORDER BY created_at DESC");
        $details = Database::fetchAll("SELECT * FROM laundry_details");

        $detailsByTx = [];
        foreach ($details as $det) {
            $detailsByTx[$det['transaction_id']][] = $det;
        }

        foreach ($transactions as &$tx) {
            $tx['details'] = $detailsByTx[$tx['id']] ?? [];
        }

        return $transactions;
    }

    public function createDrop($data)
    {
        $id = uniqid('LD_');
        $query = "INSERT INTO laundry_transactions 
            (id, room, guest_name, laundry_bag_id, laundry_box_id, services_package, drop_point, drop_date, current_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'DROPPED_AT_POINT')";
        
        Database::execute($query, [
            $id, 
            $data['room'], 
            $data['guest_name'], 
            $data['laundry_bag_id'], 
            $data['laundry_box_id'], 
            $data['services_package'] ?? 'Regular', 
            $data['drop_point']
        ]);
        
        return $id;
    }

    public function deliverToLaundry($boxId)
    {
        $query = "UPDATE laundry_transactions 
            SET current_status = 'DELIVERED_TO_LAUNDRY', deliver_date = NOW() 
            WHERE laundry_box_id = ? AND current_status = 'DROPPED_AT_POINT'";
        return Database::execute($query, [$boxId]);
    }

    public function receiveBag($data)
    {
        $query = "UPDATE laundry_transactions 
            SET bag_status = ?, weight = ?, current_status = 'RECEIVED_AT_LAUNDRY', receiving_date = NOW() 
            WHERE laundry_bag_id = ? AND current_status = 'DELIVERED_TO_LAUNDRY'";
        return Database::execute($query, [
            $data['bag_status'], 
            $data['weight'] ?? null, 
            $data['laundry_bag_id']
        ]);
    }

    public function addDetails($txId, $details)
    {
        Database::execute("DELETE FROM laundry_details WHERE transaction_id = ?", [$txId]);
        
        $totalPcs = 0;
        $c_no = 1;
        foreach ($details as $d) {
            Database::execute(
                "INSERT INTO laundry_details (transaction_id, clothes_no, clothes_type, brand, colour, size, no_of_pcs) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [$txId, $c_no++, $d['clothes_type'], $d['brand'], $d['colour'], $d['size'], $d['no_of_pcs']]
            );
            $totalPcs += intval($d['no_of_pcs']);
        }
        
        Database::execute(
            "UPDATE laundry_transactions SET no_of_pcs_total = ?, current_status = 'DETAILS_ADDED' WHERE id = ?",
            [$totalPcs, $txId]
        );
    }

    public function completeProcess($bagId)
    {
        $query = "UPDATE laundry_transactions SET current_status = 'PROCESS_COMPLETED' WHERE laundry_bag_id = ? AND current_status = 'DETAILS_ADDED'";
        return Database::execute($query, [$bagId]);
    }

    public function returnToDrop($boxId)
    {
        $query = "UPDATE laundry_transactions 
            SET current_status = 'RETURNED_TO_DROP', return_date = NOW() 
            WHERE laundry_box_id = ? AND (current_status = 'PROCESS_COMPLETED' OR bag_status = 'Rejected')";
        return Database::execute($query, [$boxId]);
    }

    public function distributeToRoom($bagId)
    {
        $query = "UPDATE laundry_transactions 
            SET current_status = 'DISTRIBUTED_TO_ROOM', distribute_date = NOW() 
            WHERE laundry_bag_id = ? AND current_status = 'RETURNED_TO_DROP'";
        return Database::execute($query, [$bagId]);
    }
}
