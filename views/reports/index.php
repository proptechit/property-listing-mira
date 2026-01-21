<div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Reports</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Listings by Status -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Listings by Status</h2>
            <canvas id="statusChart"></canvas>
        </div>

        <!-- Listings by Location -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Listings by Location</h2>
            <canvas id="locationChart"></canvas>
        </div>
    </div>

    <!-- Price Distribution -->
    <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Price Distribution</h2>
        <canvas id="priceChart"></canvas>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="/assets/js/reports.js"></script>
<script>
document.addEventListener("DOMContentLoaded", () => {
    if (typeof loadReports === 'function') {
        loadReports();
    }
});
</script>