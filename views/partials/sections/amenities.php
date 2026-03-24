<section class="bg-white rounded-2xl border border-slate-200 shadow-sm" data-collapsible data-open="false">
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none" data-collapsible-toggle>
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-star text-slate-400"></i>
            <div>
                <h2 class="text-md font-semibold text-slate-900">Amenities</h2>
                <p class="text-md text-slate-500">Select available amenities</p>
            </div>
        </div>
        <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-200" data-collapsible-icon></i>
    </div>

    <div class="transition-all duration-300 ease-in-out" data-collapsible-content>
        <div class="p-5 space-y-6">
            <div>
                <div class="flex items-center gap-2 mb-3">
                    <i class="fa-solid fa-building text-slate-400"></i>
                    <h3 class="text-md font-semibold text-slate-900">Property Finder Amenities</h3>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="amenitiesPfContainer"></div>
            </div>

            <div>
                <div class="flex items-center gap-2 mb-3">
                    <i class="fa-solid fa-house-signal text-slate-400"></i>
                    <h3 class="text-md font-semibold text-slate-900">Bayut Amenities</h3>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="amenitiesBayutContainer"></div>
            </div>
        </div>
    </div>
</section>