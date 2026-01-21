<?php

require 'helpers/response.php';
require 'helpers/request.php';
require 'helpers/bitrix.php';
require 'helpers/transform.php';

$map = require 'mappings/locations.php';


if ($method === 'GET') {
    // single item
    if ($id) {
        $res = bitrixRequest('crm.item.get', [
            'entityTypeId' => LOCATIONS_ENTITY_ID,
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

    $filter = [];

    if (!empty($_GET['q'])) {
        $filter['%title'] = $_GET['q'];
    }

    $mappedFilters = mapFilters($_GET, $map);
    $filter = array_merge($filter, $mappedFilters);

    // Pagination parameters - Bitrix default limit is 50
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = 50; // Bitrix default limit
    $start = ($page - 1) * $limit;

    $res = bitrixRequest('crm.item.list', [
        'entityTypeId' => LOCATIONS_ENTITY_ID,
        'filter'       => $filter,
        'select'       => array_values($map),
        'start'        => $start
        // Don't pass limit - use Bitrix default of 50
    ]);

    $items = $res['result']['items'] ?? [];
    $total = $res['total'] ?? count($items);

    $output = array_map(
        fn($item) => fromBitrixFields($item, $map),
        $items
    );

    jsonResponse([
        'data' => $output,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
}

if ($method === 'POST') {

    $input = getRequestBody();

    $fields = toBitrixFields($input, $map);

    if (empty($fields)) {
        jsonResponse([
            'error' => 'No valid fields provided'
        ], 422);
    }

    $res = bitrixRequest('crm.item.create', [
        'entityTypeId' => LOCATIONS_ENTITY_ID,
        'fields'       => $fields
    ]);

    if (!empty($res['error'])) {
        jsonResponse([
            'error'   => 'Bitrix error',
            'details' => $res
        ], 500);
    }

    $item = $res['result']['item'] ?? [];

    jsonResponse(
        fromBitrixFields($item, $map),
        201
    );
}
