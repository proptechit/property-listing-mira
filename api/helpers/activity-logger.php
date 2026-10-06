<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers/bitrix.php';
require_once __DIR__ . '/../helpers/user-cache.php';

/**
 * Resolve the acting user ID from headers, request data, or globals.
 *
 * @param array $fallbackSources Values to inspect for a positive user ID
 * @return int User ID or 0 if unauthenticated / unknown
 */
function getCallerUserId(array $fallbackSources = []): int
{
    if (!empty($_SERVER['HTTP_X_USER_ID']) && (int)$_SERVER['HTTP_X_USER_ID'] > 0) {
        return (int)$_SERVER['HTTP_X_USER_ID'];
    }

    foreach ($fallbackSources as $val) {
        if (!empty($val) && (int)$val > 0) {
            return (int)$val;
        }
    }

    if (!empty($_GET['user_id']) && (int)$_GET['user_id'] > 0) {
        return (int)$_GET['user_id'];
    }

    if (!empty($_POST['user_id']) && (int)$_POST['user_id'] > 0) {
        return (int)$_POST['user_id'];
    }

    return 0;
}

/**
 * Log an activity event to the Bitrix Activity Logs SPA (entityTypeId: 1106).
 *
 * @param array $data [
 *   'action'         => 'created'|'updated'|'published'|'unpublished'|'deleted'|'viewed'|'duplicated'|'refreshed',
 *   'listing_id'     => int,
 *   'listing_ref'    => string (optional),
 *   'listing_title'  => string (optional),
 *   'user_id'        => int (optional),
 *   'user_name'      => string (optional),
 *   'user_role'      => string (optional),
 *   'description'    => string (optional),
 *   'changes'        => array|string (optional),
 *   'portals'        => array|string (optional),
 * ]
 * @return array|null The created Bitrix item or null on error
 */
function logActivity(array $data): ?array
{
    try {
        if (!defined('ACTIVITY_LOGS_ENTITY_ID')) {
            return null;
        }

        $listingId = (int)($data['listing_id'] ?? 0);
        $action = trim((string)($data['action'] ?? ''));

        if (!$listingId || !$action) {
            return null;
        }

        // Action enum mapping
        $enums = require __DIR__ . '/../enums/activity-logs.php';
        $actionEnumId = $enums['action'][$action] ?? null;

        // Determine user ID (caller) - check passed user_id, headers, or request globals
        $userId = isset($data['user_id']) && (int)$data['user_id'] > 0
            ? (int)$data['user_id']
            : getCallerUserId();

        // System fallback if user ID is unknown (store in both assignedById and ufCrm20UserId)
        $assignedId = $userId > 0 ? $userId : 1;

        // Resolve user name and role if not supplied
        $userName = trim((string)($data['user_name'] ?? ''));
        $userRole = trim((string)($data['user_role'] ?? ''));

        $adminIds = defined('ADMIN_IDS') ? ADMIN_IDS : ($GLOBALS['ADMIN_IDS'] ?? []);

        if ($userId > 0) {
            if ($userName === '') {
                $userCache = getUserCache();
                if (!isset($userCache[$userId])) {
                    fetchUsersByIds([$userId], $userCache);
                    saveUserCache($userCache);
                }
                $uEntry = $userCache[$userId] ?? null;
                if (is_array($uEntry) && !empty($uEntry['name'])) {
                    $userName = $uEntry['name'];
                } elseif (is_string($uEntry) && !empty($uEntry)) {
                    $userName = $uEntry;
                } else {
                    $userName = "User #{$userId}";
                }
            }

            if ($userRole === '') {
                $userRole = in_array($userId, $adminIds, true) ? 'Admin' : 'Agent';
            }
        } else {
            $userName = $userName ?: 'System';
            $userRole = $userRole ?: 'System';
        }

        // Listing metadata
        $listingRef = trim((string)($data['listing_ref'] ?? ''));
        $listingTitle = trim((string)($data['listing_title'] ?? ''));

        // Generate human-friendly title & description if not passed
        $actionUpper = strtoupper($action);
        $refDisplay = $listingRef !== '' ? " ({$listingRef})" : '';
        $itemTitle = "[{$actionUpper}] Listing #{$listingId}{$refDisplay} by {$userName}";

        $description = trim((string)($data['description'] ?? ''));
        if ($description === '') {
            $description = match ($action) {
                'created'     => "Listing #{$listingId}{$refDisplay} created by {$userName}",
                'updated'     => "Listing #{$listingId}{$refDisplay} updated by {$userName}",
                'published'   => "Listing #{$listingId}{$refDisplay} published by {$userName}",
                'unpublished' => "Listing #{$listingId}{$refDisplay} unpublished by {$userName}",
                'deleted'     => "Listing #{$listingId}{$refDisplay} deleted by {$userName}",
                'viewed'      => "Listing #{$listingId}{$refDisplay} viewed by {$userName}",
                'duplicated'  => "Listing #{$listingId}{$refDisplay} duplicated by {$userName}",
                'refreshed'   => "Listing #{$listingId}{$refDisplay} refreshed by {$userName}",
                default       => "Action {$action} on listing #{$listingId} by {$userName}",
            };
        }

        // Client IP & User Agent
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? '');
        if ($ip && strpos($ip, ',') !== false) {
            $ip = trim(explode(',', $ip)[0]);
        }
        $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);

        // Changes JSON
        $changes = $data['changes'] ?? null;
        $changesStr = '';
        if (is_array($changes)) {
            $changesStr = json_encode($changes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } elseif (is_string($changes)) {
            $changesStr = $changes;
        }

        // Portals
        $portals = $data['portals'] ?? null;
        $portalsStr = '';
        if (is_array($portals)) {
            $portalsStr = implode(', ', array_filter($portals));
        } elseif (is_string($portals)) {
            $portalsStr = $portals;
        }

        // Bitrix CRM Item Fields
        $fields = [
            'title'               => $itemTitle,
            'assignedById'        => $assignedId,  // System assignedById field
            'parentId1052'        => $listingId,   // Direct parent-child link to listing
            'ufCrm20ListingId'    => $listingId,   // Custom listing ID field
            'ufCrm20Reference'    => $listingRef,
            'ufCrm20ListingTitle' => $listingTitle,
            'ufCrm20Action'       => $actionEnumId,
            'ufCrm20UserId'       => $userId > 0 ? $userId : $assignedId, // Custom user ID field
            'ufCrm20UserName'     => $userName,
            'ufCrm20UserRole'     => $userRole,
            'ufCrm20Description'  => $description,
            'ufCrm20Changes'      => $changesStr,
            'ufCrm20Portals'      => $portalsStr,
            'ufCrm20IpAddress'    => $ip,
            'ufCrm20UserAgent'    => $userAgent,
        ];

        $res = bitrixRequest('crm.item.add', [
            'entityTypeId' => ACTIVITY_LOGS_ENTITY_ID,
            'fields'       => $fields,
        ]);

        return $res['result']['item'] ?? null;
    } catch (\Throwable $e) {
        error_log("Failed to log activity: " . $e->getMessage());
        return null;
    }
}

/**
 * Compute the field-by-field differences between the current listing and the new input.
 *
 * @param array $oldListing Current listing array (formatted with frontend keys)
 * @param array $newInput   Incoming payload from user request
 * @return array Array of changed fields with ['old' => ..., 'new' => ...]
 */
function computeListingDiff(array $oldListing, array $newInput): array
{
    $diff = [];
    $ignoredKeys = [
        'id', 'created_at', 'updated_at', 'bayut_created_at', 'bayut_updated_at',
        'pf_created_at', 'pf_updated_at', 'brochure_url', 'is_unit_restricted',
    ];

    foreach ($newInput as $key => $newVal) {
        if (in_array($key, $ignoredKeys, true)) {
            continue;
        }

        // Special handling for images
        if ($key === 'images') {
            $oldImages = is_array($oldListing['images'] ?? null) ? $oldListing['images'] : [];
            $newImages = is_array($newVal) ? $newVal : [];
            if (count($oldImages) !== count($newImages)) {
                $diff['images'] = [
                    'old_count' => count($oldImages),
                    'new_count' => count($newImages),
                ];
            }
            continue;
        }

        // Special handling for documents/files
        if (in_array($key, ['title_deed', 'passport', 'mou_contract', 'floorplan', 'listing_form'], true)) {
            $oldDoc = !empty($oldListing[$key]);
            $newDoc = !empty($newVal);
            if ($oldDoc !== $newDoc) {
                $diff[$key] = [
                    'old' => $oldDoc ? 'Attached' : 'None',
                    'new' => $newDoc ? 'Attached' : 'Removed',
                ];
            }
            continue;
        }

        // Extract scalar or simple array values
        $oldVal = $oldListing[$key] ?? null;
        if (is_array($oldVal) && isset($oldVal['id'])) {
            $oldVal = $oldVal['id'];
        }

        if (is_array($newVal) && isset($newVal['id'])) {
            $newVal = $newVal['id'];
        }

        // Handle array comparison (e.g. portals, amenities)
        if (is_array($oldVal) || is_array($newVal)) {
            $oldNorm = is_array($oldVal) ? array_values(array_filter($oldVal)) : [];
            $newNorm = is_array($newVal) ? array_values(array_filter($newVal)) : [];
            sort($oldNorm);
            sort($newNorm);
            if ($oldNorm != $newNorm) {
                $diff[$key] = [
                    'old' => $oldNorm,
                    'new' => $newNorm,
                ];
            }
            continue;
        }

        // Normalize scalar comparisons (convert null and empty string to equivalent)
        $oldStr = $oldVal === null ? '' : trim((string)$oldVal);
        $newStr = $newVal === null ? '' : trim((string)$newVal);

        if ($oldStr !== $newStr) {
            $diff[$key] = [
                'old' => $oldVal,
                'new' => $newVal,
            ];
        }
    }

    return $diff;
}

/**
 * Throttle viewed events to prevent spamming the activity log when the user
 * refreshes or revisits the listing detail view multiple times in a short window.
 *
 * @param int $listingId
 * @param int $userId
 * @param int $windowSeconds Default: 900 seconds (15 minutes)
 * @return bool True if the view is throttled (should be skipped), false if it should be logged.
 */
function shouldThrottleView(int $listingId, int $userId, int $windowSeconds = 900): bool
{
    $cacheDir = __DIR__ . '/../cache/views';
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0777, true);
    }

    $cacheFile = "{$cacheDir}/{$listingId}_{$userId}.txt";
    $now = time();

    if (file_exists($cacheFile)) {
        $lastViewed = (int)file_get_contents($cacheFile);
        if (($now - $lastViewed) < $windowSeconds) {
            return true; // Throttle
        }
    }

    file_put_contents($cacheFile, (string)$now);
    return false; // Do not throttle
}
