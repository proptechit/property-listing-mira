<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/request.php';
require_once __DIR__ . '/../helpers/bitrix.php';
require_once __DIR__ . '/../helpers/transform.php';

// Include Bitrix prolog if available on server
if (isset($_SERVER["DOCUMENT_ROOT"]) && file_exists($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php")) {
    require_once($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");
}

$map = require __DIR__ . '/../mappings/locations.php';
$action = $_GET['action'] ?? null;

/**
 * FETCH LAST SYNC TIME (most recent updatedTime in locations SPA 1056)
 */
if ($method === 'GET' && $action === 'last-sync') {
    $res = bitrixRequest('crm.item.list', [
        'entityTypeId' => LOCATIONS_ENTITY_ID,
        'order'        => ['updatedTime' => 'DESC'],
        'limit'        => 1,
        'select'       => ['id', 'title', 'updatedTime', 'createdTime'],
    ]);

    $item = $res['result']['items'][0] ?? null;
    $updatedTime = $item['updatedTime'] ?? $item['createdTime'] ?? null;

    jsonResponse([
        'success'        => true,
        'last_sync_time' => $updatedTime,
        'last_item'      => $item ? [
            'id'          => $item['id'],
            'title'       => $item['title'] ?? '',
            'updatedTime' => $updatedTime,
        ] : null,
    ]);
    exit;
}

/**
 * SYNC LOCATIONS (PF & Bayut for main branch)
 */
if ($method === 'POST' && $action === 'sync') {
    $input = getRequestBody();
    $city = trim((string)($input['city'] ?? ''));

    if (empty($city)) {
        jsonResponse([
            'error' => 'City is required for location sync'
        ], 400);
    }

    $community = trim((string)($input['community'] ?? ''));
    $subcommunity = trim((string)($input['subcommunity'] ?? ''));
    $building = trim((string)($input['building'] ?? ''));

    if (class_exists('\Bitrix\Main\Loader') && \Bitrix\Main\Loader::includeModule('webmatrik.integrations')) {
        try {
            $pfResult = null;
            $bayutResult = null;
            $errors = [];

            // Sync Property Finder locations
            if (class_exists('\Webmatrik\Integrations\FeedPf')) {
                try {
                    $Pf = new \Webmatrik\Integrations\FeedPf(true, 'main');
                    $pfResult = $Pf->syncLocations($city);
                } catch (\Throwable $pe) {
                    $errors[] = 'PF: ' . $pe->getMessage();
                }
            } else {
                $errors[] = "FeedPf class not found";
            }

            // Sync Bayut locations
            if (class_exists('\Webmatrik\Integrations\FeedBayut')) {
                try {
                    $Bayut = new \Webmatrik\Integrations\FeedBayut('main');
                    $bayutResult = $Bayut->syncLocations(
                        $city,
                        $community !== '' ? $community : null,
                        $subcommunity !== '' ? $subcommunity : null,
                        $building !== '' ? $building : null
                    );
                } catch (\Throwable $be) {
                    $errors[] = 'Bayut: ' . $be->getMessage();
                }
            } else {
                $errors[] = "FeedBayut class not found";
            }

            // Fetch the updated latest sync timestamp from entity 1056
            $lastSyncRes = bitrixRequest('crm.item.list', [
                'entityTypeId' => LOCATIONS_ENTITY_ID,
                'order'        => ['updatedTime' => 'DESC'],
                'limit'        => 1,
                'select'       => ['id', 'title', 'updatedTime', 'createdTime'],
            ]);
            $latestItem = $lastSyncRes['result']['items'][0] ?? null;
            $lastSyncTime = $latestItem['updatedTime'] ?? $latestItem['createdTime'] ?? date('c');

            jsonResponse([
                'success'        => true,
                'message'        => "Locations synced successfully for {$city}." . (!empty($errors) ? ' (' . implode('; ', $errors) . ')' : ''),
                'city'           => $city,
                'community'      => $community ?: null,
                'subcommunity'   => $subcommunity ?: null,
                'building'       => $building ?: null,
                'last_sync_time' => $lastSyncTime,
                'pf_result'      => $pfResult,
                'bayut_result'   => $bayutResult,
                'warnings'       => $errors,
            ]);
        } catch (\Throwable $e) {
            jsonResponse([
                'success' => false,
                'error'   => 'Sync Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(),
            ], 500);
        }
    } else {
        jsonResponse([
            'success' => false,
            'error'   => "Module 'webmatrik.integrations' not found or failed to load.",
        ], 400);
    }
    exit;
}

if ($method === 'GET') {
    // single item
    if ($id) {
        $res = bitrixRequest('crm.item.get', [
            'entityTypeId' => LOCATIONS_ENTITY_ID,
            'id'           => $id,
            'select'       => array_values($map)
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
            'page'        => $page,
            'limit'       => $limit,
            'total'       => $total,
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
