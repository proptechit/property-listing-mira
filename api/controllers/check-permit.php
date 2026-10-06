<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/bitrix.php';

$permitNumber = trim((string)($_GET['permit_number'] ?? ($_GET['advertisement_number'] ?? '')));

if ($permitNumber === '') {
    jsonResponse([
        'error' => 'Permit number is required'
    ], 400);
}

$excludeId = isset($_GET['listing_id']) ? (int)$_GET['listing_id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);

$res = bitrixRequest('crm.item.list', [
    'entityTypeId' => LISTINGS_ENTITY_ID,
    'filter'       => [
        'ufCrm5_1752508269' => $permitNumber,
    ],
    'select'       => ['id'],
]);

$items = $res['result']['items'] ?? [];
$conflicts = array_values(array_filter($items, function ($item) use ($excludeId) {
    return (int)($item['id'] ?? 0) !== $excludeId;
}));

if (!empty($conflicts)) {
    jsonResponse([
        'exists'       => true,
        'message'      => 'There is an existing listing with same permit number, please contact crm team',
        'conflict_ids' => array_column($conflicts, 'id'),
    ], 200);
}

jsonResponse([
    'exists'  => false,
    'message' => 'Permit number is available',
], 200);
