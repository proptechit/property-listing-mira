<?php
require 'helpers/response.php';
require 'helpers/bitrix.php';
require 'helpers/transform.php';

$map = require 'mappings/users.php';

// Pagination parameters - Bitrix default limit is 50
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = 50; // Bitrix default limit
$start = ($page - 1) * $limit;

$params = [
    'start' => $start,
    'select' => array_values($map)
];

if (!empty($_GET['id'])) {
    $params['ID'] = $_GET['id'];
}

$res = bitrixRequest('user.get', $params);

$users = $res['result'] ?? [];
$total = $res['total'] ?? count($users);

$users = array_map(
    fn($u) => fromBitrixFields($u, $map),
    $users
);

jsonResponse([
    'data' => $users,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
        'total_pages' => ceil($total / $limit)
    ]
]);
