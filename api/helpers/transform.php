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
                $out[$bitrixField] = ($value === null || $value === '') ? '' : ($enums[$key][$value] ?? $value);
            }
        } else {
            $out[$bitrixField] = ($value === null) ? '' : $value;
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

        // Sanitize date fields where Bitrix may return "N", empty string, or false for unset dates
        $dateFields = ['available_from', 'permit_expiry_date', 'permit_issue_date', 'bayut_created_at', 'bayut_updated_at', 'pf_created_at', 'pf_updated_at'];
        if (in_array($frontendKey, $dateFields, true) && ($value === 'N' || $value === '' || $value === false)) {
            $out[$frontendKey] = null;
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

/**
 * Normalize listing purpose to Bitrix enum ID ('358' for Sale/Buy, '359' for Rent).
 */
function normalizePurposeValue($val): string
{
    if (is_array($val)) {
        $val = reset($val);
    }
    $val = trim((string)$val);
    if ($val === '') {
        return '';
    }
    $lower = strtolower($val);
    if ($val === '358' || $lower === 'for sale' || $lower === 'sale' || $lower === 'buy' || $lower === 'sell') {
        return '358';
    }
    if ($val === '359' || $lower === 'for rent' || $lower === 'rent') {
        return '359';
    }
    return $val;
}
