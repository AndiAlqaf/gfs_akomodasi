<?php

namespace App\Controllers;

use App\Models\GuestModel;

class GuestController
{
    private $model;

    public function __construct()
    {
        $this->model = new GuestModel();
    }

    public function index()
    {
        // OLD (guests.php): SELECT * FROM guests
        // NEW: Return all guests
        jsonResponse(["data" => $this->model->all()]);
    }

    public function store()
    {
        $input = jsonInput();
        
        // Validation
        if (!isset($input['name']) || trim($input['name']) === '') {
            jsonResponse(["error" => "Name is required"], 422);
        }

        // Mapping input to database columns
        $name = $input['name'];
        $occupantsCategory = $input['occupants_category'] ?? 'REGULAR GUEST';
        $job = $input['job'] ?? null;
        $institutionCompany = $input['institution_company'] ?? null;
        $roomId = $input['room_id'] ?? null;
        // In the older logic, it also had room_id and registered_by but guests.php only used 4 fields for simple POST.
        // We use raw DB execute here as BaseModel doesn't have a generic insert yet.
        
        \App\Core\Database::execute(
            "INSERT INTO guests (name, occupants_category, job, institution_company) VALUES (?, ?, ?, ?)",
            [$name, $occupantsCategory, $job, $institutionCompany]
        );

        $guestId = \App\Core\Database::lastInsertId();

        if ($occupantsCategory === 'REGULAR GUEST') {
            \App\Core\Database::execute(
                "INSERT INTO reservations (guest_id, room_id, guest_status, check_in, check_out) VALUES (?, ?, ?, NULL, NULL)",
                [$guestId, $roomId, 'SCHEDULED']
            );
        }

        jsonResponse(["success" => true, "id" => $guestId], 201);
    }
}
