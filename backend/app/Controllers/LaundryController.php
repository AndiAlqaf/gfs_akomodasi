<?php

namespace AppControllers;

use AppModelsLaundryModel;
use AppCoreDatabase;

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

        // Normalize action aliases
        if ($action === 'drop') $action = 'create_drop';
        if ($action === 'deliver') $action = 'deliver_to_laundry';
        if ($action === 'receive') $action = 'receive_bag';
        if ($action === 'complete') $action = 'complete_process';
        if ($action === 'return') $action = 'return_to_drop';
        if ($action === 'distribute') $action = 'distribute_to_room';

        // Normalize parameters
        if (!isset($input['laundry_bag_id']) && isset($input['id'])) {
            $input['laundry_bag_id'] = $input['id'];
        }
        if (!isset($input['laundry_box_id']) && isset($input['id'])) {
            $input['laundry_box_id'] = $input['id'];
        }
        if (isset($input['data']) && is_array($input['data'])) {
            if (isset($input['data']['bag_status'])) $input['bag_status'] = $input['data']['bag_status'];
            if (isset($input['data']['weight'])) $input['weight'] = $input['data']['weight'];
            if (isset($input['data']['transaction_id'])) $input['transaction_id'] = $input['data']['transaction_id'];
            if (isset($input['data']['details'])) $input['details'] = $input['data']['details'];
        }

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
            if (empty($input['transaction_id']) && !empty($input['laundry_bag_id'])) {
                $tx = Database::fetch("SELECT id FROM laundry_transactions WHERE laundry_bag_id = ? ORDER BY created_at DESC LIMIT 1", [$input['laundry_bag_id']]);
                if ($tx) $input['transaction_id'] = $tx['id'];
            }
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
