<?php

namespace App\Controllers;

use App\Models\UserModel;

class UserController
{
    private $model;

    public function __construct()
    {
        $this->model = new UserModel();
    }

    public function index()
    {
        jsonResponse(['status' => 'success', 'data' => $this->model->getAllUsers()]);
    }

    public function handlePost()
    {
        $input = jsonInput();
        $action = $_GET['action'] ?? '';

        if ($action === 'login') {
            requireFields($input, ['username', 'password']);
            $user = $this->model->login($input['username'], $input['password']);
            if ($user) {
                jsonResponse(['status' => 'success', 'data' => $user]);
            } else {
                jsonResponse(['status' => 'error', 'message' => 'Invalid username or password'], 401);
            }
        } else {
            requireFields($input, ['name', 'username', 'email']);
            $id = $this->model->createUser($input);
            jsonResponse(['status' => 'success', 'message' => 'User created successfully', 'id' => $id]);
        }
    }

    public function handlePut()
    {
        $input = jsonInput();
        requireFields($input, ['id', 'name', 'username', 'email', 'role']);
        $this->model->updateUser($input);
        jsonResponse(['status' => 'success', 'message' => 'User updated successfully']);
    }

    public function handleDelete()
    {
        $input = jsonInput();
        $id = $_GET['id'] ?? ($input['id'] ?? null);
        if (!$id) {
            jsonResponse(['status' => 'error', 'message' => 'ID is required'], 422);
        }
        $this->model->delete($id);
        jsonResponse(['status' => 'success', 'message' => 'User deleted successfully']);
    }
}
