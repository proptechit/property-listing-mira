<?php

function toBitrixFields(array $input, array $map, array $enums = []): array
{
    $out = [];

    foreach ($input as $key => $value) {

        if (!isset($map[$key])) {
            continue;
        }

        $bitrixField = $map[$key];

        // enum mapping (label → ID)
        if (isset($enums[$key])) {

            // multiple enum
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
    $reverse = array_flip($map);
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

function mapFilters(array $query, array $map): array
{
    $out = [];

    foreach ($query as $key => $value) {
        if (isset($map[$key])) {
            $out[$map[$key]] = $value;
        }
    }

    return $out;
}
