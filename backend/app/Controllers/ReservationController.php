<?php

namespace App\Controllers;

use App\Models\ReservationModel;
use App\Core\Database;

class ReservationController
{
    private $model;

    public function __construct()
    {
        $this->model = new ReservationModel();
    }

    public function index()
    {
        jsonResponse(["data" => $this->model->getAllWithDetails()]);
    }

    public function handlePost()
    {
        $input = jsonInput();
        $action = $input['action'] ?? '';

        if ($action === 'update_status') {
            requireFields($input, ['id', 'status']);
            $id = $input['id'];
            $status = $input['status'];

            if ($status === 'ON SITE') {
                $this->model->checkIn($id);
            } elseif ($status === 'OFF SITE') {
                $this->model->checkOut($id);
            } else {
                $this->model->updateStatus($id, $status, $input['estimated_arrival'] ?? null, $input['estimated_departure'] ?? null);
            }
            jsonResponse(["success" => true]);
        } else {
            // Create booking
            requireFields($input, ['room_id', 'estimated_arrival', 'estimated_departure']);
            Database::beginTransaction();
            try {
                $this->model->createBooking($input);
                Database::commit();
                jsonResponse(["success" => true]);
            } catch (\Exception $e) {
                Database::rollBack();
                jsonResponse(["error" => $e->getMessage()], 500);
            }
        }
    }
}
