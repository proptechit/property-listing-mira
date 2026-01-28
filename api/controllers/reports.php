<?php

require 'helpers/response.php';
require 'helpers/bitrix.php';

$map = require 'mappings/listings.php';
$enums = require 'enums/listings.php';

$start = 0;

/* Counters */
$totalListings              = 0;
$startListings              = 0;
$pendingApprovalListings    = 0;
$draftListings              = 0;
$publishedListings          = 0;
$residentialListings        = 0;
$commercialListings         = 0;
$saleListings               = 0;
$rentListings               = 0;


$rentalTypes = [
    $enums['price_type']['yearly'],
    $enums['price_type']['monthly'],
    $enums['price_type']['weekly'],
    $enums['price_type']['daily'],
];

do {
    $res = bitrixRequest('crm.item.list', [
        'entityTypeId' => LISTINGS_ENTITY_ID,
        'select'       => [$map['status'], $map['category'], $map['price_type'], 'id'],
        'start'        => $start,
    ]);

    if (
        !isset($res['result']['items']) ||
        !is_array($res['result']['items']) ||
        empty($res['result']['items'])
    ) {
        break;
    }

    foreach ($res['result']['items'] as $item) {
        $totalListings++;

        $status = $item[$map['status']] ?? null;
        $type   = $item[$map['category']] ?? null;

        if ($status == $enums['status']['Start']) {
            $startListings++;
        }

        if ($status == $enums['status']['Pending Approval']) {
            $pendingApprovalListings++;
        }

        if ($status == $enums['status']['Draft at Property Finder']) {
            $draftListings++;
        }

        if ($status == $enums['status']['Published']) {
            $publishedListings++;
        }

        if ($type == $enums['category']['residential']) {
            $residentialListings++;
        }

        if ($type == $enums['category']['commercial']) {
            $commercialListings++;
        }

        if ($item[$map['price_type']] == $enums['price_type']['sale']) {
            $saleListings++;
        }

        if (in_array((string) ($item[$map['price_type']] ?? ''), $rentalTypes, true)) {
            $rentListings++;
        }
    }

    $start = $res['next'] ?? null;
} while ($start !== null);

jsonResponse([
    'data' => [
        'total_listings'        => $totalListings,
        'start_listings'        => $startListings,
        'pending_approval_listings' => $pendingApprovalListings,
        'draft_listings'        => $draftListings,
        'published_listings'    => $publishedListings,
        'residential_listings'  => $residentialListings,
        'commercial_listings'   => $commercialListings,
        'sale_listings'         => $saleListings,
        'rent_listings'         => $rentListings,
    ],
]);
