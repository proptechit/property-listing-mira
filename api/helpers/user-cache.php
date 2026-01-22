<?php

function getUserCache(): array
{
    $file = __DIR__ . '/../cache/users.json';

    if (!file_exists($file)) {
        return [];
    }

    $data = json_decode(file_get_contents($file), true);
    return is_array($data) ? $data : [];
}

function saveUserCache(array $cache): void
{
    $file = __DIR__ . '/../cache/users.json';

    if (!is_dir(dirname($file))) {
        mkdir(dirname($file), 0777, true);
    }

    file_put_contents($file, json_encode($cache));
}

function fetchUsersByIds(array $ids, array &$cache): void
{
    if (empty($ids)) {
        return;
    }

    $res = bitrixRequest('user.get', [

        'filter' => [
            '@ID' => $ids
        ],
        'select' => ['ID', 'NAME', 'LAST_NAME']
    ]);

    $items = $res['result'] ?? [];

    foreach ($items as $item) {
        $cache[$item['ID']] = trim($item['NAME'] . ' ' . $item['LAST_NAME']);
    }
}
