<?php
$page = $_GET['page'] ?? 'listings';
$action = $_GET['action'] ?? 'list';

// Handle special cases
if ($page === 'reports') {
    $viewPath = __DIR__ . "/views/reports/index.php";
} else {
    $viewPath = __DIR__ . "/views/$page/$action.php";
}

if (!file_exists($viewPath)) {
    http_response_code(404);
    echo "Page not found";
    exit;
}

require __DIR__ . '/views/partials/header.php';
require __DIR__ . '/views/partials/sidebar.php';
require $viewPath;
require __DIR__ . '/views/partials/footer.php';
