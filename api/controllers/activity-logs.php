<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/bitrix.php';
require_once __DIR__ . '/../helpers/transform.php';
require_once __DIR__ . '/../helpers/activity-logger.php';

$map   = require __DIR__ . '/../mappings/activity-logs.php';
$enums = require __DIR__ . '/../enums/activity-logs.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Restrict activity logs to administrators only
    $callerId = getCallerUserId();
    $adminIds = defined('ADMIN_IDS') ? ADMIN_IDS : ($GLOBALS['ADMIN_IDS'] ?? []);
    if ($callerId > 0 && !in_array($callerId, $adminIds, true)) {
        jsonResponse(['error' => 'Forbidden: Activity logs are restricted to administrators'], 403);
    }

    $listingId = isset($_GET['listing_id']) ? (int)$_GET['listing_id'] : 0;
    $action = trim((string)($_GET['action'] ?? ''));
    $actorId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

    $filter = [];

    if ($listingId > 0) {
        $filter['=ufCrm20ListingId'] = $listingId;
    }

    if ($action !== '' && isset($enums['action'][$action])) {
        $filter['=ufCrm20Action'] = $enums['action'][$action];
    }

    if ($actorId > 0) {
        $filter['=ufCrm20UserId'] = $actorId;
    }

    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 50;
    $start = ($page - 1) * $limit;

    $res = bitrixRequest('crm.item.list', [
        'entityTypeId' => ACTIVITY_LOGS_ENTITY_ID,
        'filter'       => $filter,
        'order'        => ['ID' => 'DESC'],
        'start'        => $start,
    ]);

    $rawItems = $res['result']['items'] ?? [];
    $total = $res['total'] ?? count($rawItems);

    $items = [];
    foreach ($rawItems as $raw) {
        $mapped = fromBitrixFields($raw, $map, $enums);

        // Parse changes JSON if present
        if (!empty($mapped['changes']) && is_string($mapped['changes'])) {
            $decoded = json_decode($mapped['changes'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $mapped['changes'] = $decoded;
            }
        }

        $items[] = $mapped;
    }

    jsonResponse([
        'items' => $items,
        'total' => $total,
        'page'  => $page,
        'limit' => $limit,
    ]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
