<section class="bg-white rounded-2xl border border-slate-200 shadow-sm" data-collapsible data-open="false">
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none" data-collapsible-toggle>
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-coins text-slate-400"></i>
            <div>
                <h2 class="text-md font-semibold text-slate-900">Pricing</h2>
                <p class="text-md text-slate-500">Price and payment details</p>
            </div>
        </div>
        <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-200" data-collapsible-icon></i>
    </div>

    <div class="transition-all duration-300 ease-in-out" data-collapsible-content>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <label class="block text-md font-semibold text-slate-500">Amount Type <span class="text-red-500">*</span></label>
                <div class="mt-1 relative">
                    <input type="hidden" name="price_type" id="amountType" value="">
                    <button type="button" id="amountTypeBtn"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-left text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between">
                        <span id="amountTypeLabel" class="text-slate-400">Select Amount Type</span>
                        <i class="fa-solid fa-chevron-down text-slate-400"></i>
                    </button>
                    <div id="amountTypeMenu"
                        class="absolute z-20 mt-2 hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"></div>
                </div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">Payment Method</label>
                <div class="mt-1 relative">
                    <input type="hidden" name="payment_methods" id="paymentMethod" value="">
                    <button type="button" id="paymentMethodBtn"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-left text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between">
                        <span id="paymentMethodLabel" class="text-slate-400">Select Payment Method</span>
                        <i class="fa-solid fa-chevron-down text-slate-400"></i>
                    </button>
                    <div id="paymentMethodMenu"
                        class="absolute z-20 mt-2 hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"></div>
                </div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">No. of Cheques</label>
                <div class="mt-1 relative">
                    <input type="number" name="cheques" min="0"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0">
                    <i class="fa-solid fa-receipt absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">No. of Mortgage Years</label>
                <div class="mt-1 relative">
                    <input type="number" name="mortgage_years" min="0"
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0">
                    <i class="fa-solid fa-calendar-days absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>

            <div>
                <label class="block text-md font-semibold text-slate-500">Price (AED) <span class="text-red-500">*</span></label>
                <div class="mt-1 relative">
                    <input type="number" name="price" step="0.01" required
                        class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00">
                    <i class="fa-solid fa-tag absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
            </div>
        </div>
    </div>
</section>