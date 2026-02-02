<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Listing Management</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>

<script>
    const USER_ID = parseInt(atob(localStorage.getItem('user_id')));
    const IS_ADMIN = atob(localStorage.getItem('is_admin')) === '1';
    const ENV = atob(localStorage.getItem('env'));
</script>

<body class="bg-gray-50">
    <!-- Top Navigation Bar -->
    <nav class="bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16 items-center">

                <!-- Left: Logo + Title -->
                <div class="flex items-center space-x-3">
                    <!-- Logo -->
                    <a href="?page=listings&action=list" class="flex items-center space-x-2">
                        <img
                            src="https://crm.mira-international.com/local/property-listing-old/logo.svg"
                            alt="Logo"
                            class="h-24 w-24 object-contain" />
                        <span class="text-xl font-semibold text-gray-900 hover:text-blue-600 transition">
                            Property Listing
                        </span>
                    </a>
                </div>

                <!-- Right: Page Dropdown -->
                <div class="relative">
                    <button
                        id="navDropdownBtn"
                        class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <span id="currentPageName">
                            <?php echo ucfirst($page ?? 'Listings'); ?>
                        </span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>

                    <!-- Dropdown -->
                    <div
                        id="navDropdown"
                        class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <a href="?page=listings&action=list"
                            class="block px-4 py-2 text-sm transition-colors
                       <?php echo ($page === 'listings') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'; ?>">
                            Listings
                        </a>

                        <a href="?page=locations&action=list"
                            class="block px-4 py-2 text-sm transition-colors
                       <?php echo ($page === 'locations') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'; ?>">
                            Locations
                        </a>

                        <a href="?page=agents&action=list"
                            class="block px-4 py-2 text-sm transition-colors
                       <?php echo ($page === 'agents') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'; ?>">
                            Agents
                        </a>

                        <a href="?page=owners&action=list"
                            class="block px-4 py-2 text-sm transition-colors
                       <?php echo ($page === 'owners') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'; ?>">
                            Owners
                        </a>

                        <a href="?page=reports"
                            class="block px-4 py-2 text-sm transition-colors
                       <?php echo ($page === 'reports') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'; ?>">
                            Reports
                        </a>
                    </div>
                </div>

            </div>
        </div>
    </nav>

    <script>
        // Dropdown toggle functionality
        document.addEventListener('DOMContentLoaded', function() {
            const dropdownBtn = document.getElementById('navDropdownBtn');
            const dropdown = document.getElementById('navDropdown');

            if (dropdownBtn && dropdown) {
                dropdownBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    dropdown.classList.toggle('hidden');
                });

                document.addEventListener('click', function(e) {
                    if (!dropdown.contains(e.target) && !dropdownBtn.contains(e.target)) {
                        dropdown.classList.add('hidden');
                    }
                });
            }
        });
    </script>