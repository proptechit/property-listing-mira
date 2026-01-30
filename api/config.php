<?php

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);

header("Content-Type: application/json");

define('BITRIX_WEBHOOK', 'https://crm.mira-international.com/rest/1/egxjcopwiiz4mjwr/');
define('LISTINGS_ENTITY_ID', 1052);
define('LOCATIONS_ENTITY_ID', 1056);

$CUSTOM_USERS_API = "https://crm.mira-international.com/pub/endpoints/users/";
