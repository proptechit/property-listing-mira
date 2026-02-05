<?php
require 'helpers/response.php';
require 'helpers/bitrix.php';
require 'helpers/transform.php';

$map = require 'mappings/users.php';

$page  = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = 50;
$start = ($page - 1) * $limit;

$all = isset($_GET['all']) && $_GET['all'] === 'true';

$paramsBase = [
    'select' => array_values($map),
];

if (!empty($_GET['id'])) {
    $paramsBase['ID'] = $_GET['id'];
}

/**
 * FETCH ALL USERS (only when all=true)
 */
if ($all) {
    $allUsers = [];
    $currentStart = 0;

    do {
        $params = $paramsBase;
        $params['start'] = $currentStart;

        $res = bitrixRequest('user.get', $params);

        $batch = $res['result'] ?? [];
        $allUsers = array_merge($allUsers, $batch);

        if (!isset($res['next'])) {
            break;
        }

        $currentStart = $res['next'];
    } while (true);

    $users = array_map(
        fn($u) => fromBitrixFields($u, $map),
        $allUsers
    );

    jsonResponse([
        'data' => $users,
        'pagination' => [
            'all' => true,
            'total' => count($users),
        ],
    ]);
}

/**
 * PAGINATED MODE (default)
 */
$params = $paramsBase;
$params['start'] = $start;

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
        'total_pages' => ceil($total / $limit),
    ],
]);
