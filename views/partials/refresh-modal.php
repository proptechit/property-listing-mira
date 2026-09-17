<!-- Refresh Listing Modal -->
<div id="refreshListingModal" class="fixed inset-0 bg-black/40 z-50 hidden items-center justify-center backdrop-blur-sm p-4" aria-hidden="true">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                    <i class="fa-solid fa-arrows-rotate text-lg"></i>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-slate-800">Refresh Listing</h3>
                    <p class="text-xs text-slate-500">Update reference & run workflow</p>
                </div>
            </div>
            <button type="button" id="closeRefreshModalBtn" class="text-slate-400 hover:text-slate-600 h-8 w-8 rounded-lg flex items-center justify-center transition hover:bg-slate-100">
                ✕
            </button>
        </div>

        <form id="refreshListingForm" class="p-6 space-y-4">
            <input type="hidden" id="refreshListingId" value="">
            <div>
                <label for="refreshReferenceInput" class="block text-sm font-bold text-slate-700 mb-1.5">
                    Reference Number <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                    <i class="fa-solid fa-hashtag absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input type="text" id="refreshReferenceInput" required
                        class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-md text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium"
                        placeholder="e.g. MIRA-1024">
                </div>
                <p class="text-xs text-slate-400 mt-2">
                    The listing reference will be saved first, then the refresh workflow (ID 189) will be executed.
                </p>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" id="cancelRefreshModalBtn"
                    class="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition">
                    Cancel
                </button>
                <button type="submit" id="submitRefreshModalBtn"
                    class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 transition inline-flex items-center gap-2">
                    <i class="fa-solid fa-arrows-rotate"></i>
                    <span>Save & Refresh</span>
                </button>
            </div>
        </form>
    </div>
</div>
