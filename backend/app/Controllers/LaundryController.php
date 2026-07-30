<?php

namespace App\Controllers;

use App\Models\LaundryModel;

class LaundryController
{
    private $model;

    public function __construct()
    {
        $this->model = new LaundryModel();
    }

    public function index()
    {
        jsonResponse(["data" => $this->model->getAllTransactionsWithDetails()]);
    }

    public function handlePost()
    {
        $input = jsonInput();
        $action = $_GET['action'] ?? ($input['action'] ?? '');

        if ($action === 'create_drop') {
            requireFields($input, ['room', 'guest_name', 'laundry_bag_id', 'laundry_box_id', 'drop_point']);
            $id = $this->model->createDrop($input);
            jsonResponse(["success" => true, "id" => $id]);
        } 
        
        if ($action === 'deliver_to_laundry') {
            requireFields($input, ['laundry_box_id']);
            $updated = $this->model->deliverToLaundry($input['laundry_box_id']);
            jsonResponse(["success" => true, "updated" => $updated]);
        }
        
        if ($action === 'receive_bag') {
            requireFields($input, ['laundry_bag_id', 'bag_status']);
            $this->model->receiveBag($input);
            jsonResponse(["success" => true]);
        }
        
        if ($action === 'add_details') {
            requireFields($input, ['transaction_id', 'details']);
            $this->model->addDetails($input['transaction_id'], $input['details']);
            jsonResponse(["success" => true]);
        }
        
        if ($action === 'complete_process') {
            requireFields($input, ['laundry_bag_id']);
            $this->model->completeProcess($input['laundry_bag_id']);
            jsonResponse(["success" => true]);
        }
        
        if ($action === 'return_to_drop') {
            requireFields($input, ['laundry_box_id']);
            $updated = $this->model->returnToDrop($input['laundry_box_id']);
            jsonResponse(["success" => true, "updated" => $updated]);
        }
        
        if ($action === 'distribute_to_room') {
            requireFields($input, ['laundry_bag_id']);
            $this->model->distributeToRoom($input['laundry_bag_id']);
            jsonResponse(["success" => true]);
        }

        jsonResponse(["error" => "Invalid action"], 400);
    }
}
