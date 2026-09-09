<div>
    <!-- Page Header & Action Buttons -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
            <div class="flex items-center gap-3 flex-wrap">
                <h1 class="text-2xl font-semibold text-gray-900">Locations</h1>
                <span id="lastSyncBadge" class="hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 shadow-2xs">
                    <i class="fa-solid fa-clock-rotate-left text-gray-400"></i>
                    <span id="lastSyncBadgeText">Last Synced: Checking...</span>
                </span>
            </div>
            <p class="text-sm text-gray-500 mt-1">Manage portal locations and synchronize with Property Finder and Bayut</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
            <!-- Sync Locations Button -->
            <button id="syncLocationsBtn" onclick="openSyncLocationsModal()"
                class="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed">
                <i class="fa-solid fa-arrows-rotate text-gray-500" id="syncLocationsIcon"></i>
                <span id="syncLocationsText">Sync Locations</span>
            </button>

            <!-- Add Location Button -->
            <button onclick="openLocationModal()"
                class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <i class="fa-solid fa-plus"></i>
                <span>Add Location</span>
            </button>
        </div>
    </div>

    <!-- Status / Notification Alert Banner -->
    <div id="statusAlert" class="hidden mb-6 rounded-lg p-4 transition-all duration-300 border">
        <div class="flex items-center justify-between w-full gap-3">
            <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="flex-shrink-0" id="statusAlertIcon"></div>
                <div class="text-sm font-medium leading-5" id="statusAlertMessage"></div>
            </div>
            <button type="button" onclick="hideStatusAlert()" class="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors ml-auto" title="Dismiss">
                <i class="fa-solid fa-xmark text-sm"></i>
            </button>
        </div>
    </div>

    <!-- Locations Table Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PF ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody id="locationsList" class="bg-white divide-y divide-gray-200">
                <tr>
                    <td colspan="3" class="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
            </tbody>
        </table>
        <div id="locationsPagination"></div>
    </div>
</div>

<!-- Sync Locations Modal -->
<div id="syncLocationsModal"
    class="fixed inset-0 z-50 hidden flex items-center justify-center">

    <!-- Backdrop -->
    <div
        onclick="closeSyncLocationsModal()"
        class="absolute inset-0 bg-black/40 backdrop-blur-sm">
    </div>

    <!-- Modal Card -->
    <div class="relative bg-white rounded-xl shadow-xl border border-gray-200 max-w-lg w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <!-- Modal Header -->
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <div>
                <h2 class="text-xl font-semibold text-gray-900">
                    Sync Locations
                </h2>
                <p class="text-xs text-gray-500 mt-0.5">Synchronize locations from Property Finder and Bayut</p>
            </div>
            <button onclick="closeSyncLocationsModal()"
                class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>

        <!-- Sync Form -->
        <form id="syncLocationsForm" class="p-6 space-y-5 overflow-y-auto flex-1">
            <!-- Last Sync Info Box -->
            <div class="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <i class="fa-solid fa-clock-rotate-left text-blue-600 text-sm"></i>
                    <div>
                        <div class="text-xs font-medium text-blue-900">Last Synced Time (SPA 1056)</div>
                        <div id="modalLastSyncText" class="text-xs text-blue-700 mt-0.5 font-medium">Checking...</div>
                    </div>
                </div>
                <button type="button" onclick="loadLastSyncTime()" class="text-xs text-blue-600 hover:text-blue-800 bg-white border border-blue-200 rounded px-2 py-1 shadow-2xs hover:bg-blue-50 transition">
                    Refresh
                </button>
            </div>

            <!-- City Selection (Required) -->
            <div>
                <label for="syncCitySelect" class="block text-sm font-medium text-gray-700 mb-1">
                    City / Emirate <span class="text-red-500">*</span>
                </label>
                <select id="syncCitySelect" name="city" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">-- Select City --</option>
                    <option value="Dubai" selected>Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                    <option value="Ajman">Ajman</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                    <option value="Umm Al Quwain">Umm Al Quwain</option>
                    <option value="Fujairah">Fujairah</option>
                </select>
                <p class="text-xs text-gray-400 mt-1">Select the city to synchronize locations for</p>
            </div>

            <!-- Bayut Optional Parameters Card -->
            <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3.5">
                <div class="flex items-center gap-2 border-b border-gray-200 pb-2">
                    <i class="fa-solid fa-filter text-gray-500 text-xs"></i>
                    <span class="text-xs font-semibold text-gray-700 uppercase tracking-wider">Bayut Filters (Optional)</span>
                </div>

                <div>
                    <label for="syncCommunity" class="block text-xs font-medium text-gray-600 mb-1">
                        Community
                    </label>
                    <input type="text" id="syncCommunity" name="community"
                        placeholder="e.g. Downtown Dubai"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                    <label for="syncSubcommunity" class="block text-xs font-medium text-gray-600 mb-1">
                        Sub Community
                    </label>
                    <input type="text" id="syncSubcommunity" name="subcommunity"
                        placeholder="e.g. Burj Khalifa District"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                    <label for="syncBuilding" class="block text-xs font-medium text-gray-600 mb-1">
                        Building Name
                    </label>
                    <input type="text" id="syncBuilding" name="building"
                        placeholder="e.g. Burj Crown"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
            </div>

            <!-- Modal Footer Buttons -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onclick="closeSyncLocationsModal()"
                    class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Cancel
                </button>
                <button type="submit" id="startSyncBtn"
                    class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50">
                    <span id="startSyncBtnText">Start Sync</span>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Add / Edit Location Modal -->
<div id="locationModal"
    class="fixed inset-0 z-50 hidden flex items-center justify-center">

    <!-- Backdrop -->
    <div
        onclick="closeLocationModal()"
        class="absolute inset-0 bg-black/40 backdrop-blur-sm">
    </div>

    <!-- Modal -->
    <div class="relative bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full mx-4">
        <div class="p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-gray-900" id="modalTitle">
                    Add Location
                </h2>
                <button onclick="closeLocationModal()"
                    class="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <form id="locationForm" class="space-y-4">
                <input type="hidden" id="locationId" name="id">

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">PF ID</label>
                    <input type="text" id="locationPfId" name="pf_id" required
                        placeholder="1234"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" id="locationName" name="name" required
                        placeholder="Ajman One Tower 10, Ajman One, Ajman Downtown, Ajman"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>

                <div class="flex gap-4 pt-4">
                    <button type="submit"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                        Save
                    </button>
                    <button type="button" onclick="closeLocationModal()"
                        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="assets/js/locations.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof loadLocations === 'function') {
            loadLocations();
        }
        if (typeof loadLastSyncTime === 'function') {
            loadLastSyncTime();
        }
        if (typeof initSyncLocationsModal === 'function') {
            initSyncLocationsModal();
        }
    });
</script>