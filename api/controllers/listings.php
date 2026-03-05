<?php

require 'helpers/response.php';
require 'helpers/request.php';
require 'helpers/bitrix.php';
require 'helpers/transform.php';
require 'helpers/location-cache.php';
require 'helpers/user-cache.php';

$map = require 'mappings/listings.php';
$enums = require 'enums/listings.php';

function summarizeImagePayload(array $images): array
{
    $out = [];
    foreach ($images as $i => $img) {
        if (is_int($img)) {
            $out[] = ['idx' => $i, 'type' => 'id', 'value' => $img];
            continue;
        }

        if (is_array($img) && count($img) === 2) {
            $name = is_string($img[0] ?? null) ? $img[0] : '';
            $body = is_string($img[1] ?? null) ? $img[1] : '';
            $out[] = [
                'idx' => $i,
                'type' => 'tuple',
                'name' => $name,
                'base64_len' => strlen($body),
            ];
            continue;
        }

        if (is_array($img)) {
            $out[] = ['idx' => $i, 'type' => 'array', 'keys' => array_keys($img)];
            continue;
        }

        if (is_object($img)) {
            $out[] = ['idx' => $i, 'type' => 'object', 'keys' => array_keys((array)$img)];
            continue;
        }

        $out[] = ['idx' => $i, 'type' => gettype($img)];
    }
    return $out;
}

function normalizeFiles(array $files): array
{
    $result = [];

    foreach ($files as $file) {
        $name = is_object($file) ? ($file->name ?? null) : ($file['name'] ?? null);
        $src  = is_object($file) ? ($file->src ?? null)  : ($file['src'] ?? null);

        // If already in format: ["name", "base64"]
        if (is_array($src) && count($src) === 2) {
            $tupleName = (string)($src[0] ?? '');
            $tupleBody = (string)($src[1] ?? '');
            if ($tupleName !== '' && $tupleBody !== '') {
                $result[] = [$tupleName, cleanBase64($tupleBody)];
            }
            continue;
        }

        // Prefer src-based conversion to tuple (create-style) whenever src exists.
        if (is_string($src) && trim($src) !== '') {
            if (!$name || !is_string($name) || trim($name) === '') {
                $name = isLikelyUrl($src) ? inferFileNameFromUrl($src) : ('image-' . uniqid() . '.jpg');
            }

            if (isLikelyUrl($src)) {
                $downloaded = downloadUrlAsBase64($src);
                if ($downloaded !== null) {
                    $result[] = [$name, $downloaded];
                }
                continue;
            }

            $result[] = [$name, cleanBase64($src)];
            continue;
        }

        // Fallback: if no src is present, preserve existing Bitrix file id.
        $existingId = extractExistingFileId($file);
        if ($existingId !== null) {
            $result[] = $existingId;
            continue;
        }
    }

    return $result;
}

function extractExistingFileId($file): ?int
{
    $candidate = null;

    if (is_object($file)) {
        $candidate = $file->existingFileId ?? $file->existing_file_id ?? $file->fileId ?? $file->file_id ?? null;
    } elseif (is_array($file)) {
        $candidate = $file['existingFileId'] ?? $file['existing_file_id'] ?? $file['fileId'] ?? $file['file_id'] ?? null;
    }

    if ($candidate === null || $candidate === '') {
        return null;
    }

    if (is_int($candidate)) return $candidate;
    if (is_float($candidate)) return (int)$candidate;
    if (is_string($candidate) && preg_match('/^\d+$/', trim($candidate))) {
        return (int)trim($candidate);
    }

    return null;
}

function isLikelyUrl(string $value): bool
{
    return preg_match('/^https?:\/\//i', trim($value)) === 1;
}

function inferFileNameFromUrl(string $url): string
{
    $path = parse_url($url, PHP_URL_PATH) ?: '';
    $name = basename($path);
    if (!$name || $name === '/' || strpos($name, '.') === false) {
        return 'image-' . uniqid() . '.jpg';
    }
    return $name;
}

function downloadUrlAsBase64(string $url): ?string
{
    if (!isLikelyUrl($url)) return null;

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
    ]);

    $binary = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_errno($ch);
    curl_close($ch);

    if ($curlErr !== 0 || $httpCode < 200 || $httpCode >= 300 || !is_string($binary) || $binary === '') {
        return null;
    }

    return base64_encode($binary);
}

function cleanBase64(string $src): string
{
    if (strpos($src, 'base64,') !== false) {
        $src = substr($src, strpos($src, 'base64,') + 7);
    }

    return trim($src);
}


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

        $item = fromBitrixFields($res['result']['item'], $map, $enums);

        // Hydrate location + agent + owner (same behavior as list endpoint)
        $locationIds = [];
        $userIds = [];

        if (!empty($item['location'])) {
            $locationIds[] = $item['location'];
        }

        if (!empty($item['listing_agent'])) {
            $userIds[] = $item['listing_agent'];
        }

        if (!empty($item['listing_owner'])) {
            $userIds[] = $item['listing_owner'];
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

        if (!empty($item['location']) && isset($locationCache[$item['location']])) {
            $item['location'] = [
                'id' => $item['location'],
                'name' => $locationCache[$item['location']],
            ];
        }

        if (!empty($item['listing_agent']) && isset($userCache[$item['listing_agent']])) {
            $item['listing_agent'] = [
                'id' => $item['listing_agent'],
                'name' => $userCache[$item['listing_agent']],
            ];
        }

        if (!empty($item['listing_owner']) && isset($userCache[$item['listing_owner']])) {
            $item['listing_owner'] = [
                'id' => $item['listing_owner'],
                'name' => $userCache[$item['listing_owner']],
            ];
        }

        jsonResponse($item);
    }

    // list items
    $filter = mapFilters($_GET, $map, $enums);

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
            $item['location'] = [
                'id' => $item['location'],
                'name' => $locationCache[$item['location']],
            ];
        }

        if (!empty($item['listing_agent']) && isset($userCache[$item['listing_agent']])) {
            $item['listing_agent'] = [
                'id' => $item['listing_agent'],
                'name' => $userCache[$item['listing_agent']],
            ];
        }

        if (!empty($item['listing_owner']) && isset($userCache[$item['listing_owner']])) {
            $item['listing_owner'] = [
                'id' => $item['listing_owner'],
                'name' => $userCache[$item['listing_owner']],
            ];
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

    // reformat images
    $input['images'] = normalizeFiles($input['images']);

    // reformat documents
    // if (!empty($input['title_deed']) && is_array($input['title_deed'])) {
    //     $input['title_deed'] = normalizeFiles([$input['title_deed']])[0];
    // }
    // if (!empty($input['passport_copy']) && is_array($input['passport_copy'])) {
    //     $input['passport_copy'] = normalizeFiles([$input['passport_copy']])[0];
    // }
    // if (!empty($input['emirates_id']) && is_array($input['emirates_id'])) {
    //     $input['emirates_id'] = normalizeFiles([$input['emirates_id']])[0];
    // }
    // if (!empty($input['contract_a']) && is_array($input['contract_a'])) {
    //     $input['contract_a'] = normalizeFiles([$input['contract_a']])[0];
    // }
    // if (!empty($input['listing_form']) && is_array($input['listing_form'])) {
    //     $input['listing_form'] = normalizeFiles([$input['listing_form']])[0];
    // }

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
    $requestId = uniqid('img_put_', true);

    // reformat images
    $input['images'] = normalizeFiles($input['images'] ?? []);

    // reformat documents
    // if (!empty($input['title_deed']) && is_array($input['title_deed'])) {
    //     $input['title_deed'] = normalizeFiles([$input['title_deed']])[0];
    // }
    // if (!empty($input['passport_copy']) && is_array($input['passport_copy'])) {
    //     $input['passport_copy'] = normalizeFiles([$input['passport_copy']])[0];
    // }
    // if (!empty($input['emirates_id']) && is_array($input['emirates_id'])) {
    //     $input['emirates_id'] = normalizeFiles([$input['emirates_id']])[0];
    // }
    // if (!empty($input['contract_a']) && is_array($input['contract_a'])) {
    //     $input['contract_a'] = normalizeFiles([$input['contract_a']])[0];
    // }
    // if (!empty($input['listing_form']) && is_array($input['listing_form'])) {
    //     $input['listing_form'] = normalizeFiles([$input['listing_form']])[0];
    // }

    $fields = toBitrixFields($input, $map, $enums);
    $bitrixImages = $fields[$map['images']] ?? [];

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

    if (empty($res['result']['item'])) {
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
