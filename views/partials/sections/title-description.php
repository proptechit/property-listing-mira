<section class="bg-white rounded-2xl border border-slate-200 shadow-sm" data-collapsible data-open="false">
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none" data-collapsible-toggle>
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-pen-nib text-slate-400"></i>
            <div>
                <h2 class="text-md font-semibold text-slate-900">Title and Description</h2>
                <p class="text-md text-slate-500">What users will see</p>
            </div>
        </div>
        <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-200" data-collapsible-icon></i>
    </div>

    <div class="overflow-hidden transition-all duration-300 ease-in-out" data-collapsible-content>
        <div class="p-5 space-y-4">
            <div>
                <label class="block text-md font-semibold text-slate-500">Title <span class="text-red-500">*</span></label>
                <input
                    type="text"
                    name="title"
                    id="titleInput"
                    maxlength="50"
                    required
                    class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Marina View Apartment">

                <p class="mt-1 text-sm text-slate-500">
                    <span id="titleCount">0</span>/50 characters
                    (<span id="titleRemaining">50</span> left)
                </p>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">Description <span class="text-red-500">*</span></label>
                <textarea
                    name="description_en"
                    id="descriptionInput"
                    rows="8"
                    minlength="750"
                    maxlength="2000"
                    required
                    class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write a detailed description..."></textarea>

                <p class="mt-1 text-sm text-slate-500">
                    <span id="descriptionCount">0</span>/2000 characters
                    (<span id="descriptionRemaining">2000</span> left)
                    · Minimum 750 required
                </p>
                <div class="flex justify-end">
                    <button
                        type="button"
                        id="appendCompanyInfoBtn"
                        class="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold">
                        <i class="fa-solid fa-building"></i>
                        Add Mira details
                    </button>
                </div>
            </div>
        </div>
    </div>
</section>