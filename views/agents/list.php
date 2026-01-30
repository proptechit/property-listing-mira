<div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Agents</h1>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BRN #</th>
                </tr>
            </thead>
            <tbody id="agentsList" class="bg-white divide-y divide-gray-200">
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
            </tbody>
        </table>
        <div id="agentsPagination"></div>
    </div>
</div>

<script src="assets/js/agents.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof loadAgents === 'function') {
            loadAgents();
        }
    });
</script>