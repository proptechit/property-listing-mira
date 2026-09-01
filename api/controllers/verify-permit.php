<?php

require_once __DIR__ . '/../helpers/response.php';

$permitNumber = trim($_GET['permit_number'] ?? '');

if (empty($permitNumber)) {
    jsonResponse([
        'error' => 'Permit number is required'
    ], 400);
}

/**
 * Obtain Property Finder Bearer Token (with caching)
 */
function getPfAuthToken(): ?string
{
    $cacheFile = __DIR__ . '/../cache/pf_token.json';

    if (file_exists($cacheFile)) {
        $cached = json_decode(file_get_contents($cacheFile), true);
        if (
            !empty($cached['accessToken']) &&
            !empty($cached['expires_at']) &&
            time() < ($cached['expires_at'] - 60)
        ) {
            return $cached['accessToken'];
        }
    }

    $ch = curl_init(rtrim(PF_API_BASE_URL, '/') . '/auth/token');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERAGENT      => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_POSTFIELDS     => json_encode([
            'apiKey'    => PF_API_KEY,
            'apiSecret' => PF_API_SECRET,
        ]),
        CURLOPT_TIMEOUT        => 15,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr  = curl_error($ch);
    curl_close($ch);

    if ($curlErr || $httpCode < 200 || $httpCode >= 300 || !$response) {
        error_log("PF Auth Error: HTTP $httpCode, Curl: $curlErr, Body: $response");
        return null;
    }

    $data = json_decode($response, true);
    if (!empty($data['accessToken'])) {
        $expiresIn = (int)($data['expiresIn'] ?? 700);
        $data['expires_at'] = time() + $expiresIn;

        if (!is_dir(dirname($cacheFile))) {
            mkdir(dirname($cacheFile), 0777, true);
        }
        file_put_contents($cacheFile, json_encode($data));

        return $data['accessToken'];
    }

    return null;
}

$token = getPfAuthToken();
if (!$token) {
    jsonResponse([
        'error' => 'Failed to authenticate with Property Finder API'
    ], 502);
}

$permitType = trim($_GET['permitType'] ?? 'rera');
$licenseNumber = PF_LICENSE_NUMBER;

$apiUrl = rtrim(PF_API_BASE_URL, '/') . '/compliances/' . rawurlencode($permitNumber) . '/' . rawurlencode($licenseNumber) . '?permitType=' . rawurlencode($permitType);

$ch = curl_init($apiUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_USERAGENT      => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $token,
        'Accept: application/json',
    ],
    CURLOPT_TIMEOUT        => 20,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    jsonResponse([
        'error' => 'Connection to Property Finder failed: ' . $curlErr
    ], 502);
}

$resultData = json_decode($response, true);

if ($httpCode >= 200 && $httpCode < 300) {
    jsonResponse($resultData, 200);
}

// Handle errors from Property Finder API
$errorMessage = 'Permit verification failed';
if (is_array($resultData)) {
    if (!empty($resultData['detail'])) {
        $errorMessage = $resultData['detail'];
    } elseif (!empty($resultData['message'])) {
        $errorMessage = $resultData['message'];
    } elseif (!empty($resultData['error'])) {
        $errorMessage = $resultData['error'];
    }
}

jsonResponse([
    'error'   => $errorMessage,
    'raw'     => $resultData,
    'status'  => $httpCode
], $httpCode >= 400 && $httpCode < 600 ? $httpCode : 400);
