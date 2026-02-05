<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <?php include_once(__DIR__ . '/../partials/sections/management.php'); ?>

        <!-- Specifications -->
        <?php include_once(__DIR__ . '/../partials/sections/specifications.php'); ?>

        <!-- Property Permit -->
        <?php include_once(__DIR__ . '/../partials/sections/property-permit.php'); ?>

        <!-- Pricing -->
        <?php include_once(__DIR__ . '/../partials/sections/pricing.php'); ?>

        <!-- Title and Description -->
        <?php include_once(__DIR__ . '/../partials/sections/title-description.php'); ?>

        <!-- Amenities -->
        <?php include_once(__DIR__ . '/../partials/sections/amenities.php'); ?>

        <!-- Location -->
        <?php include_once(__DIR__ . '/../partials/sections/location.php'); ?>

        <!-- Photos and Videos -->
        <?php include_once(__DIR__ . '/../partials/sections/photos-videos.php'); ?>

        <!-- Documents -->
        <?php include_once(__DIR__ . '/../partials/sections/documents.php'); ?>

        <!-- Listing Options -->
        <?php include_once(__DIR__ . '/../partials/sections/listing-options.php'); ?>

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

<script src="assets/js/utils.js"></script>
<script src="assets/js/listings.js"></script>
<script src="assets/js/create.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", async () => {
        initCollapsibleSections();

        if (typeof loadFormOptions === "function") {
            await loadFormOptions();
        }
        if (typeof setupCreateForm === "function") {
            setupCreateForm();
        }
    });
</script>