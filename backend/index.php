<?php

// Autoloader sederhana untuk namespace App
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/app/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

// Load helpers
require_once __DIR__ . '/app/Core/helpers.php';

// Handler error global: klien hanya menerima pesan generik, detailnya ke log.
// Tanpa ini, exception yang tidak tertangkap menghasilkan body kosong (dan
// dengan display_errors=On di server lama, justru membocorkan stack trace).
set_exception_handler(function ($e) {
    error_log('GFS uncaught ' . get_class($e) . ': ' . $e->getMessage()
        . ' @ ' . $e->getFile() . ':' . $e->getLine());
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode(['error' => 'Internal server error']);
    exit;
});

require_once __DIR__ . '/db.php'; // Keep existing DB init for backward compatibility during transition

use App\Core\Router;

$router = new Router();

// ==============================================
// 1. Legacy RPC Routes (to be deprecated)
// ==============================================
$router->get('/data-register', 'DataRegisterController@handleGet');
$router->post('/data-register', 'DataRegisterController@handlePost');

// ==============================================
// 2. New RESTful Routes (MVC)
// ==============================================
$router->get('/guests', 'GuestController@index');
$router->post('/guests', 'GuestController@store');

$router->get('/rooms', 'RoomController@index');
$router->post('/rooms/status', 'RoomController@updateStatus'); // Alternative cleaner path
$router->post('/rooms', 'RoomController@updateStatus'); // Legacy support path

$router->get('/meals', 'MealsController@index');
$router->post('/meals/request', 'MealsController@createRequest'); // Alternative path
$router->post('/meals/approve', 'MealsController@approveRequest'); // Alternative path
$router->post('/meals', 'MealsController@legacyHandler');

$router->get('/laundry', 'LaundryController@index');
$router->post('/laundry', 'LaundryController@handlePost');

$router->get('/reservations', 'ReservationController@index');
$router->post('/reservations', 'ReservationController@handlePost');

$router->get('/meeting-rooms', 'MeetingRoomController@index');
$router->post('/meeting-rooms', 'MeetingRoomController@handlePost');

$router->get('/dashboard', 'DashboardController@index');

$router->get('/information', 'InformationController@index');

$router->get('/users', 'UserController@index');
$router->post('/users', 'UserController@handlePost');
$router->put('/users', 'UserController@handlePut');
$router->delete('/users', 'UserController@handleDelete');

// ==============================================
// Dispatch Request
// ==============================================
$requestPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');

// Handle API base route — healthcheck minimal.
// Jangan kembalikan nama service, jenis server, atau port internal:
// itu memetakan stack produksi untuk penyerang.
if ($requestPath === '/' || $requestPath === '/api' || $requestPath === '/api/') {
    jsonResponse([
        'status' => 'ok',
        'timestamp' => date(DATE_ATOM),
    ]);
}

// Route API requests
if (strpos($requestPath, '/api/') === 0) {
    $aliasedPath = substr($requestPath, 4); // remove '/api'
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    
    // Try MVC router first (we modify dispatch to return false if route not found)
    if ($router->dispatch($method, $aliasedPath)) {
        return true;
    }
    
    // Fallback to legacy flat PHP files.
    // Hardening: tolak path traversal (termasuk yang tiba di sini sebagai
    // %2e%2e lalu di-rawurldecode), dan hanya izinkan .php di dalam
    // app/Legacy — bukan file apa pun yang bisa dicapai lewat ../.
    $legacyPath = ltrim($aliasedPath, '/\\');
    $legacyRoot = realpath(__DIR__ . '/app/Legacy');

    if ($legacyRoot !== false && $legacyPath !== '' && strpos($legacyPath, '..') === false) {
        $candidate = realpath($legacyRoot . DIRECTORY_SEPARATOR . $legacyPath);

        if ($candidate !== false
            && strpos($candidate, $legacyRoot . DIRECTORY_SEPARATOR) === 0
            && is_file($candidate)
            && strtolower(pathinfo($candidate, PATHINFO_EXTENSION)) === 'php'
        ) {
            require $candidate;
            return true;
        }
    }
}

// Fallback for static files or unresolved paths.
// Status HARUS 404: sebelumnya http_response_code(404) ditimpa oleh default
// 200 di jsonResponse(), sehingga route yang tidak ada membalas 200 OK.
http_response_code(404);
jsonResponse([
    'error' => 'Route not found or file does not exist',
    'path' => $requestPath,
], 404);
