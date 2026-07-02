<?php
$requestPath = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$backendRoot = realpath(__DIR__);

$resolveBackendFile = function ($path) use ($backendRoot) {
    $candidate = realpath($backendRoot . DIRECTORY_SEPARATOR . ltrim($path, '/\\'));
    if ($candidate === false) {
        return false;
    }

    $normalizedRoot = str_replace('\\', '/', $backendRoot);
    $normalizedCandidate = str_replace('\\', '/', $candidate);

    if (strpos($normalizedCandidate, $normalizedRoot) !== 0 || !is_file($candidate)) {
        return false;
    }

    return $candidate;
};

if ($requestPath === '/' || $requestPath === '/api' || $requestPath === '/api/') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'name' => 'gfs-akomodasi-api',
        'status' => 'ok',
        'server' => 'php-built-in',
        'port' => 31145,
        'timestamp' => date(DATE_ATOM),
    ]);
    return true;
}

if (strpos($requestPath, '/api/') === 0) {
    $aliasedPath = substr($requestPath, 4);
    $apiFile = $resolveBackendFile($aliasedPath);

    if ($apiFile !== false) {
        require $apiFile;
        return true;
    }
}

$directFile = $resolveBackendFile($requestPath);
if ($directFile !== false) {
    return false;
}

http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'error' => 'File not found',
    'path' => $requestPath,
]);
