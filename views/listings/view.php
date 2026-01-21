<?php
$id = $_GET['id'] ?? null;
if (!$id) {
    echo '<div class="p-6"><p class="text-red-600">Listing ID is required</p></div>';
    exit;
}
?>

<div>
    <div class="mb-6">
        <a href="&page=listings&action=list" class="text-blue-600 hover:text-blue-800 mb-4 inline-block text-sm font-medium transition-colors">
            ← Back to Listings
        </a>
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">Listing Details</h1>
            <a href="&page=listings&action=edit&id=<?php echo htmlspecialchars($id); ?>"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                Edit Listing
            </a>
        </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6" id="listingDetails">
        <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
    </div>
</div>

<script>
    const listingId = <?php echo json_encode($id); ?>;
</script>
<script src="assets/js/listings.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof loadListingDetails === 'function') {
            loadListingDetails(listingId);
        }
    });
</script>