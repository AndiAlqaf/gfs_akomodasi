<?php

namespace App\Models;

use App\Core\Database;

class ReservationModel extends BaseModel
{
    protected $table = 'reservations';

    public function getAllWithDetails()
    {
        // 1. Sync any missing guests into reservations
        $missingGuests = Database::fetchAll("
            SELECT g.id, g.room_id, g.occupants_category, g.last_registration 
            FROM guests g 
            LEFT JOIN {$this->table} r ON g.id = r.guest_id 
            WHERE r.id IS NULL
        ");

        if (!empty($missingGuests)) {
            foreach ($missingGuests as $mg) {
                $isRegular = ($mg['occupants_category'] === 'REGULAR GUEST' || empty($mg['occupants_category']));
                $status = $isRegular ? 'ON SITE' : 'SCHEDULED';
                $checkIn = $isRegular ? ($mg['last_registration'] ?: date('Y-m-d H:i:s')) : null;
                Database::execute(
                    "INSERT INTO {$this->table} (guest_id, room_id, guest_status, check_in, check_out) VALUES (?, ?, ?, ?, NULL)",
                    [$mg['id'], $mg['room_id'], $status, $checkIn]
                );
            }
        }

        // 2. Query all details joining guests in the exact same order as data register guest
        $query = "
            SELECT res.*, 
                   g.name as guestName, 
                   COALESCE(NULLIF(g.occupants_category, ''), 'REGULAR GUEST') as occupants_category, 
                   COALESCE(rg.room_no, r.room_no) as roomNo, 
                   COALESCE(mg.mess_name, m.mess_name) as messName, 
                   COALESCE(ag.area_name, a.area_name) as area
            FROM {$this->table} res
            JOIN guests g ON res.guest_id = g.id
            LEFT JOIN rooms rg ON g.room_id = rg.id
            LEFT JOIN messes mg ON rg.mess_id = mg.id
            LEFT JOIN areas ag ON mg.area_id = ag.id
            LEFT JOIN rooms r ON res.room_id = r.id
            LEFT JOIN messes m ON r.mess_id = m.id
            LEFT JOIN areas a ON m.area_id = a.id
            ORDER BY 
                COALESCE(DATE(res.check_in), DATE(res.estimated_arrival), DATE(g.last_registration)) DESC,
                COALESCE(mg.mess_name, m.mess_name) ASC,
                COALESCE(rg.room_no, r.room_no) ASC
        ";
        return Database::fetchAll($query);
    }

    public function checkIn($id)
    {
        // 1. Update reservation status
        Database::execute("UPDATE {$this->table} SET guest_status = 'ON SITE', check_in = NOW(), check_out = NULL WHERE id = ?", [$id]);
    }

    public function checkOut($id)
    {
        // Update current reservation to OFF SITE
        Database::execute("UPDATE {$this->table} SET guest_status = 'OFF SITE', check_out = NOW() WHERE id = ?", [$id]);
    }

    public function updateStatus($id, $status, $estimatedArrival = null, $estimatedDeparture = null)
    {
        Database::execute("UPDATE {$this->table} SET guest_status = ? WHERE id = ?", [$status, $id]);
        
        if ($status === 'RE-SCHEDULED' && $estimatedArrival && $estimatedDeparture) {
            Database::execute("UPDATE {$this->table} SET estimated_arrival = ?, estimated_departure = ? WHERE id = ?", 
                [$estimatedArrival, $estimatedDeparture, $id]);
        }
    }

    public function createBooking($data)
    {
        $guestId = $data['guest_id'] ?? null;
        if (!$guestId && !empty($data['guestName'])) {
            $existing = Database::fetch("SELECT id FROM guests WHERE UPPER(TRIM(name)) = UPPER(TRIM(?)) LIMIT 1", [$data['guestName']]);
            if ($existing) {
                $guestId = $existing['id'];
            } else {
                Database::execute("INSERT INTO guests (name, occupants_category) VALUES (?, ?)", 
                    [$data['guestName'], $data['category']]);
                $guestId = Database::lastInsertId();
            }
        }

        Database::execute(
            "INSERT INTO {$this->table} (guest_id, room_id, estimated_arrival, estimated_departure, guest_status) VALUES (?, ?, ?, ?, ?)",
            [$guestId, $data['room_id'], $data['estimated_arrival'], $data['estimated_departure'], 'SCHEDULED']
        );
    }
}
