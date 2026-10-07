<?php

$url = $_GET['url'] ?? '';

if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing url parameter']);
    exit;
}

$parsed = parse_url($url);
$host = strtolower($parsed['host'] ?? '');

// Allowed hosts: mira CRM and subdomains
$isAllowed = (
    $host === 'crm.mira-international.com' ||
    str_ends_with($host, '.mira-international.com') ||
    $host === 'localhost' ||
    $host === '127.0.0.1'
);

if (!$isAllowed) {
    http_response_code(403);
    echo json_encode(['error' => 'Host not permitted for image proxy']);
    exit;
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 45,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_HTTPHEADER     => [
        'User-Agent: Mozilla/5.0 (compatible; MiraPropertyApp/1.0)',
    ],
]);

$data = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);
curl_close($ch);

if ($data === false || $httpCode < 200 || $httpCode >= 400) {
    http_response_code($httpCode >= 400 ? $httpCode : 502);
    echo json_encode(['error' => 'Failed to fetch image', 'details' => $error]);
    exit;
}

if ($contentType) {
    header("Content-Type: {$contentType}");
} else {
    header("Content-Type: image/jpeg");
}

header('Cache-Control: public, max-age=86400');
echo $data;
exit;
