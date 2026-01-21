<div>
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Locations</h1>
        <button onclick="openLocationModal()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Add Location
        </button>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody id="locationsList" class="bg-white divide-y divide-gray-200">
                <tr>
                    <td colspan="2" class="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
            </tbody>
        </table>
        <div id="locationsPagination"></div>
    </div>
</div>

<!-- Location Modal -->
<div id="locationModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50 items-center justify-center" style="display: none;">
    <div class="bg-white rounded-lg shadow-lg border border-gray-200 max-w-md w-full mx-4">
        <div class="p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-gray-900" id="modalTitle">Add Location</h2>
                <button onclick="closeLocationModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <form id="locationForm" class="space-y-4">
                <input type="hidden" id="locationId" name="id">

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" id="locationName" name="name" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>

                <div class="flex gap-4 pt-4">
                    <button type="submit"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                        Save
                    </button>
                    <button type="button" onclick="closeLocationModal()"
                        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="/assets/js/locations.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof loadLocations === 'function') {
            loadLocations();
        }
    });
</script>