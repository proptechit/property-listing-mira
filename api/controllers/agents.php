<?php
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/request.php';
require_once __DIR__ . '/../helpers/bitrix.php';
require_once __DIR__ . '/../helpers/transform.php';

// Include Bitrix prolog if available on server
if (isset($_SERVER["DOCUMENT_ROOT"]) && file_exists($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php")) {
    require_once($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");
}

$map = require __DIR__ . '/../mappings/users.php';
$action = $_GET['action'] ?? null;

/**
 * SYNC PORTAL USER ACCOUNTS WITH BITRIX BY EMAIL
 */
if ($method === 'POST' && $action === 'sync-portal-users') {
    if (class_exists('\Bitrix\Main\Loader') && \Bitrix\Main\Loader::includeModule('webmatrik.integrations')) {
        try {
            $branches = [
                'main',
                'st1',
                'st2',
                'st3',
                'st4',
                'st5',
                'po',
                'eva',
            ];

            $syncedBranches = [];
            foreach ($branches as $branch) {
                $pfCount = 0;
                $bayutCount = 0;
                $branchError = null;

                try {
                    $Pf = new \Webmatrik\Integrations\FeedPf(true, $branch);
                    $PfUsers = $Pf->getPfUsers();
                    if (is_countable($PfUsers)) {
                        $pfCount = count($PfUsers);
                    } elseif (is_int($PfUsers)) {
                        $pfCount = $PfUsers;
                    }
                } catch (\Throwable $pe) {
                    $branchError = ($branchError ? $branchError . '; ' : '') . 'PF: ' . $pe->getMessage();
                }

                try {
                    $Bayut = new \Webmatrik\Integrations\FeedBayut($branch);
                    $BayutUsers = $Bayut->getBayutUsers();
                    if (is_countable($BayutUsers)) {
                        $bayutCount = count($BayutUsers);
                    } elseif (is_int($BayutUsers)) {
                        $bayutCount = $BayutUsers;
                    }
                } catch (\Throwable $be) {
                    $branchError = ($branchError ? $branchError . '; ' : '') . 'Bayut: ' . $be->getMessage();
                }

                $branchResult = [
                    'pf_users_count' => $pfCount,
                    'bayut_users_count' => $bayutCount,
                ];

                if ($branchError) {
                    $branchResult['error'] = $branchError;
                }

                $syncedBranches[$branch] = $branchResult;
            }

            jsonResponse([
                'success' => true,
                'message' => 'Portal user accounts synced with Bitrix by email successfully.',
                'branches' => $syncedBranches,
            ]);
        } catch (\Throwable $e) {
            jsonResponse([
                'success' => false,
                'error' => 'Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(),
            ], 500);
        }
    } else {
        jsonResponse([
            'success' => false,
            'error' => "Module 'webmatrik.integrations' not found or failed to load.",
        ], 400);
    }
    exit;
}

/**
 * SAVE / UPDATE AGENT PROFILE (PF ID, Bayut ID, Superagent)
 */
if ($method === 'POST' || $method === 'PUT') {
    $input = getRequestBody();
    $userId = isset($input['user_id']) ? (int)$input['user_id'] : (int)($id ?? 0);

    if ($userId <= 0) {
        jsonResponse([
            'error' => 'Valid user_id is required'
        ], 400);
    }

    $pfId = trim((string)($input['pf_id'] ?? ''));
    $bayutId = trim((string)($input['bayut_id'] ?? ''));

    // Normalize super_agent: 1 or 0
    $isSuperAgent = false;
    if (isset($input['super_agent'])) {
        $val = $input['super_agent'];
        $isSuperAgent = ($val === true || $val === 'true' || $val === 1 || $val === '1' || $val === 'Y');
    }
    $superAgent = $isSuperAgent ? '1' : '0';

    $updateFields = [
        'UF_PFID' => $pfId,
        'UF_BAYUTID' => $bayutId,
        'UF_PFSUPERAGENT' => $superAgent,
    ];

    // If running in native Bitrix server environment, update via CUser
    $bitrixUpdated = false;
    if (class_exists('\CUser')) {
        $cuser = new \CUser();
        $bitrixUpdated = (bool)$cuser->Update($userId, $updateFields);
    }

    // Always also call REST webhook to ensure update persists in both local and remote setups
    $res = bitrixRequest('user.update', array_merge(['ID' => $userId], $updateFields));

    if (!empty($res['error']) && !$bitrixUpdated) {
        jsonResponse([
            'error' => 'Failed to update user profile in Bitrix: ' . ($res['error_description'] ?? $res['error'])
        ], 500);
    }

    jsonResponse([
        'success' => true,
        'message' => 'Agent profile updated successfully.',
        'data' => [
            'id' => $userId,
            'pf_id' => $pfId,
            'bayut_id' => $bayutId,
            'super_agent' => $isSuperAgent,
        ]
    ]);
}

/**
 * FETCH ALL BITRIX USERS (FOR SELECTION IN MODAL)
 */
if ($method === 'GET' && (isset($_GET['all_users']) && $_GET['all_users'] === 'true' || $action === 'bitrix-users')) {
    $res = bitrixRequest(
        null,
        ['start' => 0],
        $CUSTOM_USERS_API
    );

    $allUsers = $res['result'] ?? [];
    $filteredUsers = [];

    foreach ($allUsers as $u) {
        $email = strtolower(trim($u['EMAIL'] ?? ''));
        $pos = trim($u['WORK_POSITION'] ?? '');
        $name = trim(html_entity_decode($u['NAME'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        $lastName = trim(html_entity_decode($u['LAST_NAME'] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        $branch = trim($u['BRANCH'] ?? '');
        $agentCode = trim($u['UF_USR_1770017892768'] ?? '');
        $pfId = trim($u['UF_PFID'] ?? '');
        $bayutId = trim($u['UF_BAYUTID'] ?? '');

        // Exclude bots, anonymous user, and whatsapp/example leads
        if ($u['ID'] == 2 || $pos === 'Chat bot' || $pos === 'TEMPLATE' || $pos === 'Voice') {
            continue;
        }
        if (str_contains($email, 'whatsapp.wazzup') || str_contains($email, '@example.com')) {
            continue;
        }

        $hasEmail = !empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL);
        $hasAffiliation = !empty($branch) || !empty($agentCode) || !empty($pfId) || !empty($bayutId) || (!empty($pos) && $pos !== 'PC');

        if (!$hasEmail && !$hasAffiliation) {
            // Exclude phone-number-only names or symbol-only names
            if (preg_match('/^[+0-9\s()-]+$/', $name) || preg_match('/^["\'.{}?]+/', $name) || empty($name)) {
                continue;
            }
        }

        $transformed = fromBitrixFields($u, $map);
        $transformed['name'] = $name;
        $transformed['last_name'] = $lastName;
        $filteredUsers[] = $transformed;
    }

    usort($filteredUsers, function ($a, $b) {
        $nameA = preg_replace('/^[^a-zA-Z0-9]+/', '', trim(($a['name'] ?? '') . ' ' . ($a['last_name'] ?? '')));
        $nameB = preg_replace('/^[^a-zA-Z0-9]+/', '', trim(($b['name'] ?? '') . ' ' . ($b['last_name'] ?? '')));
        return strcasecmp($nameA, $nameB);
    });

    jsonResponse([
        'data' => $filteredUsers,
        'total' => count($filteredUsers),
    ]);
}

/**
 * FETCH AGENTS (GET - PAGINATED OR ALL)
 */
$page  = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = 50;
$start = ($page - 1) * $limit;

$all = isset($_GET['all']) && $_GET['all'] === 'true';

$paramsBase = [
    'select' => array_values($map),
];

if (!empty($_GET['id'])) {
    $paramsBase['ID'] = $_GET['id'];
}

/**
 * FETCH ALL AGENTS
 */
if ($all) {
    $allUsers = [];
    $currentStart = 0;

    do {
        $params = $paramsBase;
        $params['start'] = $currentStart;

        $res = bitrixRequest(
            null,
            $params,
            $CUSTOM_USERS_API . "?is_agent=1"
        );

        $batch = $res['result'] ?? [];
        $allUsers = array_merge($allUsers, $batch);

        if (!isset($res['next'])) {
            break;
        }

        $currentStart = $res['next'];
    } while (true);

    $users = array_map(
        fn($u) => fromBitrixFields($u, $map),
        $allUsers
    );

    usort($users, function ($a, $b) {
        $nameA = trim(($a['name'] ?? '') . ' ' . ($a['last_name'] ?? ''));
        $nameB = trim(($b['name'] ?? '') . ' ' . ($b['last_name'] ?? ''));
        return strcasecmp($nameA, $nameB);
    });

    jsonResponse([
        'data' => $users,
        'pagination' => [
            'all' => true,
            'total' => count($users),
        ],
    ]);
}

/**
 * PAGINATED MODE
 */
$params = $paramsBase;
$params['start'] = $start;

$res = bitrixRequest(
    null,
    $params,
    $CUSTOM_USERS_API . "?is_agent=1"
);

$users = $res['result'] ?? [];
$total = $res['total'] ?? count($users);

$users = array_map(
    fn($u) => fromBitrixFields($u, $map),
    $users
);

usort($users, function ($a, $b) {
    $nameA = trim(($a['name'] ?? '') . ' ' . ($a['last_name'] ?? ''));
    $nameB = trim(($b['name'] ?? '') . ' ' . ($b['last_name'] ?? ''));
    return strcasecmp($nameA, $nameB);
});

jsonResponse([
    'data' => $users,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
        'total_pages' => ceil($total / $limit),
    ],
]);
