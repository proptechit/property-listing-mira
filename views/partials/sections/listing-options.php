<section class="bg-white rounded-2xl border border-slate-200 shadow-sm" data-collapsible data-open="false">
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none" data-collapsible-toggle>
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-gear text-slate-400"></i>
            <div>
                <h2 class="text-md font-semibold text-slate-900">Listing Options</h2>
                <p class="text-md text-slate-500">Special listing requirements</p>
            </div>
        </div>
        <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-200" data-collapsible-icon></i>
    </div>

    <div class="transition-all duration-300 ease-in-out" data-collapsible-content>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-md font-semibold text-slate-500">Photoshoot Required?</label>
                <select name="photoshoot_required" id="photoshootRequired" class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select>
            </div>
            <div>
                <label class="block text-md font-semibold text-slate-500">Is this a Pocket Listing?</label>
                <select name="pocket_listing" id="pocketListing" class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select>
            </div>
        </div>
    </div>
</section>