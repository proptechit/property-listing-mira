<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/bitrix.php';
require_once __DIR__ . '/../helpers/transform.php';

$permitNumber = trim((string)($_GET['permit_number'] ?? ($_GET['advertisement_number'] ?? '')));

if ($permitNumber === '') {
    jsonResponse([
        'error' => 'Permit number is required'
    ], 400);
}

$excludeId = isset($_GET['listing_id']) ? (int)$_GET['listing_id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
$currentPurpose = normalizePurposeValue($_GET['purpose'] ?? ($_GET['purpose_type'] ?? ($_GET['ufCrm5_1752755567'] ?? '')));

// If purpose is not provided but we have a listing ID, resolve its purpose from CRM
if ($currentPurpose === '' && $excludeId > 0) {
    $currentRes = bitrixRequest('crm.item.get', [
        'entityTypeId' => LISTINGS_ENTITY_ID,
        'id'           => $excludeId,
    ]);
    if (!empty($currentRes['result']['item']['ufCrm5_1752755567'])) {
        $currentPurpose = normalizePurposeValue($currentRes['result']['item']['ufCrm5_1752755567']);
    }
}

$res = bitrixRequest('crm.item.list', [
    'entityTypeId' => LISTINGS_ENTITY_ID,
    'filter'       => [
        'ufCrm5_1752508269' => $permitNumber,
        'stageId'           => 'DT1052_11:SUCCESS',
    ],
    'select'       => ['id', 'stageId', 'ufCrm5_1752755567'],
]);

$items = $res['result']['items'] ?? [];
$conflicts = array_values(array_filter($items, function ($item) use ($excludeId, $currentPurpose) {
    if ((int)($item['id'] ?? 0) === $excludeId) {
        return false;
    }

    // If the existing listing has a different purpose type (ufCrm5_1752755567), it is not a conflict
    $itemPurpose = normalizePurposeValue($item['ufCrm5_1752755567'] ?? '');
    if ($currentPurpose !== '' && $itemPurpose !== '' && $currentPurpose !== $itemPurpose) {
        return false;
    }

    return true;
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
