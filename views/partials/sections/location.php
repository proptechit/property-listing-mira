<section class="bg-white rounded-2xl border border-slate-200 shadow-sm" data-collapsible data-open="false">
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none" data-collapsible-toggle>
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-location-dot text-slate-400"></i>
            <div>
                <h2 class="text-md font-semibold text-slate-900">Location</h2>
                <p class="text-md text-slate-500">Where the property is</p>
            </div>
        </div>
        <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-200" data-collapsible-icon></i>
    </div>

    <div class="transition-all duration-300 ease-in-out" data-collapsible-content>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-md font-semibold text-slate-500">UAE Emirate</label>
                <div class="mt-1 relative">
                    <input type="hidden" name="emirate" id="uaeEmirate" value="">
                    <button type="button" id="uaeEmirateBtn"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-left text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between">
                        <span id="uaeEmirateLabel" class="text-slate-400">Select Emirate</span>
                        <i class="fa-solid fa-chevron-down text-slate-400"></i>
                    </button>
                    <div id="uaeEmirateMenu"
                        class="absolute z-20 mt-2 hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"></div>
                </div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">Location <span class="text-red-500">*</span></label>
                <div class="mt-1 relative">
                    <!-- Keep the select for native form validation; JS will populate a selected option -->
                    <select name="location" id="locationSelect" required class="hidden">
                        <option value="">Select Location</option>
                    </select>

                    <!-- Searchable picker -->
                    <div class="relative">
                        <input
                            id="locationSearchInput"
                            type="text"
                            autocomplete="off"
                            placeholder="Search and select a location..."
                            class="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-10 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
                        <i class="fa-solid fa-map-pin absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                        <button id="clearLocationBtn" type="button"
                            class="hidden absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-slate-200 text-slate-500">
                            ✕
                        </button>

                        <div id="locationSearchMenu"
                            class="absolute z-30 mt-2 hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                            <div class="p-3 text-md text-slate-500">Type at least 2 characters to search…</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>