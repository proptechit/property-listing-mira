<?php
require __DIR__ . '/config.php';

if ($ENV === 'production') {
    require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");
    $USER_ID = $USER->GetID();
} else {
    $USER_ID = (int)($_GET['dev_user_id'] ?? 1);
}

if (!$USER_ID) {
    http_response_code(403);
    echo 'Unauthorized';
    die();
}

$isAdmin = in_array($USER_ID, $ADMIN_IDS);

echo "<script>
    localStorage.setItem('user_id', btoa('{$USER_ID}'));
    localStorage.setItem('is_admin', btoa('" . ($isAdmin ? '1' : '0') . "'));
    localStorage.setItem('env', btoa('" . $ENV . "'));
</script>";

$page   = $_GET['page'] ?? 'listings';
$action = $_GET['action'] ?? 'list';

// Activity logs are restricted to administrators only
if ($page === 'activity-logs' && !$isAdmin) {
    http_response_code(403);
    require __DIR__ . '/views/partials/header.php';
    echo '<div class="max-w-xl mx-auto my-16 bg-white p-8 rounded-2xl border border-red-200 shadow-sm text-center">
        <div class="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i class="fa-solid fa-lock"></i>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p class="text-gray-600 mb-6">Activity logs and audit trails are only accessible to administrators.</p>
        <a href="?page=listings&action=list" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition">
            <i class="fa-solid fa-arrow-left"></i> Return to Listings
        </a>
    </div>';
    require __DIR__ . '/views/partials/footer.php';
    exit;
}

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
