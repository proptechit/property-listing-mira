<?php
// Admin authorization check - redundant safeguard alongside index.php
if (empty($isAdmin)) {
    http_response_code(403);
    echo '<div class="p-6"><p class="text-red-600 font-semibold">Access restricted to administrators.</p></div>';
    exit;
}

$initialListingId = $_GET['listing_id'] ?? '';
$initialAction = $_GET['action_filter'] ?? '';
?>

<div class="space-y-6">
    <!-- Page Header & Main Controls -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
            <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-gray-900">Activity Logs & Audit Trail</h1>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                    <i class="fa-solid fa-shield-halved text-[10px]"></i> Admin Only
                </span>
            </div>
            <p class="text-sm text-gray-500 mt-1">
                Real-time history of listing creations, status updates, edits, views, and workflow triggers across all properties.
            </p>
        </div>

        <div class="flex items-center gap-2">
            <button id="refreshLogsBtn" type="button"
                class="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                <i class="fa-solid fa-arrows-rotate text-gray-500" id="refreshLogsIcon"></i>
                <span>Refresh Logs</span>
            </button>
        </div>
    </div>

    <!-- Stats Quick Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" id="activityStatsCards">
        <div class="bg-white rounded-xl shadow-2xs border border-gray-200 p-4">
            <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-500 uppercase">Total Events</span>
                <span class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                    <i class="fa-solid fa-list-check"></i>
                </span>
            </div>
            <div class="text-2xl font-bold text-gray-900 mt-2" id="statTotalCount">--</div>
            <div class="text-xs text-gray-400 mt-0.5">Recorded actions</div>
        </div>

        <div class="bg-white rounded-xl shadow-2xs border border-gray-200 p-4">
            <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-500 uppercase">Updates & Edits</span>
                <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                    <i class="fa-solid fa-pen-to-square"></i>
                </span>
            </div>
            <div class="text-2xl font-bold text-gray-900 mt-2" id="statUpdatesCount">--</div>
            <div class="text-xs text-gray-400 mt-0.5">Field modifications</div>
        </div>

        <div class="bg-white rounded-xl shadow-2xs border border-gray-200 p-4">
            <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-500 uppercase">Status Changes</span>
                <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
                    <i class="fa-solid fa-circle-check"></i>
                </span>
            </div>
            <div class="text-2xl font-bold text-gray-900 mt-2" id="statPublishCount">--</div>
            <div class="text-xs text-gray-400 mt-0.5">Published / Unpublished</div>
        </div>

        <div class="bg-white rounded-xl shadow-2xs border border-gray-200 p-4">
            <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-500 uppercase">Listing Views</span>
                <span class="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center text-sm font-bold">
                    <i class="fa-solid fa-eye"></i>
                </span>
            </div>
            <div class="text-2xl font-bold text-gray-900 mt-2" id="statViewsCount">--</div>
            <div class="text-xs text-gray-400 mt-0.5">Tracked views</div>
        </div>
    </div>

    <!-- Filter & Search Controls Bar -->
    <div class="bg-white rounded-2xl shadow-2xs border border-gray-200 p-4 sm:p-5">
        <form id="activityFilterForm" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Filter by Listing ID / Ref -->
            <div>
                <label for="filterListingId" class="block text-xs font-semibold text-gray-600 mb-1">Listing ID / Ref</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <i class="fa-solid fa-hashtag text-xs"></i>
                    </div>
                    <input type="text" id="filterListingId" value="<?php echo htmlspecialchars($initialListingId); ?>"
                        placeholder="e.g. 1052 or REF-001"
                        class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition">
                </div>
            </div>

            <!-- Filter by Action -->
            <div>
                <label for="filterAction" class="block text-xs font-semibold text-gray-600 mb-1">Action Type</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <i class="fa-solid fa-filter text-xs"></i>
                    </div>
                    <select id="filterAction"
                        class="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium cursor-pointer transition">
                        <option value="">All Actions</option>
                        <option value="created">Created</option>
                        <option value="updated">Updated</option>
                        <option value="published">Published</option>
                        <option value="unpublished">Unpublished</option>
                        <option value="deleted">Deleted</option>
                        <option value="viewed">Viewed</option>
                        <option value="duplicated">Duplicated</option>
                        <option value="refreshed">Refreshed</option>
                    </select>
                </div>
            </div>

            <!-- Filter by User ID / Actor -->
            <div>
                <label for="filterUserId" class="block text-xs font-semibold text-gray-600 mb-1">Actor User ID</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <i class="fa-solid fa-user text-xs"></i>
                    </div>
                    <input type="number" id="filterUserId" placeholder="e.g. 1, 30, 523"
                        class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition">
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-end gap-2">
                <button type="submit"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-magnifying-glass text-xs"></i>
                    <span>Apply</span>
                </button>
                <button type="button" id="resetFilterBtn"
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3.5 rounded-xl text-sm font-semibold transition-colors" title="Reset Filters">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </form>
    </div>

    <!-- Active Filters Pills Bar (Shown when filtered) -->
    <div id="activeFilterPills" class="hidden flex flex-wrap items-center gap-2 pt-1"></div>

    <!-- Activity Log List Card -->
    <div class="bg-white rounded-2xl shadow-2xs border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50/75">
                    <tr>
                        <th scope="col" class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Action & Timestamp
                        </th>
                        <th scope="col" class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Listing
                        </th>
                        <th scope="col" class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actor (User)
                        </th>
                        <th scope="col" class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Description
                        </th>
                        <th scope="col" class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Changes / Details
                        </th>
                    </tr>
                </thead>
                <tbody id="activityLogsTableBody" class="bg-white divide-y divide-gray-100">
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                            <div class="flex flex-col items-center justify-center gap-2">
                                <div class="inline-block animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"></div>
                                <span class="text-sm font-medium text-gray-600">Loading activity logs...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination Controls -->
        <div id="activityLogsPagination" class="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <div class="text-sm text-gray-600" id="paginationInfo">
                Showing <span class="font-semibold text-gray-900" id="pageStart">0</span> to <span class="font-semibold text-gray-900" id="pageEnd">0</span> of <span class="font-semibold text-gray-900" id="totalRecords">0</span> activities
            </div>
            <div class="flex items-center gap-2">
                <button id="prevPageBtn" disabled
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <i class="fa-solid fa-chevron-left text-xs"></i>
                    <span>Previous</span>
                </button>
                <div class="text-sm font-medium text-gray-700 px-2" id="pageNumberDisplay">
                    Page 1
                </div>
                <button id="nextPageBtn" disabled
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    <span>Next</span>
                    <i class="fa-solid fa-chevron-right text-xs"></i>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Changes Details Modal -->
<div id="changesDetailModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-2xl w-full overflow-hidden transform transition-all">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                    <i class="fa-solid fa-code-compare"></i>
                </div>
                <div>
                    <h3 class="text-base font-bold text-gray-900" id="changesModalTitle">Field Changes</h3>
                    <p class="text-xs text-gray-500" id="changesModalSubtitle">Listing #</p>
                </div>
            </div>
            <button type="button" onclick="closeChangesModal()" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        <div class="p-6 max-h-[70vh] overflow-y-auto space-y-4" id="changesModalBody">
            <!-- Dynamically populated -->
        </div>

        <div class="px-6 py-3.5 border-t border-gray-100 bg-gray-50/75 flex justify-end">
            <button type="button" onclick="closeChangesModal()"
                class="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-semibold transition">
                Close
            </button>
        </div>
    </div>
</div>

<script src="assets/js/activity-logs.js"></script>
