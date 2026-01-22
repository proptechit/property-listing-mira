<?php

require 'helpers/response.php';
require 'helpers/request.php';
require 'helpers/bitrix.php';
require 'helpers/transform.php';

$map = require 'mappings/listings.php';
$enums = require 'enums/listings.php';

/**
 * GET /api/?resource=listings
 * GET /api/?resource=listings/{id}
 */
if ($method === 'GET') {

    // single item
    if ($id) {
        $res = bitrixRequest('crm.item.get', [
            'entityTypeId' => LISTINGS_ENTITY_ID,
            'id' => $id
        ]);

        if (empty($res['result']['item'])) {
            jsonResponse(['error' => 'Not found'], 404);
        }

        jsonResponse(
            fromBitrixFields($res['result']['item'], $map, $enums)
        );
    }

    // list items
    $filter = mapFilters($_GET, $map);

    // Pagination parameters - Bitrix default limit is 50
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = 50; // Bitrix default limit
    $start = ($page - 1) * $limit;

    $res = bitrixRequest('crm.item.list', [
        'entityTypeId' => LISTINGS_ENTITY_ID,
        'filter'       => $filter,
        'select'       => array_values($map),
        'start'        => $start
        // Don't pass limit - use Bitrix default of 50
    ]);

    $items = $res['result']['items'] ?? [];
    $total = $res['total'] ?? count($items);

    $output = array_map(
        fn($item) => fromBitrixFields($item, $map, $enums),
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

/**
 * POST /api/?resource=listings
 */
if ($method === 'POST') {

    $input = getRequestBody();

    $fields = toBitrixFields($input, $map, $enums);

    if (empty($fields)) {
        jsonResponse([
            'error' => 'No valid fields provided'
        ], 422);
    }

    $res = bitrixRequest('crm.item.create', [
        'entityTypeId' => LISTINGS_ENTITY_ID,
        'fields'       => $fields
    ]);

    if (!empty($res['error'])) {
        jsonResponse([
            'error'   => 'Bitrix error',
            'details' => $res
        ], 500);
    }

    jsonResponse(
        fromBitrixFields($res['result']['item'], $map, $enums),
        201
    );
}

/**
 * PUT /api/?resource=listings&id={id}
 */
if ($method === 'PUT') {

    if (!$id) {
        jsonResponse(['error' => 'ID is required'], 400);
    }

    $input  = getRequestBody();
    $fields = toBitrixFields($input, $map, $enums);

    if (empty($fields)) {
        jsonResponse([
            'error' => 'No valid fields provided'
        ], 422);
    }

    $res = bitrixRequest('crm.item.update', [
        'entityTypeId' => LISTINGS_ENTITY_ID,
        'id'           => $id,
        'fields'       => $fields
    ]);

    if (!empty($res['error'])) {
        jsonResponse([
            'error'   => 'Bitrix error',
            'details' => $res
        ], 500);
    }

    jsonResponse(
        fromBitrixFields($res['result']['item'], $map, $enums)
    );
}

/**
 * DELETE /api/?resource=listings&id={id}
 */
if ($method === 'DELETE') {

    if (!$id) {
        jsonResponse(['error' => 'ID is required'], 400);
    }

    bitrixRequest('crm.item.delete', [
        'entityTypeId' => LISTINGS_ENTITY_ID,
        'id'           => $id
    ]);

    jsonResponse(['message' => 'Deleted']);
}
