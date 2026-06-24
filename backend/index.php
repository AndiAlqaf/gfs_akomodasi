<?php
// Simple router for PHP built-in server
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$file = __DIR__ . $path;

// Serve existing files directly
if (file_exists($file) && is_file($file)) {
    return false; // Tells the built-in server to serve the file as-is
}

// Optional: you can add routing logic here if needed
// For now, if file doesn't exist, return 404 JSON
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(["error" => "File not found", "path" => $path]);
