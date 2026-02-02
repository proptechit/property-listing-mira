<?php

function toBitrixFields(array $input, array $map, array $enums = []): array
{
    $out = [];

    foreach ($input as $key => $value) {

        if (!isset($map[$key]) || $map[$key] === null || $map[$key] === '') {
            continue;
        }

        $bitrixField = $map[$key];

        // enum mapping (label → ID)
        if (isset($enums[$key])) {

            if (is_array($value)) {
                $out[$bitrixField] = array_map(
                    fn($v) => $enums[$key][$v] ?? $v,
                    $value
                );
            } else {
                $out[$bitrixField] = $enums[$key][$value] ?? $value;
            }
        } else {
            $out[$bitrixField] = $value;
        }
    }

    return $out;
}

function fromBitrixFields(array $item, array $map, array $enums = []): array
{
    // build reverse map safely
    $reverse = [];
    foreach ($map as $frontend => $bitrix) {
        if ($bitrix !== null && $bitrix !== '') {
            $reverse[$bitrix] = $frontend;
        }
    }

    $out = [];

    foreach ($item as $key => $value) {

        if (!isset($reverse[$key])) {
            continue;
        }

        $frontendKey = $reverse[$key];

        // enum reverse mapping (ID → label)
        if (isset($enums[$frontendKey])) {
            $reverseEnum = array_flip($enums[$frontendKey]);

            if (is_array($value)) {
                $out[$frontendKey] = array_map(
                    fn($v) => $reverseEnum[$v] ?? $v,
                    $value
                );
            } else {
                $out[$frontendKey] = $reverseEnum[$value] ?? $value;
            }
        } else {
            $out[$frontendKey] = $value;
        }
    }

    if (isset($item['id'])) {
        $out['id'] = $item['id'];
    }

    return $out;
}

function mapFilters(array $query, array $map, array $enums = []): array
{
    $out = [];

    foreach ($query as $key => $value) {

        if (
            !isset($map[$key]) ||
            $map[$key] === null ||
            $map[$key] === '' ||
            $value === '' ||
            $value === null
        ) {
            continue;
        }

        // If enum mapping exists, convert UI value → Bitrix value
        if (isset($enums[$key]) && isset($enums[$key][$value])) {
            $value = $enums[$key][$value];
        }

        $out[$map[$key]] = $value;
    }

    return $out;
}
