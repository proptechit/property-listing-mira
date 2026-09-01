<?php
header("Content-Type: application/json");

ini_set('memory_limit', '512M');

define('BITRIX_WEBHOOK', 'https://crm.mira-international.com/rest/1/egxjcopwiiz4mjwr/');
define('LISTINGS_ENTITY_ID', 1052);
define('LOCATIONS_ENTITY_ID', 1056);
define('BAYUT_LOCATIONS_ENTITY_ID', 1074);
define('DEVELOPERS_ENTITY_ID', 1078);

$CUSTOM_USERS_API = "https://crm.mira-international.com/pub/endpoints/users/";

/**
 * Property Finder Atlas API Configuration
 */
define('PF_API_BASE_URL', 'https://atlas.propertyfinder.com/v1');
define('PF_API_KEY', 'NWYtD.Dtl5S99RFiN3ubzOoJ8DkQkVNxMIikwpbo');
define('PF_API_SECRET', '6EDbWpCiJ7qbLVLz7AmJ8e1O2BCKG5lW');
define('PF_LICENSE_NUMBER', '881995');

/**
 * Bitrix user IDs who are allowed to modify restricted fields
 * (price & images) on published listings.
 * Keep in sync with the root config.php $ADMIN_IDS list.
 */
define('ADMIN_IDS', [
    1,   // Mira International
    30,  // Cindy Nacario (Admin of ST1)
    31,  // Jezra Agao (Admin of ST2)
    156, // Jaymee Javin (Admin of ST3)
    167, // Marimar Ordaniel (Admin of ST4)
    157, // Alex Jordan Devenport (Admin of ST5)
    29,  // Ma. Betty (Admin of ST4 and PO)
    249, // Daniela Ramos (Admin of PO)
    134, // Moh'D Barakat
    5,   // Kristina Boeva
    7,   // Abinas Subair
    123, // Aldo De Jager
    28,  // Daphne Varghese
]);