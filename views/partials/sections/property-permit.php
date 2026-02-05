<section class="bg-white rounded-2xl border border-slate-200 shadow-sm" id="permitSection" data-collapsible data-open="false">
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none" data-collapsible-toggle>
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-file-signature text-slate-400"></i>
            <div>
                <h2 class="text-md font-semibold text-slate-900">Property Permit</h2>
                <p class="text-md text-slate-500">Permit details</p>
            </div>
        </div>

        <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-200" data-collapsible-icon></i>
    </div>

    <div class="overflow-hidden transition-all duration-300 ease-in-out" data-collapsible-content>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Permit Type -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Permit Type</label>
                <div class="mt-1 relative">
                    <input type="hidden" name="compliance_type" id="permitType" value="">
                    <button type="button" id="permitTypeBtn"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-left text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between">
                        <span id="permitTypeLabel" class="text-slate-400">Select Permit Type</span>
                        <i class="fa-solid fa-chevron-down text-slate-400"></i>
                    </button>
                    <div id="permitTypeMenu"
                        class="absolute z-20 mt-2 hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"></div>
                </div>
            </div>

            <!-- Permit Number -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Permit Number</label>
                <div class="mt-1 relative">
                    <input
                        type="text"
                        name="advertisement_number"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter permit number" />
                    <i class="fa-solid fa-hashtag absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>

            <!-- Permit Issue Date -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Permit Issue Date</label>
                <div class="mt-1 relative">
                    <input
                        type="date"
                        name="license_date"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
        </div>
    </div>
</section>