<section class="bg-white rounded-2xl border border-slate-200 shadow-sm" data-collapsible data-open="false">
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none" data-collapsible-toggle>
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-sliders text-slate-400"></i>
            <div>
                <h2 class="text-md font-semibold text-slate-900">Specifications</h2>
                <p class="text-md text-slate-500">Core property details</p>
            </div>
        </div>

        <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-200" data-collapsible-icon></i>
    </div>

    <div class="overflow-hidden transition-all duration-300 ease-in-out" data-collapsible-content>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Residential/Commercial -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Residential / Commercial</label>
                <div class="mt-1 relative">
                    <input type="hidden" name="category" id="propertyCategory" value="">
                    <button type="button" id="propertyCategoryBtn"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-left text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between">
                        <span id="propertyCategoryLabel" class="text-slate-400">Select Category</span>
                        <i class="fa-solid fa-chevron-down text-slate-400"></i>
                    </button>

                    <div id="propertyCategoryMenu"
                        class="absolute z-20 mt-2 hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        <!-- populated by JS -->
                    </div>
                </div>
            </div>

            <!-- Property Type -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Property Type <span class="text-red-500">*</span></label>
                <div class="mt-1 relative">
                    <input type="hidden" name="property_type_pf" id="propertyType" value="">
                    <button type="button" id="propertyTypeBtn"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-left text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between">
                        <span id="propertyTypeLabel" class="text-slate-400">Select Type</span>
                        <i class="fa-solid fa-chevron-down text-slate-400"></i>
                    </button>

                    <div id="propertyTypeMenu"
                        class="absolute z-20 mt-2 hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        <!-- populated by JS -->
                    </div>
                </div>
            </div>
            <!-- Sale/Rent -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Sale/Rent <span class="text-red-500">*</span></label>
                <div class="mt-1 relative">
                    <input type="hidden" name="purpose" id="purposeType" value="">
                    <button type="button" id="purposeTypeBtn"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-left text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between">
                        <span id="purposeTypeLabel" class="text-slate-400">Select Sale/Rent</span>
                        <i class="fa-solid fa-chevron-down text-slate-400"></i>
                    </button>
                    <div id="purposeTypeMenu"
                        class="absolute z-20 mt-2 hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"></div>
                </div>
            </div>
            <!-- Unit Number -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Unit Number</label>
                <div class="mt-1 relative">
                    <input type="text" name="unit_number"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 1202">
                    <i class="fa-solid fa-door-closed absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>
            <!-- Floor Number -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Floor Number</label>
                <div class="mt-1 relative">
                    <input type="text" name="floor_number"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 12">
                    <i class="fa-solid fa-layer-group absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>
            <!-- Plot Number -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Plot Number</label>
                <div class="mt-1 relative">
                    <input type="text" name="plot_number"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 102">
                    <i class="fa-solid fa-map absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>
            <!-- Plot Size -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Plot Size</label>
                <div class="mt-1 relative">
                    <input type="number" name="plot_size" min="0"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0">
                    <i class="fa-solid fa-ruler-horizontal absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">No. of Bedrooms</label>
                <div class="mt-1 relative">
                    <input type="number" name="bedrooms" min="0"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0">
                    <i class="fa-solid fa-bed absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">No. of Bathrooms</label>
                <div class="mt-1 relative">
                    <input type="number" name="bathrooms" min="0"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0">
                    <i class="fa-solid fa-bath absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">Size (sqft)</label>
                <div class="mt-1 relative">
                    <input type="number" name="size" min="0"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0">
                    <i class="fa-solid fa-ruler-combined absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>

            <!-- Furnishing -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Furnishing Type <span class="text-red-500">*</span></label>
                <div class="mt-1 relative">
                    <input type="hidden" name="furnishing_type" id="furnishingType" value="">
                    <button type="button" id="furnishingTypeBtn"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-left text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between">
                        <span id="furnishingTypeLabel" class="text-slate-400">Select Furnishing</span>
                        <i class="fa-solid fa-chevron-down text-slate-400"></i>
                    </button>
                    <div id="furnishingTypeMenu"
                        class="absolute z-20 mt-2 hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"></div>
                </div>
            </div>

            <!-- Finishing Type -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Finishing Type</label>
                <div class="mt-1 relative">
                    <input type="hidden" name="finishing_type" id="finishingType" value="">
                    <button type="button" id="finishingTypeBtn"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-left text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between">
                        <span id="finishingTypeLabel" class="text-slate-400">Select Finishing</span>
                        <i class="fa-solid fa-chevron-down text-slate-400"></i>
                    </button>
                    <div id="finishingTypeMenu"
                        class="absolute z-20 mt-2 hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"></div>
                </div>
            </div>

            <!-- Project Status -->
            <div>
                <label class="block text-md font-semibold text-slate-500">Project Status <span class="text-red-500">*</span></label>
                <div class="mt-1 relative">
                    <input type="hidden" name="project_status" id="projectStatus" value="">
                    <button type="button" id="projectStatusBtn"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-left text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between">
                        <span id="projectStatusLabel" class="text-slate-400">Select Status</span>
                        <i class="fa-solid fa-chevron-down text-slate-400"></i>
                    </button>
                    <div id="projectStatusMenu"
                        class="absolute z-20 mt-2 hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"></div>
                </div>
            </div>
        </div>
    </div>
</section>