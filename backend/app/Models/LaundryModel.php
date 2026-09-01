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

        $boxGroups = [];
        
        foreach ($transactions as &$tx) {
            $tx['details'] = $detailsByTx[$tx['id']] ?? [];
            
            $boxId = $tx['laundry_box_id'];
            if ($boxId) {
                if (!isset($boxGroups[$boxId])) {
                    $boxGroups[$boxId] = [
                        'laundry_box_id' => $boxId,
                        'boxId' => $boxId,
                        'total_bags' => 0,
                        'drop_point' => $tx['drop_point'],
                        'delivery_point' => $tx['delivery_point'] ?? null,
                        'deliverDate' => $tx['deliver_date'] ?? null,
                        'returnDate' => $tx['return_date'] ?? null,
                        'has_dropped' => false,
                        'has_processing' => false,
                        'has_completed' => false
                    ];
                }
                
                $boxGroups[$boxId]['total_bags']++;
                
                if ($tx['current_status'] === 'DROPPED_AT_POINT') {
                    $boxGroups[$boxId]['has_dropped'] = true;
                } elseif ($tx['current_status'] === 'PROCESS_COMPLETED' || $tx['bag_status'] === 'Rejected') {
                    $boxGroups[$boxId]['has_completed'] = true;
                } else {
                    if ($tx['current_status'] !== 'RETURNED_TO_DROP' && $tx['current_status'] !== 'DISTRIBUTED_TO_ROOM') {
                        $boxGroups[$boxId]['has_processing'] = true;
                    }
                }
                
                if (!empty($tx['deliver_date'])) {
                    $boxGroups[$boxId]['deliverDate'] = $tx['deliver_date'];
                }
                if (!empty($tx['return_date'])) {
                    $boxGroups[$boxId]['returnDate'] = $tx['return_date'];
                }
            }
        }
        
        $boxList = [];
        foreach ($boxGroups as $b) {
            $b['isReadyToDeliver'] = $b['has_dropped'];
            $b['isReadyToReturn'] = $b['has_completed'] && !$b['has_processing'];
            $boxList[] = $b;
        }

        return [
            'transactions' => $transactions,
            'boxList' => array_values($boxList)
        ];
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
            WHERE laundry_bag_id = ? AND current_status = 'DROPPED_AT_POINT'";
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
            WHERE laundry_bag_id = ? AND (current_status = 'PROCESS_COMPLETED' OR (current_status = 'RECEIVED_AT_LAUNDRY' AND bag_status = 'Rejected'))";
        return Database::execute($query, [$bagId]);
    }
}
