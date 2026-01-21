<?php
function bitrixRequest($method, $params = [])
{
    $url = BITRIX_WEBHOOK . $method;

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($params)
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}
