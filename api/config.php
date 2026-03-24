<?php
header("Content-Type: application/json");

ini_set('memory_limit', '512M');

define('BITRIX_WEBHOOK', 'https://crm.mira-international.com/rest/1/egxjcopwiiz4mjwr/');
define('LISTINGS_ENTITY_ID', 1052);
define('LOCATIONS_ENTITY_ID', 1056);
define('BAYUT_LOCATIONS_ENTITY_ID', 1074);

$CUSTOM_USERS_API = "https://crm.mira-international.com/pub/endpoints/users/";