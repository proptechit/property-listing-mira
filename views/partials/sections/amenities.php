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
        <div class="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3" id="amenitiesContainer">
            <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-md text-slate-700">
                <input type="checkbox" name="amenities_kitchen" class="rounded border-slate-300">
                <i class="fa-solid fa-kitchen-set text-slate-500"></i>
                <span>Kitchen</span>
            </label>

            <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-md text-slate-700">
                <input type="checkbox" name="amenities_garden" class="rounded border-slate-300">
                <i class="fa-solid fa-seedling text-slate-500"></i>
                <span>Garden</span>
            </label>

            <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-md text-slate-700">
                <input type="checkbox" name="amenities_parking" class="rounded border-slate-300">
                <i class="fa-solid fa-square-parking text-slate-500"></i>
                <span>Parking</span>
            </label>

            <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-md text-slate-700">
                <input type="checkbox" name="amenities_pool" class="rounded border-slate-300">
                <i class="fa-solid fa-water-ladder text-slate-500"></i>
                <span>Pool</span>
            </label>
        </div>
    </div>
</section>