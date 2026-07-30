<?php

namespace App\Controllers;

use App\Models\AreaModel;
use App\Models\MessModel;
use App\Models\RoomModel;
use App\Models\GuestModel;
use App\Models\MealsDpModel;
use App\Models\LaundryDpModel;
use App\Models\LaundryBagModel;
use App\Models\MeetingRoomModel;

class DataRegisterController
{
    public function handleGet()
    {
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'get_areas':
                $model = new AreaModel();
                jsonResponse(['data' => $model->all()]);
                break;
            case 'get_messes':
                $model = new MessModel();
                jsonResponse(['data' => $model->allWithAreas()]);
                break;
            case 'get_rooms':
                $model = new RoomModel();
                jsonResponse(['data' => $model->allWithMesses()]);
                break;
            case 'get_guests':
                $model = new GuestModel();
                jsonResponse(['data' => $model->allWithRelations()]);
                break;
            case 'get_meals_dp':
                $model = new MealsDpModel();
                jsonResponse(['data' => $model->allWithAreas()]);
                break;
            case 'get_laundry_dp':
                $model = new LaundryDpModel();
                jsonResponse(['data' => $model->allWithAreas()]);
                break;
            case 'get_laundry_bag':
                $model = new LaundryBagModel();
                jsonResponse(['data' => $model->allWithRooms()]);
                break;
            case 'get_meeting_rooms':
                $model = new MeetingRoomModel();
                jsonResponse(['data' => $model->all()]);
                break;
            default:
                jsonResponse(['error' => 'Invalid GET action'], 400);
        }
    }

    public function handlePost()
    {
        $action = $_GET['action'] ?? '';
        $data = jsonInput();
        $registeredBy = $data['registered_by'] ?? 'System';

        if (strpos($action, 'add_') === 0) {
            return $this->handleAdd($action, $data, $registeredBy);
        } elseif (strpos($action, 'update_') === 0) {
            return $this->handleUpdate($action, $data);
        } elseif (strpos($action, 'delete_') === 0) {
            return $this->handleDelete($action, $data);
        }

        jsonResponse(['error' => 'Invalid POST action'], 400);
    }

    private function handleAdd($action, $data, $registeredBy)
    {
        switch ($action) {
            case 'add_area':
                requireFields($data, ['area_name', 'area_id']);
                \App\Core\Database::execute('INSERT INTO areas (area_name, area_id, registered_by, remarks) VALUES (?, ?, ?, ?)', 
                    [$data['area_name'], $data['area_id'], $registeredBy, $data['remarks'] ?? '']);
                break;
            case 'add_mess':
                requireFields($data, ['mess_name', 'mess_id', 'area_id']);
                \App\Core\Database::execute('INSERT INTO messes (mess_name, mess_id, area_id, rooms_count, mess_status, managed_by, registered_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [$data['mess_name'], $data['mess_id'], $data['area_id'], $data['rooms_count'] ?? 0, $data['mess_status'] ?? 'OWNED BY CERIA', $data['managed_by'] ?? '', $registeredBy, $data['remarks'] ?? '']);
                break;
            case 'add_room':
                requireFields($data, ['room_no', 'mess_id']);
                \App\Core\Database::execute('INSERT INTO rooms (room_no, mess_id, room_allocation, beds, room_status, registered_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [$data['room_no'], $data['mess_id'], $data['room_allocation'] ?? 'REGULAR GUEST', $data['beds'] ?? 1, $data['room_status'] ?? 'READY', $registeredBy, $data['remarks'] ?? '']);
                \App\Core\Database::execute('UPDATE messes SET rooms_count = rooms_count + 1 WHERE id = ?', [$data['mess_id']]);
                break;
            case 'add_meals_dp':
                requireFields($data, ['delivery_point', 'area_id']);
                \App\Core\Database::execute('INSERT INTO meals_dp (delivery_point, area_id, canteen_status, registered_by, remarks) VALUES (?, ?, ?, ?, ?)',
                    [$data['delivery_point'], $data['area_id'], $data['canteen_status'] ?? 'READY', $registeredBy, $data['remarks'] ?? '']);
                break;
            case 'add_laundry_dp':
                requireFields($data, ['point_name', 'area_id']);
                \App\Core\Database::execute('INSERT INTO laundry_dp (point_name, area_id, dp_status, registered_by, remarks) VALUES (?, ?, ?, ?, ?)',
                    [$data['point_name'], $data['area_id'], $data['dp_status'] ?? 'READY', $registeredBy, $data['remarks'] ?? '']);
                break;
            case 'add_laundry_bag':
                requireFields($data, ['nama', 'room_id']);
                \App\Core\Database::execute('INSERT INTO laundry_bag (nama, room_id, laundry_bag, laundry_box, registered_by, remarks) VALUES (?, ?, ?, ?, ?, ?)',
                    [$data['nama'], $data['room_id'], $data['laundry_bag'] ?? '', $data['laundry_box'] ?? '', $registeredBy, $data['remarks'] ?? '']);
                break;
            case 'add_guest':
                requireFields($data, ['room_id', 'name']);
                \App\Core\Database::execute('INSERT INTO guests (room_id, name, institution_company, occupants_category, personal_identification, reg_id_card, job, position, level_category, meals_packages, breakfast_dp, lunch_dp, dinner_dp, registered_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [$data['room_id'], $data['name'], $data['institution_company'] ?? '', $data['occupants_category'] ?? 'REGULAR GUEST', $data['personal_identification'] ?? '', $data['reg_id_card'] ?? '', $data['job'] ?? '', $data['position'] ?? '', $data['level_category'] ?? '', $data['meals_packages'] ?? '', $data['breakfast_dp'] ?? '', $data['lunch_dp'] ?? '', $data['dinner_dp'] ?? '', $registeredBy, $data['remarks'] ?? '']);
                break;
            case 'add_meeting_room':
                requireFields($data, ['meeting_room', 'building', 'capacity']);
                \App\Core\Database::execute('INSERT INTO meeting_rooms (room, building, capacity, status) VALUES (?, ?, ?, ?)',
                    [$data['meeting_room'], $data['building'], $data['capacity'], $data['room_status'] ?? 'READY']);
                break;
            default:
                jsonResponse(['error' => 'Invalid POST action'], 400);
        }
        jsonResponse(['success' => true], 201);
    }

    private function handleUpdate($action, $data)
    {
        switch ($action) {
            case 'update_area':
                requireFields($data, ['id', 'area_name', 'area_id']);
                \App\Core\Database::execute('UPDATE areas SET area_name = ?, area_id = ?, remarks = ? WHERE id = ?',
                    [$data['area_name'], $data['area_id'], $data['remarks'] ?? '', $data['id']]);
                break;
            case 'update_mess':
                requireFields($data, ['id', 'mess_name', 'mess_id', 'area_id']);
                \App\Core\Database::execute('UPDATE messes SET mess_name = ?, mess_id = ?, area_id = ?, rooms_count = ?, mess_status = ?, managed_by = ?, remarks = ? WHERE id = ?',
                    [$data['mess_name'], $data['mess_id'], $data['area_id'], $data['rooms_count'] ?? 0, $data['mess_status'] ?? 'OWNED BY CERIA', $data['managed_by'] ?? '', $data['remarks'] ?? '', $data['id']]);
                break;
            case 'update_room':
                requireFields($data, ['id', 'room_no', 'mess_id']);
                \App\Core\Database::execute('UPDATE rooms SET room_no = ?, mess_id = ?, room_allocation = ?, beds = ?, room_status = ?, remarks = ? WHERE id = ?',
                    [$data['room_no'], $data['mess_id'], $data['room_allocation'] ?? 'REGULAR GUEST', $data['beds'] ?? 1, $data['room_status'] ?? 'READY', $data['remarks'] ?? '', $data['id']]);
                break;
            case 'update_meals_dp':
                requireFields($data, ['id', 'delivery_point', 'area_id']);
                \App\Core\Database::execute('UPDATE meals_dp SET delivery_point = ?, area_id = ?, canteen_status = ?, remarks = ? WHERE id = ?',
                    [$data['delivery_point'], $data['area_id'], $data['canteen_status'] ?? 'READY', $data['remarks'] ?? '', $data['id']]);
                break;
            case 'update_laundry_dp':
                requireFields($data, ['id', 'point_name', 'area_id']);
                \App\Core\Database::execute('UPDATE laundry_dp SET point_name = ?, area_id = ?, dp_status = ?, remarks = ? WHERE id = ?',
                    [$data['point_name'], $data['area_id'], $data['dp_status'] ?? 'READY', $data['remarks'] ?? '', $data['id']]);
                break;
            case 'update_laundry_bag':
                requireFields($data, ['id', 'nama', 'room_id']);
                \App\Core\Database::execute('UPDATE laundry_bag SET nama = ?, room_id = ?, laundry_bag = ?, laundry_box = ?, remarks = ? WHERE id = ?',
                    [$data['nama'], $data['room_id'], $data['laundry_bag'] ?? '', $data['laundry_box'] ?? '', $data['remarks'] ?? '', $data['id']]);
                break;
            case 'update_guest':
                requireFields($data, ['id', 'room_id', 'name']);
                \App\Core\Database::execute('UPDATE guests SET room_id = ?, name = ?, institution_company = ?, occupants_category = ?, personal_identification = ?, reg_id_card = ?, job = ?, position = ?, level_category = ?, meals_packages = ?, breakfast_dp = ?, lunch_dp = ?, dinner_dp = ?, remarks = ? WHERE id = ?',
                    [$data['room_id'], $data['name'], $data['institution_company'] ?? '', $data['occupants_category'] ?? 'REGULAR GUEST', $data['personal_identification'] ?? '', $data['reg_id_card'] ?? '', $data['job'] ?? '', $data['position'] ?? '', $data['level_category'] ?? '', $data['meals_packages'] ?? '', $data['breakfast_dp'] ?? '', $data['lunch_dp'] ?? '', $data['dinner_dp'] ?? '', $data['remarks'] ?? '', $data['id']]);
                break;
            case 'update_meeting_room':
                requireFields($data, ['id', 'meeting_room', 'building', 'capacity']);
                \App\Core\Database::execute('UPDATE meeting_rooms SET room = ?, building = ?, capacity = ?, status = ? WHERE id = ?',
                    [$data['meeting_room'], $data['building'], $data['capacity'], $data['room_status'] ?? 'READY', $data['id']]);
                break;
            default:
                jsonResponse(['error' => 'Invalid POST action'], 400);
        }
        jsonResponse(['success' => true]);
    }

    private function handleDelete($action, $data)
    {
        requireFields($data, ['id']);
        $id = $data['id'];
        
        switch ($action) {
            case 'delete_area': (new AreaModel())->delete($id); break;
            case 'delete_mess': (new MessModel())->delete($id); break;
            case 'delete_room': (new RoomModel())->delete($id); break;
            case 'delete_guest': (new GuestModel())->delete($id); break;
            case 'delete_meals_dp': (new MealsDpModel())->delete($id); break;
            case 'delete_laundry_dp': (new LaundryDpModel())->delete($id); break;
            case 'delete_laundry_bag': (new LaundryBagModel())->delete($id); break;
            case 'delete_meeting_room': (new MeetingRoomModel())->delete($id); break;
        }
        jsonResponse(['success' => true]);
    }
}
