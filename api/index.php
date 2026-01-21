<?php
require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = explode('/', trim($path, '/'));

// path-based
$resourceFromPath = $uri[1] ?? null;
$id               = $uri[2] ?? null;

// query-based
$resourceFromQuery = $_GET['resource'] ?? null;

// decide final resource
$resource = $resourceFromPath ?: $resourceFromQuery;

switch ($resource) {
    case 'listings':
        require 'controllers/listings.php';
        break;

    case 'agents':
        require 'controllers/agents.php';
        break;

    case 'owners':
        require 'controllers/owners.php';
        break;

    case 'locations':
        require 'controllers/locations.php';
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'error'     => 'Invalid endpoint',
            'requested' => $resource
        ], JSON_PRETTY_PRINT);
}
