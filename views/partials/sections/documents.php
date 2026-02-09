<section class="bg-white rounded-2xl border border-slate-200 shadow-sm" data-collapsible data-open="false">
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none" data-collapsible-toggle>
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-folder-open text-slate-400"></i>
            <div>
                <h2 class="text-md font-semibold text-slate-900">Documents</h2>
                <p class="text-md text-slate-500">Upload required property documents</p>
            </div>
        </div>
        <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-200" data-collapsible-icon></i>
    </div>

    <div class="transition-all duration-300 ease-in-out" data-collapsible-content>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Document field template -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Title Deed <span class="text-red-500">*</span></label>
                <input type="file" name="title_deed" required
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="mt-1 block w-full text-sm text-slate-600
                    file:mr-4 file:rounded-lg file:border-0
                    file:bg-slate-100 file:px-4 file:py-2
                    file:font-semibold file:text-slate-700
                    hover:file:bg-slate-200">
                <div id="titleDeedPreview" class="mt-2 text-sm text-slate-500"></div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">Passport Copy <span class="text-red-500">*</span></label>
                <input type="file" name="passport_copy" required
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0
                    file:bg-slate-100 file:px-4 file:py-2 file:font-semibold
                    file:text-slate-700 hover:file:bg-slate-200">
                <div id="passportPreview" class="mt-2 text-sm text-slate-500"></div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">UAE ID <span class="text-red-500">*</span></label>
                <input type="file" name="emirates_id" required
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0
                    file:bg-slate-100 file:px-4 file:py-2 file:font-semibold
                    file:text-slate-700 hover:file:bg-slate-200">
                <div id="emiratesPreview" class="mt-2 text-sm text-slate-500"></div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">Contract A <span class="text-red-500">*</span></label>
                <input type="file" name="contract_a" required
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0
                    file:bg-slate-100 file:px-4 file:py-2 file:font-semibold
                    file:text-slate-700 hover:file:bg-slate-200">
                <div id="contractPreview" class="mt-2 text-sm text-slate-500"></div>
            </div>

            <div class="sm:col-span-2">
                <label class="block text-md font-semibold text-slate-500">Listing Form <span class="text-red-500">*</span></label>
                <input type="file" name="listing_form" required
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0
                    file:bg-slate-100 file:px-4 file:py-2 file:font-semibold
                    file:text-slate-700 hover:file:bg-slate-200">
                <div id="listingFormPreview" class="mt-2 text-sm text-slate-500"></div>
            </div>

        </div>
    </div>
</section>