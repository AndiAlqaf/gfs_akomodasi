<?php

namespace App\Models;

use App\Core\Database;

class BaseModel
{
    protected $table;

    public function all()
    {
        return Database::fetchAll("SELECT * FROM {$this->table} ORDER BY id ASC");
    }

    public function find($id)
    {
        return Database::fetch("SELECT * FROM {$this->table} WHERE id = ?", [$id]);
    }

    public function delete($id)
    {
        return Database::execute("DELETE FROM {$this->table} WHERE id = ?", [$id]);
    }
}
