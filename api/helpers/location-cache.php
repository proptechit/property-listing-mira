<?php

function getLocationCache(): array
{
    $file = __DIR__ . '/../cache/locations.json';

    if (!file_exists($file)) {
        return [];
    }

    $data = json_decode(file_get_contents($file), true);
    return is_array($data) ? $data : [];
}

function saveLocationCache(array $cache): void
{
    $file = __DIR__ . '/../cache/locations.json';

    if (!is_dir(dirname($file))) {
        mkdir(dirname($file), 0777, true);
    }

    file_put_contents($file, json_encode($cache));
}

function fetchLocationsByIds(array $ids, array &$cache): void
{
    if (empty($ids)) {
        return;
    }

    $res = bitrixRequest('crm.item.list', [
        'entityTypeId' => LOCATIONS_ENTITY_ID,
        'filter' => [
            '@id' => $ids
        ],
        'select' => ['id', 'title']
    ]);

    $items = $res['result']['items'] ?? [];

    foreach ($items as $item) {
        $cache[$item['id']] = $item['title'];
    }
}
