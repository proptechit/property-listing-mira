<?php

require 'helpers/response.php';
require 'helpers/request.php';
require 'helpers/bitrix.php';
require 'helpers/transform.php';

$map = require 'mappings/developers.php';

if ($method === 'GET') {
    // Single item
    if ($id) {
        $res = bitrixRequest('crm.item.get', [
            'entityTypeId' => DEVELOPERS_ENTITY_ID,
            'id' => $id,
            'select' => array_values($map)
        ]);

        if (empty($res['result']['item'])) {
            jsonResponse(['error' => 'Not found'], 404);
        }

        jsonResponse(
            fromBitrixFields($res['result']['item'], $map)
        );
    }

    $all = isset($_GET['all']) && $_GET['all'] === 'true';

    if ($all) {
        $allDevelopers = [];
        $currentStart = 0;

        do {
            $res = bitrixRequest('crm.item.list', [
                'entityTypeId' => DEVELOPERS_ENTITY_ID,
                'select'       => array_values($map),
                'start'        => $currentStart,
                'order'        => ['title' => 'ASC']
            ]);

            $batch = $res['result']['items'] ?? [];
            $allDevelopers = array_merge($allDevelopers, $batch);

            if (!isset($res['next'])) {
                break;
            }

            $currentStart = $res['next'];
        } while (true);

        $developers = array_map(
            fn($item) => fromBitrixFields($item, $map),
            $allDevelopers
        );

        jsonResponse([
            'data' => $developers,
            'pagination' => [
                'all' => true,
                'total' => count($developers),
            ],
        ]);
    }

    // Paginated mode (default)
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = 50;
    $start = ($page - 1) * $limit;

    $filter = [];
    if (!empty($_GET['q'])) {
        $filter['%title'] = $_GET['q'];
    }

    $res = bitrixRequest('crm.item.list', [
        'entityTypeId' => DEVELOPERS_ENTITY_ID,
        'filter'       => $filter,
        'select'       => array_values($map),
        'start'        => $start,
        'order'        => ['title' => 'ASC']
    ]);

    $items = $res['result']['items'] ?? [];
    $total = $res['total'] ?? count($items);

    $developers = array_map(
        fn($item) => fromBitrixFields($item, $map),
        $items
    );

    jsonResponse([
        'data' => $developers,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
}
