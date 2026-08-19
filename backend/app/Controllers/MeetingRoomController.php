<?php

namespace App\Controllers;

use App\Core\Database;

class MeetingRoomController
{
    public function index()
    {
        $rows = Database::fetchAll("SELECT * FROM meeting_room_bookings ORDER BY booking_date DESC, start_time DESC");
        jsonResponse(["data" => $rows]);
    }

    public function handlePost()
    {
        $input = jsonInput();
        $action = $input['action'] ?? 'book';

        if ($action === 'book') {
            requireFields($input, ['booking_date', 'requested_by', 'meeting_room', 'start_time', 'finish_time']);
            Database::execute(
                "INSERT INTO meeting_room_bookings (booking_date, requested_by, department, meeting_room, participants, start_time, finish_time, additional_info, action_status, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $input['booking_date'],
                    $input['requested_by'],
                    $input['department'] ?? '',
                    $input['meeting_room'],
                    $input['participants'] ?? 0,
                    $input['start_time'],
                    $input['finish_time'],
                    $input['additional_info'] ?? '',
                    $input['action_status'] ?? 'SCHEDULLED',
                    $input['remark'] ?? ''
                ]
            );

            // Update meeting_rooms master table so Information and DataRegister views see the latest status
            Database::execute(
                "UPDATE meeting_rooms SET 
                    date = ?, reserved_by = ?, departement = ?, participants = ?, 
                    start_time = ?, finish_time = ?, additional_info = ?,
                    booking_status = 'BOOKED', status = ?
                WHERE room = ?",
                [
                    $input['booking_date'],
                    $input['requested_by'],
                    $input['department'] ?? '',
                    $input['participants'] ?? 0,
                    $input['start_time'],
                    $input['finish_time'],
                    $input['additional_info'] ?? '',
                    $input['action_status'] ?? 'SCHEDULLED',
                    $input['meeting_room'],
                ]
            );

            jsonResponse(["success" => true]);

        } elseif ($action === 'cancel') {
            requireFields($input, ['id']);
            Database::execute(
                "UPDATE meeting_room_bookings SET action_status='CANCELLED' WHERE id=?",
                [$input['id']]
            );

            if (!empty($input['room'])) {
                Database::execute(
                    "UPDATE meeting_rooms SET booking_status='OPEN', status='CANCELLED' WHERE room=?",
                    [$input['room']]
                );
            }
            jsonResponse(["success" => true]);
        }

        jsonResponse(["error" => "Invalid action"], 400);
    }
}
