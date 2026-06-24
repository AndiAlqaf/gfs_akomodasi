<?php
if (!function_exists('loadEnvFile')) {
    function loadEnvFile($path)
    {
        if (!is_file($path) || !is_readable($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
                continue;
            }

            list($name, $value) = array_map('trim', explode('=', $line, 2));
            if ($name === '') {
                continue;
            }

            $value = trim($value, "\"'");

            if (getenv($name) === false) {
                putenv($name . '=' . $value);
            }

            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

if (!function_exists('envValue')) {
    function envValue($key, $default = null)
    {
        $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);

        if ($value === false || $value === null || $value === '') {
            return $default;
        }

        return $value;
    }
}

if (!function_exists('jsonInput')) {
    function jsonInput()
    {
        static $payload = null;

        if ($payload !== null) {
            return $payload;
        }

        $rawBody = file_get_contents('php://input');
        if ($rawBody === false || trim($rawBody) === '') {
            $payload = [];
            return $payload;
        }

        $decoded = json_decode($rawBody, true);
        $payload = is_array($decoded) ? $decoded : [];

        return $payload;
    }
}

if (!function_exists('jsonResponse')) {
    function jsonResponse($payload, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($payload);
        exit();
    }
}

loadEnvFile(__DIR__ . '/.env');

$allowedOrigins = trim((string) envValue('APP_ALLOWED_ORIGINS', '*'));
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($allowedOrigins === '' || $allowedOrigins === '*') {
    header('Access-Control-Allow-Origin: *');
} else {
    $origins = array_filter(array_map('trim', explode(',', $allowedOrigins)));
    if ($requestOrigin !== '' && in_array($requestOrigin, $origins, true)) {
        header('Access-Control-Allow-Origin: ' . $requestOrigin);
        header('Vary: Origin');
    }
}

header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

$timezone = envValue('APP_TIMEZONE', 'Asia/Singapore');
if (is_string($timezone) && $timezone !== '') {
    date_default_timezone_set($timezone);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    jsonResponse(['error' => 'Connection failed: ' . $e->getMessage()], 500);
}
?>
