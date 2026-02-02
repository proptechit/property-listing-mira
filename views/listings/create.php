<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
        <a href="?page=listings&action=list"
            class="inline-flex items-center gap-2 text-md font-medium text-blue-600 hover:text-blue-800">
            <i class="fa-solid fa-arrow-left"></i> Back to Listings
        </a>

        <div class="mt-3">
            <h1 class="text-xl font-semibold tracking-tight text-slate-900">Create New Listing</h1>
            <p class="mt-1 text-md text-slate-500">Please fill in all the required fields</p>
        </div>
    </div>

    <form id="createListingForm" class="space-y-6">
        <!-- Management -->
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 class="text-md font-semibold text-slate-900">Management</h2>
                    <p class="text-md text-slate-500">Agent and owner assignment</p>
                </div>
                <i class="fa-solid fa-briefcase text-slate-400"></i>
            </div>

            <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-md font-semibold text-slate-500">Listing Agent <span class="text-red-500">*</span></label>
                    <div class="mt-1 relative">
                        <select name="listing_agent" id="agentSelect" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
        </section>

        <!-- Specifications -->
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 class="text-md font-semibold text-slate-900">Specifications</h2>
                    <p class="text-md text-slate-500">Core property details</p>
                </div>
                <i class="fa-solid fa-sliders text-slate-400"></i>
            </div>

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
        </section>

        <!-- Property Permit -->
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 class="text-md font-semibold text-slate-900">Property Permit</h2>
                    <p class="text-md text-slate-500">Permit details</p>
                </div>
                <i class="fa-solid fa-file-signature text-slate-400"></i>
            </div>

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
        </section>

        <!-- Pricing -->
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 class="text-md font-semibold text-slate-900">Pricing</h2>
                    <p class="text-md text-slate-500">Price and payment details</p>
                </div>
                <i class="fa-solid fa-coins text-slate-400"></i>
            </div>

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

                <!-- <div>
                    <label class="block text-md font-semibold text-slate-500">Financial Status</label>
                    <div class="mt-1 relative">
                        <input type="text" name="financial_status"
                            class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Clear / Mortgage / Pending">
                        <i class="fa-solid fa-circle-check absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                    </div>
                </div> -->

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
        </section>

        <!-- Title and Description -->
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 class="text-md font-semibold text-slate-900">Title and Description</h2>
                    <p class="text-md text-slate-500">What users will see</p>
                </div>
                <i class="fa-solid fa-pen-nib text-slate-400"></i>
            </div>

            <div class="p-5 space-y-4">
                <div>
                    <label class="block text-md font-semibold text-slate-500">Title <span class="text-red-500">*</span></label>
                    <input type="text" name="title" required
                        class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Marina View Apartment">
                </div>

                <div>
                    <label class="block text-md font-semibold text-slate-500">Description <span class="text-red-500">*</span></label>
                    <textarea name="description_en" rows="8" required
                        class="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write a detailed description..."></textarea>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-md font-semibold text-slate-500">Reference</label>
                        <div class="mt-1 relative">
                            <input type="text" name="reference"
                                class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. REF-1021">
                            <i class="fa-solid fa-hashtag absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Amenities -->
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 class="text-md font-semibold text-slate-900">Amenities</h2>
                    <p class="text-md text-slate-500">Select available amenities</p>
                </div>
                <i class="fa-solid fa-star text-slate-400"></i>
            </div>

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
        </section>

        <!-- Location -->
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 class="text-md font-semibold text-slate-900">Location</h2>
                    <p class="text-md text-slate-500">Where the property is</p>
                </div>
                <i class="fa-solid fa-location-dot text-slate-400"></i>
            </div>

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
        </section>

        <!-- Photos and Videos -->
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 class="text-md font-semibold text-slate-900">Photos and Videos</h2>
                    <p class="text-md text-slate-500">Manage media content</p>
                </div>
                <i class="fa-solid fa-photo-film text-slate-400"></i>
            </div>

            <div class="p-5 space-y-6">
                <!-- Photos Section -->
                <div>
                    <label class="block text-md font-semibold text-slate-900 mb-4">Photos</label>

                    <!-- Image Input Area -->
                    <div class="mb-4 p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                        <div class="flex items-center justify-center flex-col gap-2">
                            <input type="file" id="imageInput" multiple accept="image/*" class="hidden">
                            <button type="button" id="addImageBtn"
                                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-md transition-colors">
                                <i class="fa-solid fa-plus"></i>
                                Add Images
                            </button>
                            <p class="text-sm text-slate-500">Select images to add to the gallery or drag & drop to reorder</p>
                        </div>
                    </div>

                    <!-- Image Preview Grid -->
                    <div id="imagePreviewGrid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        <!-- Images will be dynamically added here -->
                    </div>

                    <!-- Hidden input to store image URLs -->
                    <input type="hidden" name="images" id="imagesInput" value="">
                </div>

                <!-- Videos Section -->
                <div class="pt-4 border-t border-slate-200">
                    <label class="block text-md font-semibold text-slate-900 mb-4">Videos</label>

                    <!-- Default Video -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-slate-700 mb-2">Default Video Link</label>
                        <input type="url" name="video" id="videoInput" placeholder="https://example.com/video.mp4"
                            class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                        <p class="text-sm text-slate-500 mt-1">Enter a direct link to the video file or streaming URL</p>
                    </div>

                    <!-- 360 View Video -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">360 View Video Link</label>
                        <input type="url" name="video_360" id="video360Input" placeholder="https://example.com/video-360.mp4"
                            class="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-md text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                        <p class="text-sm text-slate-500 mt-1">Enter a direct link to the 360-degree video</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 justify-end">
            <a href="?page=listings&action=list"
                class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-md font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200">
                Cancel
            </a>

            <button type="submit"
                class="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-md font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100">
                <i class="fa-solid fa-floppy-disk"></i>
                Save Listing
            </button>
        </div>
    </form>
</div>

<script src="assets/js/listings.js"></script>
<script src="assets/js/create.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof loadFormOptions === "function") loadFormOptions();
        if (typeof setupCreateForm === "function") setupCreateForm();
        if (typeof setupCreatePageUI === "function") setupCreatePageUI();
    });
</script>