<div>
    <!-- <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Listings</h1>
        <a href="?page=listings&action=create"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-md font-medium transition-colors shadow-sm">
            Add Listing
        </a>
    </div> -->

    <div class="flex flex-col lg:flex-row justify-between  gap-6 mb-8">
        <div>
            <h1 class="text-2xl font-bold text-slate-800">Listings</h1>

        </div>

        <div class="flex flex-wrap items-center justify-center lg:justify-end gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <div class="relative w-full sm:w-64 ">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-md"></i>
                <input id="searchInput" type="text" placeholder="Search ID, Project..."
                    class="pl-9 pr-4 py-2 text-md bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full">
            </div>

            <!-- Status Filter -->
            <div class="relative w-full sm:w-44">
                <select id="statusFilter"
                    class="w-full px-4 py-2 text-md bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                    <option value="">All</option>
                    <option value="Start">Start</option>
                    <option value="Photographer Booking">Photographer Booking</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Draft at Property Finder">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Unpublished">Unpublished</option>
                    <option value="Deleted from Property Finder">Deleted</option>
                </select>
            </div>

            <!-- Sale Type Filter -->
            <div class="relative w-full sm:w-44">
                <select id="saleTypeFilter"
                    class="w-full px-4 py-2 text-md bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                    <option value="">All</option>
                    <option value="buy">For Sale</option>
                    <option value="rent">For Rent</option>
                </select>
            </div>

            <div class="h-6 w-[1px] bg-slate-200 mx-1"></div>
            <!-- View Toggle -->
            <div class="flex items-center gap-2">
                <button id="viewListBtn" type="button"
                    class="px-3 py-2 text-md font-semibold rounded-xl transition bg-blue-600 text-white shadow-md shadow-blue-100 flex items-center gap-2"
                    aria-pressed="true">
                    <i class="fa-solid fa-list"></i> List
                </button>
                <button id="viewGridBtn" type="button"
                    class="px-3 py-2 text-md font-semibold rounded-xl transition bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center gap-2"
                    aria-pressed="false">
                    <i class="fa-solid fa-border-all"></i> Grid
                </button>
            </div>
            <div class="flex items-center gap-2">
                <button id="openFiltersBtn"
                    class="px-4 py-2 text-md font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition flex items-center gap-2">
                    <i class="fa-solid fa-sliders"></i> Filters
                </button>
                <a href="?page=listings&action=create"
                    class="px-4 py-2 text-md font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition">
                    Add Listing
                </a>
            </div>
        </div>

    </div>

    <!-- Active filter chips -->
    <div id="activeChips" class="mb-4 hidden">
        <div class="flex flex-wrap items-center gap-2">
            <span class="text-md font-semibold text-slate-500 mr-1">Active:</span>
            <div id="chipsWrap" class="flex flex-wrap gap-2"></div>
            <button
                id="clearAllBtn"
                type="button"
                class="ml-2 text-md font-semibold text-red-600 hover:text-red-700">
                Clear all
            </button>
        </div>
    </div>

    <!-- Filters Drawer (hidden by default) -->
    <div id="filtersDrawer" class="fixed inset-0 z-50 hidden" aria-hidden="true">
        <div id="filtersBackdrop" class="absolute inset-0 bg-black/30"></div>

        <div class="absolute right-0 top-0 h-full w-full sm:w-[540px] bg-white shadow-2xl flex flex-col">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-bold text-slate-800">Filters</h3>
                    <p class="text-md text-slate-500">Narrow down results</p>
                </div>
                <button id="closeFiltersBtn" type="button"
                    class="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600">
                    ✕
                </button>
            </div>

            <div class="p-5 overflow-auto space-y-5">
                <div class="grid grid-cols-2 gap-3">
                    <div class="col-span-2">
                        <label class="text-md font-semibold text-slate-500">Reference</label>
                        <input id="f_reference" type="text"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. REF-1021" />
                    </div>

                    <div class="col-span-2">
                        <label class="text-md font-semibold text-slate-500">Title</label>
                        <input id="f_title" type="text"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Project / Listing title" />
                    </div>

                    <div>
                        <label class="text-md font-semibold text-slate-500">Min Price (AED)</label>
                        <input id="f_minPrice" type="number" inputmode="numeric"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0" />
                    </div>

                    <div>
                        <label class="text-md font-semibold text-slate-500">Max Price (AED)</label>
                        <input id="f_maxPrice" type="number" inputmode="numeric"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="999999" />
                    </div>

                    <div class="col-span-2">
                        <label class="text-md font-semibold text-slate-500">Location</label>
                        <input id="f_location" type="text"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Dubai Marina" />
                    </div>

                    <div>
                        <label class="text-md font-semibold text-slate-500">Status</label>
                        <select id="f_status"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Any</option>
                            <option value="Start">Start</option>
                            <option value="Photographer Booking">Photographer Booking</option>
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Draft at Property Finder">Draft</option>
                            <option value="Published">Published</option>
                            <option value="Unpublished">Unpublished</option>
                            <option value="Deleted from Property Finder">Deleted</option>
                        </select>
                    </div>

                    <div>
                        <label class="text-md font-semibold text-slate-500">Agent</label>
                        <select id="f_agent"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Any</option>

                        </select>
                    </div>

                    <div>
                        <label class="text-md font-semibold text-slate-500">Owner</label>
                        <select id="f_owner"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Any</option>

                        </select>
                    </div>
                    <div>
                        <label class="text-md font-semibold text-slate-500">Type</label>
                        <input id="f_type" type="text"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Apartment / Villa..." />
                    </div>

                    <div>
                        <label class="text-md font-semibold text-slate-500">Bedrooms (min)</label>
                        <input id="f_bedrooms" type="number" inputmode="numeric"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0" />
                    </div>

                    <div>
                        <label class="text-md font-semibold text-slate-500">Bathrooms (min)</label>
                        <input id="f_bathrooms" type="number" inputmode="numeric"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0" />
                    </div>

                    <div>
                        <label class="text-md font-semibold text-slate-500">Min Size (sqft)</label>
                        <input id="f_minSize" type="number" inputmode="numeric"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0" />
                    </div>

                    <div>
                        <label class="text-md font-semibold text-slate-500">Max Size (sqft)</label>
                        <input id="f_maxSize" type="number" inputmode="numeric"
                            class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="99999" />
                    </div>
                </div>
            </div>

            <div class="p-5 border-t border-slate-200 flex items-center justify-between gap-3">
                <button id="resetFiltersBtn" type="button"
                    class="px-4 py-2 rounded-xl text-md font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200">
                    Reset
                </button>

                <div class="flex gap-2">
                    <button id="cancelFiltersBtn" type="button"
                        class="px-4 py-2 rounded-xl text-md font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200">
                        Cancel
                    </button>
                    <button id="applyFiltersBtn" type="button"
                        class="px-5 py-2 rounded-xl text-md font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100">
                        Apply
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- filters drawer ends -->

    <!-- listings view container -->
    <div class="w-full rounded-lg border border-gray-200 bg-white overflow-hidden">
        <!-- list view -->
        <div id="listingsListView" class="w-full overflow-x-auto">
            <table class="w-full min-w-[1100px] table-auto border-collapse text-md">
                <thead class="sticky top-0 z-10 bg-gray-50">
                    <tr class="bg-slate-50/50 border-b border-slate-100">
                        <th class="px-6 py-4 text-md font-bold uppercase text-slate-400 tracking-wider text-center">Title</th>
                        <th class="px-6 py-4 text-md font-bold uppercase text-slate-400 tracking-wider">Type</th>
                        <th class="px-6 py-4 text-md font-bold uppercase text-slate-400 tracking-wider">Purpose</th>
                        <th class="px-6 py-4 text-md font-bold uppercase text-slate-400 tracking-wider">Specifications</th>
                        <th class="px-6 py-4 text-md font-bold uppercase text-slate-400 tracking-wider">Location</th>
                        <th class="px-6 py-4 text-md font-bold uppercase text-slate-400 tracking-wider text-right">Price (AED)</th>
                        <th class="px-6 py-4 text-md font-bold uppercase text-slate-400 tracking-wider">Status</th>
                        <th class="px-6 py-4 text-md font-bold uppercase text-slate-400 tracking-wider">Agent</th>
                        <th class="px-6 py-4 text-md font-bold uppercase text-slate-400 tracking-wider">Owner</th>
                        <th class="px-6 py-4 text-md font-bold uppercase text-slate-400 tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody id="listingsTable" class="bg-white divide-y divide-gray-200">
                    <tr>
                        <td colspan="9" class="px-6 py-4 text-center text-gray-500">Loading...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- grid view -->
        <div id="listingsGridView" class="hidden p-4">
            <div id="listingsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"></div>
        </div>

        <div id="listingsPagination" class="border-t border-gray-200"></div>
    </div>
    <!-- listings view container ends -->
</div>

<script src="assets/js/listings.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof loadListings === 'function') {
            loadListings();
        }
    });
</script>