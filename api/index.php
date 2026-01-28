<?php
require 'config.php';

/**
 * ======================
 * CORS CONFIG (localhost)
 * ======================
 */
$allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-KEY');
header('Content-Type: application/json');

/**
 * Handle preflight request
 */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// ONLY use query-based routing
$resource = $_GET['resource'] ?? null;
$id       = $_GET['id'] ?? null;

if (!$resource) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Missing resource parameter'
    ], JSON_PRETTY_PRINT);
    exit;
}

switch ($resource) {
    case 'listings':
        require __DIR__ . '/controllers/listings.php';
        break;

    case 'agents':
        require __DIR__ . '/controllers/agents.php';
        break;

    case 'owners':
        require __DIR__ . '/controllers/owners.php';
        break;

    case 'locations':
        require __DIR__ . '/controllers/locations.php';
        break;

    case 'reports':
        require __DIR__ . '/controllers/reports.php';
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'error'     => 'Invalid endpoint',
            'requested' => $resource
        ], JSON_PRETTY_PRINT);
        break;
}
