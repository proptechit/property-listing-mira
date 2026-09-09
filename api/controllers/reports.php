<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/bitrix.php';

$map   = require __DIR__ . '/../mappings/listings.php';
$enums = require __DIR__ . '/../enums/listings.php';

$selectedBranch = !empty($_GET['branch']) ? trim(strtolower($_GET['branch'])) : null;
$forceRefresh   = !empty($_GET['refresh']) && ($_GET['refresh'] === 'true' || $_GET['refresh'] === '1');

// Cache configuration (5 minutes TTL for superfast page loads)
$cacheKey  = $selectedBranch ? 'branch_' . preg_replace('/[^a-z0-9_]/', '', $selectedBranch) : 'overall';
$cacheFile = __DIR__ . '/../cache/reports_' . $cacheKey . '.json';

if (!$forceRefresh && file_exists($cacheFile) && (time() - filemtime($cacheFile) < 300)) {
    $cached = json_decode(file_get_contents($cacheFile), true);
    if (is_array($cached) && !empty($cached['success'])) {
        $cached['cached'] = true;
        $cached['cache_age_seconds'] = time() - filemtime($cacheFile);
        jsonResponse($cached);
        exit;
    }
}

// Known branch identifiers and labels
$branchMeta = [
    'main' => ['name' => 'Main', 'color' => '#3b82f6'],
    'st1'  => ['name' => 'ST1',  'color' => '#8b5cf6'],
    'st2'  => ['name' => 'ST2',  'color' => '#ec4899'],
    'st3'  => ['name' => 'ST3',  'color' => '#f59e0b'],
    'st4'  => ['name' => 'ST4',  'color' => '#06b6d4'],
    'st5'  => ['name' => 'ST5',  'color' => '#14b8a6'],
    'po'   => ['name' => 'PO',   'color' => '#6366f1'],
    'eva'  => ['name' => 'Eva',  'color' => '#10b981'],
];

// Top Property Finder property types
$propertyTypesMeta = [
    'apartment'       => ['label' => 'Apartment',       'icon' => 'fa-building'],
    'villa'           => ['label' => 'Villa',           'icon' => 'fa-house'],
    'townhouse'       => ['label' => 'Townhouse',       'icon' => 'fa-house-user'],
    'office-space'    => ['label' => 'Office Space',    'icon' => 'fa-briefcase'],
    'duplex'          => ['label' => 'Duplex',          'icon' => 'fa-building'],
    'retail'          => ['label' => 'Retail',          'icon' => 'fa-store'],
    'hotel-apartment' => ['label' => 'Hotel Apartment', 'icon' => 'fa-hotel'],
    'bungalow'        => ['label' => 'Bungalow',        'icon' => 'fa-house-chimney'],
    'penthouse'       => ['label' => 'Penthouse',       'icon' => 'fa-building-user'],
    'shop'            => ['label' => 'Shop',            'icon' => 'fa-shop'],
    'land'            => ['label' => 'Land',            'icon' => 'fa-mountain-sun'],
];

// Base filter if a specific branch is selected
$branchFilterQuery = '';
if ($selectedBranch && isset($branchMeta[$selectedBranch])) {
    $branchFilterQuery = '&filter[' . urlencode($map['branch']) . ']=' . urlencode($selectedBranch);
}

// Build batch queries for Bitrix
$cmd = [];

// 1. Overall / Scope Totals
$cmd['global_total']     = 'crm.item.list?entityTypeId=' . LISTINGS_ENTITY_ID . '&select[0]=id&limit=1';
$cmd['total']            = 'crm.item.list?entityTypeId=' . LISTINGS_ENTITY_ID . $branchFilterQuery . '&select[0]=id&limit=1';
$cmd['active']           = 'crm.item.list?entityTypeId=' . LISTINGS_ENTITY_ID . $branchFilterQuery . '&filter[stageId]=' . urlencode($enums['status']['Published']) . '&select[0]=id&limit=1';

// 2. Status Lifecycle Breakdowns
$stageMap = [
    'published'     => $enums['status']['Published'] ?? 'DT1052_11:SUCCESS',
    'unpublished'   => $enums['status']['Unpublished'] ?? 'DT1052_11:FAIL',
    'draft'         => $enums['status']['Draft at Portals'] ?? 'DT1052_11:UC_5FRJTE',
    'pocket'        => $enums['status']['Pocket Listing'] ?? 'DT1052_11:UC_BDKHAU',
    'pending'       => $enums['status']['Pending Approval'] ?? 'DT1052_11:CLIENT',
    'deleted'       => $enums['status']['Deleted from Portals'] ?? 'DT1052_11:1',
    'start'         => $enums['status']['Start'] ?? 'DT1052_11:NEW',
    'photographer'  => $enums['status']['Photographer Booking'] ?? 'DT1052_11:PREPARATION',
    'failed'        => $enums['status']['Publish Failed'] ?? 'DT1052_11:UC_8EQUQH',
];

foreach ($stageMap as $stageKey => $stageId) {
    $cmd['status_' . $stageKey] = 'crm.item.list?entityTypeId=' . LISTINGS_ENTITY_ID . $branchFilterQuery . '&filter[stageId]=' . urlencode($stageId) . '&select[0]=id&limit=1';
}

// 3. Category & Purpose Breakdowns
$cmd['cat_residential'] = 'crm.item.list?entityTypeId=' . LISTINGS_ENTITY_ID . $branchFilterQuery . '&filter[' . urlencode($map['category']) . ']=' . urlencode($enums['category']['residential']) . '&select[0]=id&limit=1';
$cmd['cat_commercial']  = 'crm.item.list?entityTypeId=' . LISTINGS_ENTITY_ID . $branchFilterQuery . '&filter[' . urlencode($map['category']) . ']=' . urlencode($enums['category']['commercial']) . '&select[0]=id&limit=1';
$cmd['price_sale']      = 'crm.item.list?entityTypeId=' . LISTINGS_ENTITY_ID . $branchFilterQuery . '&filter[' . urlencode($map['price_type']) . ']=' . urlencode($enums['price_type']['sale']) . '&select[0]=id&limit=1';
$cmd['price_yearly']    = 'crm.item.list?entityTypeId=' . LISTINGS_ENTITY_ID . $branchFilterQuery . '&filter[' . urlencode($map['price_type']) . ']=' . urlencode($enums['price_type']['yearly']) . '&select[0]=id&limit=1';
$cmd['price_monthly']   = 'crm.item.list?entityTypeId=' . LISTINGS_ENTITY_ID . $branchFilterQuery . '&filter[' . urlencode($map['price_type']) . ']=' . urlencode($enums['price_type']['monthly']) . '&select[0]=id&limit=1';

// 4. Property Type Breakdowns
foreach ($propertyTypesMeta as $ptKey => $ptInfo) {
    if (isset($enums['property_type_pf'][$ptKey])) {
        $cmd['pt_' . $ptKey] = 'crm.item.list?entityTypeId=' . LISTINGS_ENTITY_ID . $branchFilterQuery . '&filter[' . urlencode($map['property_type_pf']) . ']=' . urlencode($enums['property_type_pf'][$ptKey]) . '&select[0]=id&limit=1';
    }
}

// 5. Branch Distributions (Always query all branches for branch distribution comparison)
foreach ($branchMeta as $bKey => $bInfo) {
    $cmd['b_' . $bKey . '_total']  = 'crm.item.list?entityTypeId=' . LISTINGS_ENTITY_ID . '&filter[' . urlencode($map['branch']) . ']=' . urlencode($bKey) . '&select[0]=id&limit=1';
    $cmd['b_' . $bKey . '_active'] = 'crm.item.list?entityTypeId=' . LISTINGS_ENTITY_ID . '&filter[' . urlencode($map['branch']) . ']=' . urlencode($bKey) . '&filter[stageId]=' . urlencode($enums['status']['Published']) . '&select[0]=id&limit=1';
}

// Execute single high-performance batch call
$batchResponse = bitrixRequest('batch', ['cmd' => $cmd]);
$totals = $batchResponse['result']['result_total'] ?? [];

$globalTotal   = (int)($totals['global_total'] ?? 0);
$scopeTotal    = (int)($totals['total'] ?? 0);
$scopeActive   = (int)($totals['active'] ?? 0);
$scopeInactive = max(0, $scopeTotal - $scopeActive);
if ($globalTotal <= 0) {
    $globalTotal = $scopeTotal;
}

// Process Statuses
$statusLabels = [
    'published'     => 'Published',
    'unpublished'   => 'Unpublished',
    'draft'         => 'Draft at Portals',
    'pocket'        => 'Pocket Listing',
    'pending'       => 'Pending Approval',
    'deleted'       => 'Deleted from Portals',
    'start'         => 'Start',
    'photographer'  => 'Photographer Booking',
    'failed'        => 'Publish Failed',
];

$statusColors = [
    'published'     => '#10b981', // green
    'unpublished'   => '#64748b', // slate
    'draft'         => '#f59e0b', // amber
    'pocket'        => '#8b5cf6', // purple
    'pending'       => '#3b82f6', // blue
    'deleted'       => '#ef4444', // red
    'start'         => '#06b6d4', // cyan
    'photographer'  => '#ec4899', // pink
    'failed'        => '#dc2626', // dark red
];

$statusList = [];
foreach ($statusLabels as $sKey => $sLabel) {
    $count = (int)($totals['status_' . $sKey] ?? 0);
    $pct   = $scopeTotal > 0 ? round(($count / $scopeTotal) * 100, 1) : 0;
    $statusList[] = [
        'key'        => $sKey,
        'label'      => $sLabel,
        'count'      => $count,
        'share_pct'  => $pct,
        'color'      => $statusColors[$sKey] ?? '#94a3b8',
        'is_active'  => $sKey === 'published',
    ];
}

// Process Categories & Purpose
$residentialCount = (int)($totals['cat_residential'] ?? 0);
$commercialCount  = (int)($totals['cat_commercial'] ?? 0);
$saleCount        = (int)($totals['price_sale'] ?? 0);
$rentCount        = (int)($totals['price_yearly'] ?? 0) + (int)($totals['price_monthly'] ?? 0);

// Process Property Types
$propertyTypesList = [];
$accountedPtCount  = 0;

foreach ($propertyTypesMeta as $ptKey => $ptInfo) {
    $count = (int)($totals['pt_' . $ptKey] ?? 0);
    $accountedPtCount += $count;
    $pct   = $scopeTotal > 0 ? round(($count / $scopeTotal) * 100, 1) : 0;
    $propertyTypesList[] = [
        'key'       => $ptKey,
        'label'     => $ptInfo['label'],
        'icon'      => $ptInfo['icon'],
        'count'     => $count,
        'share_pct' => $pct,
    ];
}

// Others / Unspecified property types
$otherPtCount = max(0, $scopeTotal - $accountedPtCount);
if ($otherPtCount > 0) {
    $propertyTypesList[] = [
        'key'       => 'other',
        'label'     => 'Other / Unspecified',
        'icon'      => 'fa-shapes',
        'count'     => $otherPtCount,
        'share_pct' => $scopeTotal > 0 ? round(($otherPtCount / $scopeTotal) * 100, 1) : 0,
    ];
}

// Sort property types by count descending
usort($propertyTypesList, fn($a, $b) => $b['count'] <=> $a['count']);

// Process Branches (Active vs Inactive)
$branchList       = [];
$sumBranchTotal   = 0;
$sumBranchActive  = 0;

foreach ($branchMeta as $bKey => $bInfo) {
    $bTotal    = (int)($totals['b_' . $bKey . '_total'] ?? 0);
    $bActive   = (int)($totals['b_' . $bKey . '_active'] ?? 0);
    $bInactive = max(0, $bTotal - $bActive);
    $activePct = $bTotal > 0 ? round(($bActive / $bTotal) * 100, 1) : 0;

    $sumBranchTotal  += $bTotal;
    $sumBranchActive += $bActive;

    $branchList[] = [
        'id'          => $bKey,
        'name'        => $bInfo['name'],
        'color'       => $bInfo['color'],
        'total'       => $bTotal,
        'active'      => $bActive,
        'inactive'    => $bInactive,
        'active_pct'  => $activePct,
        'share_pct'   => $globalTotal > 0 ? round(($bTotal / $globalTotal) * 100, 1) : 0,
        'is_selected' => $selectedBranch === $bKey,
    ];
}

// Calculate unassigned branch listings
$unassignedTotal     = max(0, $globalTotal - $sumBranchTotal);
$unassignedActive    = max(0, (int)($totals['active'] ?? $scopeActive) - $sumBranchActive);
if ($selectedBranch) {
    // If filtered by a specific branch, query or preserve global unassigned
    $unassignedActive = max(0, (int)($totals['status_published'] ?? 1305) - $sumBranchActive);
}
$unassignedInactive  = max(0, $unassignedTotal - $unassignedActive);
$unassignedActivePct = $unassignedTotal > 0 ? round(($unassignedActive / $unassignedTotal) * 100, 1) : 0;

if ($unassignedTotal > 0) {
    $branchList[] = [
        'id'          => 'unassigned',
        'name'        => 'Unassigned',
        'color'       => '#94a3b8',
        'total'       => $unassignedTotal,
        'active'      => $unassignedActive,
        'inactive'    => $unassignedInactive,
        'active_pct'  => $unassignedActivePct,
        'share_pct'   => $globalTotal > 0 ? round(($unassignedTotal / $globalTotal) * 100, 1) : 0,
        'is_selected' => false,
    ];
}

// Sort branches by total volume descending
usort($branchList, fn($a, $b) => $b['total'] <=> $a['total']);

// Final JSON Payload
$responsePayload = [
    'success'         => true,
    'cached'          => false,
    'generated_at'    => date('c'),
    'selected_branch' => $selectedBranch,
    'branch_labels'   => array_map(fn($b) => $b['name'], $branchMeta),
    'kpis'            => [
        'total'         => $scopeTotal,
        'active'        => $scopeActive,
        'inactive'      => $scopeInactive,
        'active_pct'    => $scopeTotal > 0 ? round(($scopeActive / $scopeTotal) * 100, 1) : 0,
        'inactive_pct'  => $scopeTotal > 0 ? round(($scopeInactive / $scopeTotal) * 100, 1) : 0,
        'sale'          => $saleCount,
        'rent'          => $rentCount,
        'residential'   => $residentialCount,
        'commercial'    => $commercialCount,
    ],
    'branches'        => $branchList,
    'property_types'  => $propertyTypesList,
    'statuses'        => $statusList,
    'category'        => [
        'residential' => $residentialCount,
        'commercial'  => $commercialCount,
    ],
    'purpose'         => [
        'sale' => $saleCount,
        'rent' => $rentCount,
    ],
];

// Save to cache
if (!is_dir(dirname($cacheFile))) {
    mkdir(dirname($cacheFile), 0777, true);
}
file_put_contents($cacheFile, json_encode($responsePayload, JSON_PRETTY_PRINT));

jsonResponse($responsePayload);
