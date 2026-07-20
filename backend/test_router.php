<?php
$requestPath = '/api/dashboard.php';
$backendRoot = realpath(__DIR__);
$resolveBackendFile = function ($path) use ($backendRoot) {
    $candidate = realpath($backendRoot . DIRECTORY_SEPARATOR . ltrim($path, '/\\'));
    if ($candidate === false) { return false; }
    $normalizedRoot = str_replace('\\', '/', $backendRoot);
    $normalizedCandidate = str_replace('\\', '/', $candidate);
    var_dump("normalizedRoot: $normalizedRoot", "normalizedCandidate: $normalizedCandidate");
    if (strpos($normalizedCandidate, $normalizedRoot) !== 0 || !is_file($candidate)) {
        return false;
    }
    return $candidate;
};

$aliasedPath = substr($requestPath, 4);
$apiFile = $resolveBackendFile($aliasedPath);
var_dump($apiFile);
