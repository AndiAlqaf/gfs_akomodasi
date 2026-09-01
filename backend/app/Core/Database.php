<?php

namespace App\Core;

use PDO;
use PDOException;

class Database
{
    private static $instance = null;
    private $pdo;

    private function __construct()
    {
        global $pdo;
        if (!isset($pdo) || !$pdo instanceof PDO) {
            $dbPath = dirname(__DIR__, 2) . '/db.php';
            if (file_exists($dbPath)) {
                require_once $dbPath;
            }
        }
        
        if (isset($pdo) && $pdo instanceof PDO) {
            $this->pdo = $pdo;
        } else {
            // Fallback error if db.php somehow didn't set $pdo
            http_response_code(500);
            echo json_encode(['error' => 'Database connection not initialized.']);
            exit();
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->pdo;
    }

    public static function query($sql, $params = [])
    {
        $stmt = self::getInstance()->getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public static function fetchAll($sql, $params = [])
    {
        return self::query($sql, $params)->fetchAll();
    }

    public static function fetch($sql, $params = [])
    {
        return self::query($sql, $params)->fetch();
    }
    
    public static function execute($sql, $params = [])
    {
        return self::query($sql, $params)->rowCount();
    }

    public static function lastInsertId()
    {
        return self::getInstance()->getConnection()->lastInsertId();
    }

    public static function fetchColumn($sql, $params = [])
    {
        return self::query($sql, $params)->fetchColumn();
    }

    public static function beginTransaction()
    {
        self::getInstance()->getConnection()->beginTransaction();
    }

    public static function commit()
    {
        self::getInstance()->getConnection()->commit();
    }

    public static function rollBack()
    {
        self::getInstance()->getConnection()->rollBack();
    }
}
