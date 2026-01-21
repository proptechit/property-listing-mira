<?php
require 'helpers/response.php';
require 'helpers/bitrix.php';
require 'helpers/transform.php';

$map = require 'mappings/users.php';

// Pagination parameters - Bitrix default limit is 50
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = 50; // Bitrix default limit
$start = ($page - 1) * $limit;

// Fetch all users (Bitrix user.get doesn't support pagination directly)
// Don't pass limit - use Bitrix default of 50
$res = bitrixRequest('user.get', [
    'filter' => ['ACTIVE' => 'Y'],
    'start' => $start,
    'select' => array_values($map)
]);

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
