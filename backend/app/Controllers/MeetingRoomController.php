<?php

namespace App\Controllers;

use App\Core\Database;

class MeetingRoomController
{
    public function index()
    {
        $rows = Database::fetchAll("SELECT * FROM meeting_rooms ORDER BY id ASC");
        jsonResponse(["data" => $rows]);
    }

    public function handlePost()
    {
        $input = jsonInput();
        $action = $input['action'] ?? 'book';

        if ($action === 'book') {
            requireFields($input, ['id', 'reserved_by', 'date']);
            Database::execute(
                "UPDATE meeting_rooms SET 
                    date = ?, reserved_by = ?, departement = ?, participants = ?, 
                    start_time = ?, finish_time = ?, additional_info = ?,
                    booking_status = 'BOOKED', status = ?
                WHERE id = ?",
                [
                    $input['date'],
                    $input['reserved_by'],
                    $input['departement'] ?? '',
                    $input['participants'] ?? 0,
                    $input['start_time'] ?? '',
                    $input['finish_time'] ?? '',
                    $input['additional_info'] ?? '',
                    $input['status'] ?? 'SCHEDULLED',
                    $input['id'],
                ]
            );
            jsonResponse(["success" => true]);

        } elseif ($action === 'cancel') {
            requireFields($input, ['id']);
            Database::execute(
                "UPDATE meeting_rooms SET booking_status='OPEN', reserved_by='-', date='-', status='-', departement=NULL, participants=0, start_time=NULL, finish_time=NULL, additional_info=NULL WHERE id=?",
                [$input['id']]
            );
            jsonResponse(["success" => true]);
        }

        jsonResponse(["error" => "Invalid action"], 400);
    }
}
