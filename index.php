<?php
require __DIR__ . '/config.php';

if ($ENV === 'production') {
    ini_set('display_errors', 0);
    error_reporting(0);

    require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");
    $USER_ID = $USER->GetID();
} else {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    $USER_ID = 1;
}

if (!$USER_ID) {
    http_response_code(403);
    echo 'Unauthorized';
    die();
}

echo "<script>
    localStorage.setItem('user_id', btoa('{$USER_ID}'));
    localStorage.setItem('is_admin', btoa('" . (in_array($USER_ID, $ADMIN_IDS) ? '1' : '0') . "'));
    localStorage.setItem('env', btoa('" . $ENV . "'));
</script>";

$page   = $_GET['page'] ?? 'listings';
$action = $_GET['action'] ?? 'list';

$viewPath = __DIR__ . "/views/$page/$action.php";

if (!file_exists($viewPath)) {
    http_response_code(404);
    echo "Page not found";
    exit;
}

require __DIR__ . '/views/partials/header.php';
require __DIR__ . '/views/partials/sidebar.php';
require $viewPath;
require __DIR__ . '/views/partials/footer.php';
