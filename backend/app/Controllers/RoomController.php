<?php

namespace App\Controllers;

use App\Models\RoomModel;

class RoomController
{
    private $model;

    public function __construct()
    {
        $this->model = new RoomModel();
    }

    public function index()
    {
        $category = $_GET['category'] ?? null;
        $data = $this->model->allWithDetails($category);
        jsonResponse(["data" => $data]);
    }

    public function updateStatus()
    {
        $input = jsonInput();
        
        // Sometimes the legacy app sent { action: 'update_status', id: 1, status: '...' }
        // We handle the data directly.
        requireFields($input, ['id', 'status']);

        $this->model->updateStatus($input['id'], $input['status']);
        jsonResponse(["success" => true]);
    }
}
