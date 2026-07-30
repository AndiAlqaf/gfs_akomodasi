<?php

namespace App\Controllers;

use App\Models\MealsModel;

class MealsController
{
    private $model;

    public function __construct()
    {
        $this->model = new MealsModel();
    }

    public function index()
    {
        $type = $_GET['type'] ?? 'schedule';

        if ($type === 'schedule') {
            jsonResponse(["data" => $this->model->getSchedule()]);
        } elseif ($type === 'requests') {
            jsonResponse(["data" => $this->model->getRequests()]);
        } elseif ($type === 'dp') {
            jsonResponse(["data" => $this->model->getDeliveryPoints()]);
        } else {
            jsonResponse(["error" => "Invalid type parameter"], 400);
        }
    }

    public function createRequest()
    {
        $input = jsonInput();
        requireFields($input, ['guest_name', 'request_by', 'meals_package', 'delivery_point_id', 'meal_time', 'no_of_packs']);
        
        $this->model->createRequest($input);
        jsonResponse(["success" => true]);
    }

    public function approveRequest()
    {
        $input = jsonInput();
        requireFields($input, ['id', 'approved_by']);
        
        $this->model->approveRequest($input['id'], $input['approved_by']);
        jsonResponse(["success" => true]);
    }

    public function legacyHandler()
    {
        $input = jsonInput();
        $action = $input['action'] ?? '';
        
        if ($action === 'create_request') return $this->createRequest();
        if ($action === 'approve_request') return $this->approveRequest();
        
        jsonResponse(["error" => "Invalid action"], 400);
    }
}
