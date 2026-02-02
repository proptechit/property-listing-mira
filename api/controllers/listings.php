<?php

require 'helpers/response.php';
require 'helpers/request.php';
require 'helpers/bitrix.php';
require 'helpers/transform.php';
require 'helpers/location-cache.php';
require 'helpers/user-cache.php';

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
        'start'        => $start,
        'order'        => ['ID' => 'DESC'],
        // Don't pass limit - use Bitrix default of 50
    ]);

    $items = $res['result']['items'] ?? [];
    $total = $res['total'] ?? count($items);

    $output = array_map(
        fn($item) => fromBitrixFields($item, $map, $enums),
        $items
    );

    $locationIds = [];
    $userIds = [];

    foreach ($output as $item) {
        if (!empty($item['location'])) {
            $locationIds[] = $item['location'];
        }

        if (!empty($item['listing_agent'])) {
            $userIds[] = $item['listing_agent'];
        }

        if (!empty($item['listing_owner'])) {
            $userIds[] = $item['listing_owner'];
        }
    }

    $locationIds = array_values(array_unique($locationIds));
    $userIds = array_values(array_unique($userIds));

    $locationCache = getLocationCache();
    $userCache = getUserCache();

    $missingLocationIds = array_diff($locationIds, array_keys($locationCache));
    $missingUserIds = array_diff($userIds, array_keys($userCache));


    fetchLocationsByIds($missingLocationIds, $locationCache);
    fetchUsersByIds($missingUserIds, $userCache);

    saveLocationCache($locationCache);
    saveUserCache($userCache);

    foreach ($output as &$item) {
        if (!empty($item['location']) && isset($locationCache[$item['location']])) {
            $item['location'] = $locationCache[$item['location']];
        }

        if (!empty($item['listing_agent']) && isset($userCache[$item['listing_agent']])) {
            $item['listing_agent'] = $userCache[$item['listing_agent']];
        }

        if (!empty($item['listing_owner']) && isset($userCache[$item['listing_owner']])) {
            $item['listing_owner'] = $userCache[$item['listing_owner']];
        }
    }
    unset($item);

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

    $res = bitrixRequest('crm.item.add', [
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
