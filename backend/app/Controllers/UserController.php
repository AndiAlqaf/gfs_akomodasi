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
        $action = $_GET['action'] ?? ($input['action'] ?? '');

        try {
            if ($action === 'login') {
                requireFields($input, ['username', 'password']);
                $user = $this->model->login($input['username'], $input['password']);
                if ($user) {
                    jsonResponse(['status' => 'success', 'data' => $user]);
                } else {
                    jsonResponse(['status' => 'error', 'error' => 'Username atau password salah.'], 401);
                }
            } elseif ($action === 'update') {
                requireFields($input, ['id', 'name', 'username', 'role']);
                $this->model->updateUser($input);
                jsonResponse(['status' => 'success', 'message' => 'User updated successfully']);
            } elseif ($action === 'delete') {
                $id = $input['id'] ?? ($_GET['id'] ?? null);
                if (!$id) {
                    jsonResponse(['status' => 'error', 'error' => 'ID is required'], 422);
                }
                $this->model->delete($id);
                jsonResponse(['status' => 'success', 'message' => 'User deleted successfully']);
            } else {
                requireFields($input, ['name', 'username', 'password', 'role']);
                $id = $this->model->createUser($input);
                jsonResponse(['status' => 'success', 'message' => 'User created successfully', 'id' => $id]);
            }
        } catch (\RuntimeException $e) {
            jsonResponse(['status' => 'error', 'error' => $e->getMessage()], 422);
        }
    }

    public function handlePut()
    {
        $input = jsonInput();
        requireFields($input, ['id', 'name', 'username', 'role']);
        try {
            $this->model->updateUser($input);
            jsonResponse(['status' => 'success', 'message' => 'User updated successfully']);
        } catch (\RuntimeException $e) {
            jsonResponse(['status' => 'error', 'error' => $e->getMessage()], 422);
        }
    }

    public function handleDelete()
    {
        $input = jsonInput();
        $id = $_GET['id'] ?? ($input['id'] ?? null);
        if (!$id) {
            jsonResponse(['status' => 'error', 'error' => 'ID is required'], 422);
        }
        $this->model->delete($id);
        jsonResponse(['status' => 'success', 'message' => 'User deleted successfully']);
    }
}
