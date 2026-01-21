<?php
$id = $_GET['id'] ?? null;
if (!$id) {
    echo '<div class="p-6"><p class="text-red-600">Listing ID is required</p></div>';
    exit;
}
?>

<div>
    <div class="mb-6">
        <a href="?page=listings&action=list" class="text-blue-600 hover:text-blue-800 mb-4 inline-block text-sm font-medium transition-colors">
            ← Back to Listings
        </a>
        <h1 class="text-2xl font-semibold text-gray-900">Edit Listing</h1>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        <form id="editListingForm" class="space-y-4">
            <input type="hidden" name="id" value="<?php echo htmlspecialchars($id); ?>">

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" name="title" id="title" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" id="description" rows="4" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input type="number" name="price" id="price" step="0.01" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select name="location_id" id="locationSelect" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select Location</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Agent</label>
                    <select name="agent_id" id="agentSelect" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select Agent</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                    <select name="owner_id" id="ownerSelect" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select Owner</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" id="status" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            <div class="flex gap-4 pt-4">
                <button type="submit"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    Update Listing
                </button>
                <a href="?page=listings&action=list"
                    class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                    Cancel
                </a>
            </div>
        </form>
    </div>
</div>

<script>
    const listingId = <?php echo json_encode($id); ?>;
</script>
<script src="assets/js/listings.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof loadFormOptions === 'function') {
            loadFormOptions();
        }
        if (typeof loadListingForEdit === 'function') {
            loadListingForEdit(listingId);
        }
        if (typeof setupEditForm === 'function') {
            setupEditForm(listingId);
        }
    });
</script>