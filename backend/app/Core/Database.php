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
        $host = envValue('DB_HOST', '127.0.0.1');
        $port = envValue('DB_PORT', '3306');
        $db = envValue('DB_NAME', 'gfs_akomodasi_db');
        $user = envValue('DB_USER', 'root');
        $pass = envValue('DB_PASS', '');
        $charset = envValue('DB_CHARSET', 'utf8mb4');

        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', $host, $port, $db, $charset);
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        try {
            $this->pdo = new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Database connection failed: ' . $e->getMessage()], 500);
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
