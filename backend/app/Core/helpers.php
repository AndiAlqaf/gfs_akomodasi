<?php

if (!function_exists('jsonResponse')) {
    function jsonResponse($payload, $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload);
        exit();
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

if (!function_exists('requireFields')) {
    function requireFields($data, $fields)
    {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
                jsonResponse(['error' => 'Field "' . $field . '" is required'], 422);
            }
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
