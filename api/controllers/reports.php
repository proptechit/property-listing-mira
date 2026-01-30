<?php

require 'helpers/response.php';
require 'helpers/bitrix.php';

$map   = require 'mappings/listings.php';
$enums = require 'enums/listings.php';

/**
 * Get count of listings using Bitrix filter
 */
function getCount(array $filter = []): int
{
    $res = bitrixRequest('crm.item.list', [
        'entityTypeId' => LISTINGS_ENTITY_ID,
        'filter'       => $filter,
        'select'       => ['id'],
        'start'        => 0,
    ]);

    return (int) ($res['total'] ?? 0);
}

/* Rental price typespes */
$rentalTypes = [
    (string) $enums['price_type']['yearly'],
    (string) $enums['price_type']['monthly'],
    (string) $enums['price_type']['weekly'],
    (string) $enums['price_type']['daily'],
];

/* Counts */
$totalListings = getCount();

$startListings = getCount([
    $map['status'] => $enums['status']['Start'],
]);

$pendingApprovalListings = getCount([
    $map['status'] => $enums['status']['Pending Approval'],
]);

$draftListings = getCount([
    $map['status'] => $enums['status']['Draft at Property Finder'],
]);

$publishedListings = getCount([
    $map['status'] => $enums['status']['Published'],
]);

$residentialListings = getCount([
    $map['category'] => $enums['category']['residential'],
]);

$commercialListings = getCount([
    $map['category'] => $enums['category']['commercial'],
]);

$saleListings = getCount([
    $map['price_type'] => (string) $enums['price_type']['sale'],
]);

$rentListings = getCount([
    $map['price_type'] => $rentalTypes,
]);

jsonResponse([
    'data' => [
        'total_listings'             => $totalListings,
        'start_listings'             => $startListings,
        'pending_approval_listings'  => $pendingApprovalListings,
        'draft_listings'             => $draftListings,
        'published_listings'         => $publishedListings,
        'residential_listings'       => $residentialListings,
        'commercial_listings'        => $commercialListings,
        'sale_listings'              => $saleListings,
        'rent_listings'              => $rentListings,
    ],
]);
