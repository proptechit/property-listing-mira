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
    $order = ['ID' => 'DESC'];

    if (!empty($_GET['q'])) {
        $filter['%title'] = $_GET['q'];
        $order = ['ID' => 'ASC']; // Prioritize older items (communities/parents) for searches
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
        'start'        => $start,
        'order'        => $order,
        // Don't pass limit - use Bitrix default of 50
    ]);

    $items = $res['result']['items'] ?? [];
    $total = $res['total'] ?? count($items);

    $output = array_map(
        fn($item) => fromBitrixFields($item, $map),
        $items
    );

    // Sort results intelligently if searching
    if (!empty($_GET['q'])) {
        $q = strtolower(trim($_GET['q']));
        usort($output, function($a, $b) use ($q) {
            $nameA = strtolower($a['name'] ?? '');
            $nameB = strtolower($b['name'] ?? '');

            // 1. Exact match (case insensitive)
            $exactA = ($nameA === $q);
            $exactB = ($nameB === $q);
            if ($exactA && !$exactB) return -1;
            if (!$exactA && $exactB) return 1;

            // 2. Starts with (case-insensitive)
            $startsWithA = (strpos($nameA, $q) === 0);
            $startsWithB = (strpos($nameB, $q) === 0);
            if ($startsWithA && !$startsWithB) return -1;
            if (!$startsWithA && $startsWithB) return 1;

            // 3. String length (shorter names first, e.g. parent communities)
            $lenA = strlen($nameA);
            $lenB = strlen($nameB);
            if ($lenA !== $lenB) {
                return $lenA - $lenB;
            }

            // 4. Fallback to ID (ASC)
            return (int)($a['id'] ?? 0) - (int)($b['id'] ?? 0);
        });
    }

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

    $res = bitrixRequest('crm.item.add', [
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

if ($method === 'PUT') {

    if (!$id) {
        jsonResponse(['error' => 'ID is required'], 400);
    }

    $input = getRequestBody();

    $fields = toBitrixFields($input, $map);

    if (empty($fields)) {
        jsonResponse([
            'error' => 'No valid fields provided'
        ], 422);
    }

    $res = bitrixRequest('crm.item.update', [
        'entityTypeId' => LOCATIONS_ENTITY_ID,
        'id'           => $id,
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
        200
    );
}
