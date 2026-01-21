<?php
require 'config.php';

header('Content-Type: application/json');

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

    default:
        http_response_code(404);
        echo json_encode([
            'error'     => 'Invalid endpoint',
            'requested' => $resource
        ], JSON_PRETTY_PRINT);
        break;
}
