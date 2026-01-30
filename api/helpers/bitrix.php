<?php
function bitrixRequest($method, $params = [], $customUrl = null)
{
    if ($customUrl) {
        $url = $customUrl;
    } else {
        $url = BITRIX_WEBHOOK . $method;
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($params),
        CURLOPT_TIMEOUT        => 30,
    ]);

    $response = curl_exec($ch);

    if ($response === false) {
        return [
            'error' => true,
            'message' => curl_error($ch),
        ];
    }

    return json_decode($response, true);
}
