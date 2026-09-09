<div class="space-y-6">
    <!-- Page Header & Filter Controls -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
            <p class="text-sm text-gray-500 mt-0.5">
                Portfolio performance, branch distribution, property classifications, and listing pipeline
            </p>
        </div>

        <!-- Filter Bar -->
        <div class="flex flex-wrap items-center gap-3">
            <!-- Branch Filter Selector -->
            <div class="relative min-w-[200px]">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <i class="fa-solid fa-code-branch text-xs"></i>
                </div>
                <select id="reportBranchFilter" onchange="onReportBranchChange()"
                    class="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium cursor-pointer transition">
                    <option value="">All Branches (Company-wide)</option>
                    <option value="main">Main Branch</option>
                    <option value="st1">ST1 Branch</option>
                    <option value="st2">ST2 Branch</option>
                    <option value="st3">ST3 Branch</option>
                    <option value="st4">ST4 Branch</option>
                    <option value="st5">ST5 Branch</option>
                    <option value="po">PO Branch</option>
                    <option value="eva">Eva Branch</option>
                </select>
            </div>

            <!-- Refresh Button -->
            <button id="refreshReportBtn" onclick="refreshReports()"
                class="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3.5 py-2 rounded-lg text-sm font-medium transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                <i class="fa-solid fa-arrows-rotate text-gray-500 transition-transform duration-500" id="refreshReportIcon"></i>
                <span id="refreshReportText">Refresh</span>
            </button>

            <!-- Status Indicator Badge -->
            <div id="reportStatusBadge" class="hidden items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span id="reportStatusText">Up to date</span>
            </div>
        </div>
    </div>

    <!-- Executive KPI Metric Cards (Grid of 4) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- KPI 1: Total Listings -->
        <div class="bg-white rounded-xl shadow-2xs border border-gray-200 p-5 flex items-center justify-between transition hover:shadow-xs">
            <div>
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Listings</span>
                <div class="text-2xl font-bold text-gray-900 mt-1" id="kpiTotal">--</div>
                <div class="text-xs text-gray-400 mt-1" id="kpiScopeText">Registered in portfolio</div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-layer-group text-lg"></i>
            </div>
        </div>

        <!-- KPI 2: Active Listings (Published) -->
        <div class="bg-white rounded-xl shadow-2xs border border-gray-200 p-5 flex items-center justify-between transition hover:shadow-xs">
            <div>
                <span class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Active (Published)</span>
                <div class="text-2xl font-bold text-emerald-600 mt-1" id="kpiActive">--</div>
                <div class="text-xs text-emerald-700/80 mt-1" id="kpiActivePct">-- % of portfolio</div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-circle-check text-lg"></i>
            </div>
        </div>

        <!-- KPI 3: Inactive Listings (Other Stages) -->
        <div class="bg-white rounded-xl shadow-2xs border border-gray-200 p-5 flex items-center justify-between transition hover:shadow-xs">
            <div>
                <span class="text-xs font-semibold text-amber-700 uppercase tracking-wider">Inactive (Other Stages)</span>
                <div class="text-2xl font-bold text-amber-600 mt-1" id="kpiInactive">--</div>
                <div class="text-xs text-amber-700/80 mt-1" id="kpiInactivePct">Draft, pipeline & unlisted</div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-clock-rotate-left text-lg"></i>
            </div>
        </div>

        <!-- KPI 4: Market Purpose Split -->
        <div class="bg-white rounded-xl shadow-2xs border border-gray-200 p-5 flex items-center justify-between transition hover:shadow-xs">
            <div>
                <span class="text-xs font-semibold text-purple-700 uppercase tracking-wider">For Sale vs Rent</span>
                <div class="text-xl font-bold text-gray-900 mt-1" id="kpiPurposeSplit">-- / --</div>
                <div class="text-xs text-gray-400 mt-1" id="kpiPurposeSubtext">Sale / Rent breakdown</div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-scale-balanced text-lg"></i>
            </div>
        </div>
    </div>

    <!-- Visual Analytics: Row 1 (Branch Distribution & Property Types) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Branch-Wise Distribution (Active vs Inactive) -->
        <div class="lg:col-span-7 bg-white rounded-xl shadow-2xs border border-gray-200 p-6 flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                        <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <i class="fa-solid fa-code-branch text-blue-600 text-sm"></i>
                            Branch Distribution
                        </h2>
                        <p class="text-xs text-gray-500 mt-0.5">Active (Published) vs Inactive across branches (ufCrm7_1772708634)</p>
                    </div>
                    <!-- Legend Tags -->
                    <div class="flex items-center gap-3 text-xs">
                        <span class="flex items-center gap-1.5 font-medium text-gray-700">
                            <span class="w-3 h-3 rounded-xs bg-emerald-500"></span> Active
                        </span>
                        <span class="flex items-center gap-1.5 font-medium text-gray-500">
                            <span class="w-3 h-3 rounded-xs bg-slate-400"></span> Inactive
                        </span>
                    </div>
                </div>

                <div class="relative mt-4 h-72">
                    <canvas id="branchChart"></canvas>
                </div>
            </div>

            <div class="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Tip: Click on a branch bar to quickly inspect details</span>
                <span id="branchChartSummary" class="font-medium text-gray-700">8 Branches + Unassigned</span>
            </div>
        </div>

        <!-- Property Type Breakdown -->
        <div class="lg:col-span-5 bg-white rounded-xl shadow-2xs border border-gray-200 p-6 flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                        <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <i class="fa-solid fa-building text-indigo-600 text-sm"></i>
                            Property Type Distribution
                        </h2>
                        <p class="text-xs text-gray-500 mt-0.5">Classification by property type</p>
                    </div>
                </div>

                <div class="relative mt-4 h-64 flex items-center justify-center">
                    <canvas id="propertyTypeChart"></canvas>
                </div>
            </div>

            <!-- Top Ranked Types List -->
            <div id="propertyTypeList" class="mt-4 pt-3 border-t border-gray-100 space-y-2 max-h-48 overflow-y-auto pr-1">
                <div class="text-xs text-gray-400 text-center py-2">Loading types...</div>
            </div>
        </div>
    </div>

    <!-- Visual Analytics: Row 2 (Stage Breakdown & Purpose/Category) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Lifecycle & Stage Breakdown -->
        <div class="lg:col-span-7 bg-white rounded-xl shadow-2xs border border-gray-200 p-6">
            <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                    <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <i class="fa-solid fa-list-check text-amber-500 text-sm"></i>
                        Listing Stages Breakdown
                    </h2>
                    <p class="text-xs text-gray-500 mt-0.5">Where listings are positioned across the workflow lifecycle</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div class="md:col-span-6 relative h-64 flex items-center justify-center">
                    <canvas id="statusChart"></canvas>
                </div>

                <div class="md:col-span-6 space-y-2.5 max-h-72 overflow-y-auto pr-1" id="statusPillsList">
                    <!-- Status list loaded dynamically -->
                </div>
            </div>
        </div>

        <!-- Purpose & Category Splits -->
        <div class="lg:col-span-5 bg-white rounded-xl shadow-2xs border border-gray-200 p-6 flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
                    <div>
                        <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <i class="fa-solid fa-chart-pie text-purple-600 text-sm"></i>
                            Market Classification
                        </h2>
                        <p class="text-xs text-gray-500 mt-0.5">Residential/Commercial & Sale/Rent split</p>
                    </div>
                </div>

                <!-- Category: Residential vs Commercial -->
                <div class="space-y-2 mb-6">
                    <div class="flex items-center justify-between text-xs font-medium">
                        <span class="text-gray-700 flex items-center gap-1.5">
                            <i class="fa-solid fa-house text-blue-500"></i> Residential
                        </span>
                        <span class="text-gray-700 flex items-center gap-1.5">
                            <i class="fa-solid fa-building text-amber-500"></i> Commercial
                        </span>
                    </div>
                    <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                        <div id="residentialBar" class="bg-blue-500 h-full transition-all duration-500" style="width: 50%"></div>
                        <div id="commercialBar" class="bg-amber-500 h-full transition-all duration-500" style="width: 50%"></div>
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-gray-500">
                        <span id="residentialCountText">-- (0%)</span>
                        <span id="commercialCountText">-- (0%)</span>
                    </div>
                </div>

                <!-- Purpose: Sale vs Rent -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between text-xs font-medium">
                        <span class="text-gray-700 flex items-center gap-1.5">
                            <i class="fa-solid fa-tag text-emerald-500"></i> For Sale
                        </span>
                        <span class="text-gray-700 flex items-center gap-1.5">
                            <i class="fa-solid fa-key text-purple-500"></i> For Rent
                        </span>
                    </div>
                    <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                        <div id="saleBar" class="bg-emerald-500 h-full transition-all duration-500" style="width: 50%"></div>
                        <div id="rentBar" class="bg-purple-500 h-full transition-all duration-500" style="width: 50%"></div>
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-gray-500">
                        <span id="saleCountText">-- (0%)</span>
                        <span id="rentCountText">-- (0%)</span>
                    </div>
                </div>
            </div>

            <!-- Mini Insights Box -->
            <div class="mt-6 p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
                <i class="fa-solid fa-lightbulb text-blue-600 mt-0.5 shrink-0"></i>
                <div id="marketInsightText">
                    Loading market insight...
                </div>
            </div>
        </div>
    </div>

    <!-- Detailed Branch Performance Table -->
    <div class="bg-white rounded-xl shadow-2xs border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
                <h2 class="text-base font-semibold text-gray-900">Branch Performance Overview</h2>
                <p class="text-xs text-gray-500 mt-0.5">Detailed breakdown of active and inactive listing counts per branch</p>
            </div>
            <span class="text-xs text-gray-400 font-medium">Source: ufCrm7_1772708634</span>
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Branch</th>
                        <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Listings</th>
                        <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-emerald-700 uppercase tracking-wider">Active (Published)</th>
                        <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-amber-700 uppercase tracking-wider">Inactive (Other)</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Active Rate</th>
                        <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Portfolio Share</th>
                        <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody id="branchTableBody" class="bg-white divide-y divide-gray-200">
                    <tr>
                        <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                            <i class="fa-solid fa-spinner fa-spin text-blue-600 mr-2"></i> Loading branch performance data...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Chart.js and Custom Reports Scripts -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="assets/js/reports.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof initReportsPage === "function") {
            initReportsPage();
        } else if (typeof loadReports === "function") {
            loadReports();
        }
    });
</script>