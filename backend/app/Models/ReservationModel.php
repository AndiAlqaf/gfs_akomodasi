<?php

namespace App\Models;

use App\Core\Database;

class ReservationModel extends BaseModel
{
    protected $table = 'reservations';

    public function getAllWithDetails()
    {
        $query = "
            SELECT res.*, 
                   g.name as guestName, g.occupants_category, 
                   r.room_no as roomNo, 
                   m.mess_name as messName, 
                   a.area_name as area
            FROM {$this->table} res
            LEFT JOIN guests g ON res.guest_id = g.id
            LEFT JOIN rooms r ON res.room_id = r.id
            LEFT JOIN messes m ON r.mess_id = m.id
            LEFT JOIN areas a ON m.area_id = a.id
            ORDER BY res.id DESC
        ";
        return Database::fetchAll($query);
    }

    public function checkIn($id)
    {
        // 1. Update reservation status
        Database::execute("UPDATE {$this->table} SET guest_status = 'ON SITE', check_in = NOW(), check_out = NULL WHERE id = ?", [$id]);
        
        // 2. Update room status to OCCUPIED
        $roomId = Database::fetchColumn("SELECT room_id FROM {$this->table} WHERE id = ?", [$id]);
        if ($roomId) {
            Database::execute("UPDATE rooms SET room_status = 'OCCUPIED' WHERE id = ?", [$roomId]);
        }
    }

    public function checkOut($id)
    {
        // Fetch current reservation info
        $resData = Database::fetch("
            SELECT res.room_id, res.guest_id, g.occupants_category 
            FROM {$this->table} res 
            LEFT JOIN guests g ON res.guest_id = g.id 
            WHERE res.id = ?
        ", [$id]);

        // Update current reservation to OFF SITE
        Database::execute("UPDATE {$this->table} SET guest_status = 'OFF SITE', check_out = NOW() WHERE id = ?", [$id]);

        if ($resData && $resData['room_id']) {
            $roomId = $resData['room_id'];
            $guestId = $resData['guest_id'];
            
            // Free up the room
            Database::execute("UPDATE rooms SET room_status = 'READY' WHERE id = ?", [$roomId]);
            
            // Spawn new OFF SITE reservation for REGULAR GUEST
            if ($resData['occupants_category'] === 'REGULAR GUEST') {
                Database::execute(
                    "INSERT INTO {$this->table} (guest_id, room_id, guest_status) VALUES (?, ?, 'OFF SITE')", 
                    [$guestId, $roomId]
                );
            }
        }
    }

    public function updateStatus($id, $status, $estimatedArrival = null, $estimatedDeparture = null)
    {
        Database::execute("UPDATE {$this->table} SET guest_status = ? WHERE id = ?", [$status, $id]);
        
        if ($status === 'RE-SCHEDULED' && $estimatedArrival && $estimatedDeparture) {
            Database::execute("UPDATE {$this->table} SET estimated_arrival = ?, estimated_departure = ? WHERE id = ?", 
                [$estimatedArrival, $estimatedDeparture, $id]);
        }
        
        if ($status === 'CANCELLED') {
            $roomId = Database::fetchColumn("SELECT room_id FROM {$this->table} WHERE id = ?", [$id]);
            if ($roomId) {
                Database::execute("UPDATE rooms SET room_status = 'READY' WHERE id = ?", [$roomId]);
            }
        }
    }

    public function createBooking($data)
    {
        $guestId = $data['guest_id'] ?? null;
        if (!$guestId) {
            Database::execute("INSERT INTO guests (name, occupants_category) VALUES (?, ?)", 
                [$data['guestName'], $data['category']]);
            $guestId = Database::lastInsertId();
        }

        Database::execute(
            "INSERT INTO {$this->table} (guest_id, room_id, estimated_arrival, estimated_departure, guest_status) VALUES (?, ?, ?, ?, ?)",
            [$guestId, $data['room_id'], $data['estimated_arrival'], $data['estimated_departure'], 'SCHEDULED']
        );

        Database::execute("UPDATE rooms SET room_status = 'BOOKED' WHERE id = ?", [$data['room_id']]);
    }
}
