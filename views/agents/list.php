<div>
    <!-- Page Header & Action Buttons -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
            <h1 class="text-2xl font-semibold text-gray-900">Agents</h1>
            <p class="text-sm text-gray-500 mt-1">Manage portal agents and synchronize accounts with Bitrix</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
            <!-- Sync Portal Users with Bitrix by Email Button -->
            <button tooltip="Sync PFUsers" id="syncUsersBtn" onclick="syncPortalUsers()"
                class="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed">
                <i class="fa-solid fa-arrows-rotate text-gray-500" id="syncUsersIcon"></i>
                <span id="syncUsersText">Sync Users</span>
            </button>

            <!-- Add Agent Button -->
            <button onclick="openAddAgentModal()"
                class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <i class="fa-solid fa-user-plus"></i>
                <span>Add Agent</span>
            </button>
        </div>
    </div>

    <!-- Status / Notification Alert Banner -->
    <div id="statusAlert" class="hidden mb-6 rounded-lg p-4 transition-all duration-300">
        <div class="flex items-start">
            <div class="flex-shrink-0" id="statusAlertIcon"></div>
            <div class="ml-3 flex-1" id="statusAlertMessage"></div>
            <button type="button" onclick="hideStatusAlert()" class="ml-auto text-gray-400 hover:text-gray-600">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    </div>

    <!-- Agents Table Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PF Public ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bayut ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody id="agentsList" class="bg-white divide-y divide-gray-200">
                    <tr>
                        <td colspan="7" class="px-6 py-4 text-center text-gray-500">Loading...</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="agentsPagination"></div>
    </div>
</div>

<!-- Add / Edit Agent Modal -->
<div id="agentModal"
    class="fixed inset-0 z-50 hidden flex items-center justify-center">

    <!-- Backdrop -->
    <div
        onclick="closeAgentModal()"
        class="absolute inset-0 bg-black/40 backdrop-blur-sm">
    </div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-xl border border-gray-200 max-w-lg w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <!-- Modal Header -->
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <div>
                <h2 class="text-xl font-semibold text-gray-900" id="agentModalTitle">
                    Add Agent
                </h2>
                <p class="text-xs text-gray-500 mt-0.5">Select a Bitrix user and configure portal details</p>
            </div>
            <button onclick="closeAgentModal()"
                class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>

        <!-- Modal Form Body -->
        <form id="agentForm" class="p-6 space-y-5 overflow-y-auto flex-1">
            <input type="hidden" id="agentUserId" name="user_id" required>

            <!-- Bitrix User Selector -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Bitrix User <span class="text-red-500">*</span>
                </label>

                <!-- Selected User Display Card (hidden by default) -->
                <div id="selectedUserCard" class="hidden p-3 bg-blue-50/70 border border-blue-200 rounded-lg items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div id="selectedUserAvatar" class="h-10 w-10 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                            A
                        </div>
                        <div>
                            <div id="selectedUserName" class="text-sm font-medium text-gray-900">User Name</div>
                            <div id="selectedUserEmail" class="text-xs text-gray-500">user@example.com</div>
                            <div id="selectedUserBranch" class="text-xs text-blue-600 font-medium">Branch</div>
                        </div>
                    </div>
                    <button type="button" onclick="clearSelectedUser()" class="text-xs text-gray-500 hover:text-red-600 px-2 py-1 bg-white rounded border border-gray-200 shadow-2xs hover:bg-gray-50 transition">
                        Change
                    </button>
                </div>

                <!-- User Search Input Container -->
                <div id="userSearchContainer" class="relative">
                    <div class="relative">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input type="text" id="userSearchInput" autocomplete="off"
                            placeholder="Type name or email to search Bitrix users..."
                            class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>

                    <!-- Search Results Dropdown List -->
                    <div id="userSearchResults"
                        class="hidden absolute z-30 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto divide-y divide-gray-100">
                        <!-- Populated by JS -->
                    </div>
                </div>
                <p id="userSelectError" class="hidden text-xs text-red-600 mt-1">Please select a Bitrix user.</p>
            </div>

            <!-- PF Public Profile ID -->
            <div>
                <label for="pfPublicProfileId" class="block text-sm font-medium text-gray-700 mb-1">
                    PF Public Profile ID
                </label>
                <input type="text" id="pfPublicProfileId" name="pf_id"
                    placeholder="e.g. 365125"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <p class="text-xs text-gray-400 mt-1">Property Finder public user identifier</p>
            </div>

            <!-- Bayut User ID -->
            <div>
                <label for="bayutUserId" class="block text-sm font-medium text-gray-700 mb-1">
                    Bayut User ID
                </label>
                <input type="text" id="bayutUserId" name="bayut_id"
                    placeholder="e.g. 2701191"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <p class="text-xs text-gray-400 mt-1">Bayut agent identifier</p>
            </div>

            <!-- Super Agent Toggle Card -->
            <div class="p-3.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                    <span class="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                        <i class="fa-solid fa-award text-blue-600 text-xs"></i>
                        Super Agent
                    </span>
                    <p class="text-xs text-gray-500 mt-0.5">Mark this agent as a Super Agent</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer ml-3 flex-shrink-0">
                    <input type="checkbox" id="isSuperAgent" name="super_agent" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>

            <!-- Modal Footer Buttons -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onclick="closeAgentModal()"
                    class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Cancel
                </button>
                <button type="submit" id="saveAgentBtn"
                    class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50">
                    <span id="saveAgentBtnText">Save Agent</span>
                </button>
            </div>
        </form>
    </div>
</div>

<script src="assets/js/agents.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof loadAgents === 'function') {
            loadAgents();
        }
        if (typeof initAgentModal === 'function') {
            initAgentModal();
        }
    });
</script>