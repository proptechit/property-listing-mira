<section class="bg-white rounded-2xl border border-slate-200 shadow-sm" data-collapsible data-open="true">
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none" data-collapsible-toggle>
        <div class="flex items-center gap-3">

            <i class="fa-solid fa-briefcase text-slate-400"></i>
            <div>
                <h2 class="text-md font-semibold text-slate-900">Management</h2>
                <p class="text-md text-slate-500">Agent and owner assignment</p>
            </div>
        </div>
        <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-200" data-collapsible-icon></i>
    </div>

    <div class="transition-all duration-300 ease-in-out" data-collapsible-content>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label class="block text-md font-semibold text-slate-500">Reference</label>
                <div class="mt-1 relative">
                    <input type="text" name="reference"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. REF-1021">
                    <i class="fa-solid fa-hashtag absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">Listing Agent <span class="text-red-500">*</span></label>
                <div class="mt-1 relative">
                    <select name="listing_agent" id="agentSelect" required
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Agent</option>
                    </select>
                    <i class="fa-solid fa-user-tie absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">Listing Owner <span class="text-red-500">*</span></label>
                <div class="mt-1 relative">
                    <select name="listing_owner" id="ownerSelect" required
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Owner</option>
                    </select>
                    <i class="fa-solid fa-id-card absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>
        </div>
    </div>
</section>