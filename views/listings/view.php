<?php
$id = $_GET['id'] ?? null;
if (!$id) {
    echo '<div class="p-6"><p class="text-red-600">Listing ID is required</p></div>';
    exit;
}
?>

<div>
    <div class="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        <div>
            <a href="?page=listings&action=list" class="text-blue-600 hover:text-blue-800 mb-2 inline-block text-sm font-semibold transition-colors">
                ← Back to Listings
            </a>
            <h1 class="text-2xl font-bold text-slate-800">Listing Details</h1>
            <p class="text-md text-slate-500 mt-1">View full information, media, and key attributes.</p>
        </div>
        <div class="flex items-center gap-2 justify-end">
            <a id="editListingBtn" href="?page=listings&action=edit&id=<?php echo htmlspecialchars($id); ?>"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-md font-semibold transition-colors shadow-md shadow-blue-100">
                <i class="fa-solid fa-pen-to-square mr-2"></i> Edit Listing
            </a>
        </div>
    </div>

    <div id="listingDetails" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div class="animate-pulse">
            <div class="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div class="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
    </div>
</div>

<script>
    const listingId = <?php echo json_encode($id); ?>;
</script>
<script src="assets/js/listing-view.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof loadListingDetails === 'function') {
            loadListingDetails(listingId);
        }
    });
</script>