let currentEditingId = null;
let currentPage = 1;
let lastSyncTimestamp = null;

// Load all locations
async function loadLocations(page = 1) {
  try {
    currentPage = page;
    const response = await api(`/?resource=locations&page=${page}`);
    // Handle both old format (array) and new format (object with data property)
    const data = Array.isArray(response) ? response : response.data || [];
    const pagination = response.pagination || {};
    const tbody = document.getElementById("locationsList");
    const paginationContainer = document.getElementById("locationsPagination");

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="px-6 py-8 text-center text-gray-500">
            <div class="flex flex-col items-center justify-center">
              <i class="fa-solid fa-location-dot text-3xl text-gray-300 mb-2"></i>
              <p class="text-sm font-medium text-gray-600">No locations found</p>
              <p class="text-xs text-gray-400 mt-0.5">Click "Sync Locations" or "Add Location" to get started.</p>
            </div>
          </td>
        </tr>
      `;
      if (paginationContainer) paginationContainer.innerHTML = "";
      return;
    }

    tbody.innerHTML = data
      .map(
        (loc) => `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
            ${escapeHtml(loc.location_id || "-")}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${escapeHtml(loc.name || "")}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button onclick="editLocation(${loc.id})" class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded hover:bg-blue-50">
              <i class="fa-solid fa-pen-to-square text-xs"></i>
              <span>Edit</span>
            </button>
          </td>
        </tr>
      `,
      )
      .join("");

    // Render pagination
    if (paginationContainer && pagination.total && pagination.total > 0) {
      renderPagination(paginationContainer, pagination, loadLocations);
    } else if (paginationContainer) {
      paginationContainer.innerHTML = "";
    }
  } catch (error) {
    console.error("Error loading locations:", error);
    const tbody = document.getElementById("locationsList");
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="px-6 py-4 text-center text-red-500">Error loading locations. Please try again.</td>
      </tr>
    `;
  }
}

// Load last sync time from locations SPA 1056
async function loadLastSyncTime() {
  const badge = document.getElementById("lastSyncBadge");
  const badgeText = document.getElementById("lastSyncBadgeText");
  const modalText = document.getElementById("modalLastSyncText");

  try {
    const res = await api("/?resource=locations&action=last-sync");
    if (res && res.success && res.last_sync_time) {
      lastSyncTimestamp = res.last_sync_time;
      const formatted = formatDateTime(res.last_sync_time);
      const relative = formatRelativeTime(res.last_sync_time);
      const portalNames = { pf: "PF", bayut: "Bayut", both: "PF & Bayut" };
      const pText = res.portal && portalNames[res.portal] ? ` · ${portalNames[res.portal]}` : "";
      const cityTag = res.city ? ` (${res.city}${pText})` : (pText ? ` (${pText.trim()})` : "");

      const displayStr = relative ? `${formatted} (${relative})${cityTag}` : `${formatted}${cityTag}`;

      if (badgeText) badgeText.textContent = `Last Synced: ${displayStr}`;
      if (modalText) modalText.textContent = displayStr;
      if (badge) badge.classList.remove("hidden");
    } else {
      if (badgeText) badgeText.textContent = "Last Synced: Never";
      if (modalText) modalText.textContent = "No previous sync record found";
      if (badge) badge.classList.remove("hidden");
    }
  } catch (err) {
    console.warn("Could not load last sync time:", err);
    if (modalText) modalText.textContent = "Unable to fetch sync time";
  }
}

// Portal selection toggler (PF, Bayut, or Both)
function onSyncPortalChange(selectedVal) {
  const portalBoth = document.getElementById("portalOptionBoth");
  const portalPf = document.getElementById("portalOptionPf");
  const portalBayut = document.getElementById("portalOptionBayut");
  const bayutCard = document.getElementById("bayutFiltersCard");

  const options = [
    { el: portalBoth, val: "both", activeBorder: "border-blue-600", activeBg: "bg-blue-50/60", titleClass: "text-blue-900" },
    { el: portalPf, val: "pf", activeBorder: "border-red-500", activeBg: "bg-red-50/50", titleClass: "text-red-900" },
    { el: portalBayut, val: "bayut", activeBorder: "border-green-600", activeBg: "bg-green-50/50", titleClass: "text-green-900" },
  ];

  options.forEach(({ el, val, activeBorder, activeBg, titleClass }) => {
    if (!el) return;
    const titleSpan = el.querySelector("span:not(.text-\\[10px\\])");
    if (val === selectedVal) {
      el.className = `relative flex flex-col items-center justify-center p-3 border-2 ${activeBorder} ${activeBg} rounded-xl cursor-pointer transition-all text-center shadow-xs`;
      if (titleSpan) titleSpan.className = `text-xs font-bold ${titleClass}`;
    } else {
      el.className = `relative flex flex-col items-center justify-center p-3 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl cursor-pointer transition-all text-center`;
      if (titleSpan) titleSpan.className = `text-xs font-semibold text-gray-800`;
    }
  });

  if (bayutCard) {
    if (selectedVal === "pf") {
      bayutCard.classList.add("hidden");
    } else {
      bayutCard.classList.remove("hidden");
    }
  }
}

// Sync Locations Modal Controls
function openSyncLocationsModal() {
  const modal = document.getElementById("syncLocationsModal");
  if (!modal) return;

  loadLastSyncTime();

  const checkedRadio = document.querySelector('input[name="syncPortal"]:checked');
  onSyncPortalChange(checkedRadio ? checkedRadio.value : "both");

  modal.classList.remove("hidden");
  modal.style.display = "flex";
}

let isLocationSyncing = false;

function closeSyncLocationsModal() {
  if (isLocationSyncing) {
    alert("Location sync is in progress. This will take some time to complete, please don't refresh or close the page while loading.");
    return;
  }
  const modal = document.getElementById("syncLocationsModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.style.display = "none";
}

// Initialize Sync Locations Form handler
function initSyncLocationsModal() {
  const form = document.getElementById("syncLocationsForm");
  const modal = document.getElementById("syncLocationsModal");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const city = document.getElementById("syncCitySelect").value.trim();
      const community = document.getElementById("syncCommunity").value.trim();
      const subcommunity = document.getElementById("syncSubcommunity").value.trim();
      const building = document.getElementById("syncBuilding").value.trim();

      const portalRadio = document.querySelector('input[name="syncPortal"]:checked');
      const portal = portalRadio ? portalRadio.value : "both";
      const portalLabels = { both: "PF & Bayut", pf: "Property Finder", bayut: "Bayut" };
      const portalName = portalLabels[portal] || "Portals";

      if (!city) {
        alert("Please select a city to synchronize.");
        return;
      }

      const btn = document.getElementById("startSyncBtn");
      const btnText = document.getElementById("startSyncBtnText");
      const closeBtn = document.getElementById("closeSyncModalBtn");
      const loadingNotice = document.getElementById("syncLoadingNotice");
      const originalText = btnText.textContent;
      const formControls = form.querySelectorAll("input, select, button");

      // Warn user if they attempt to refresh or close while sync is running
      const unloadHandler = (event) => {
        event.preventDefault();
        event.returnValue = "Location sync is in progress. This location sync will take some time to be completed, please don't refresh the page while loading.";
        return event.returnValue;
      };

      try {
        isLocationSyncing = true;
        formControls.forEach((el) => (el.disabled = true));
        if (closeBtn) closeBtn.disabled = true;
        if (loadingNotice) loadingNotice.classList.remove("hidden");

        btnText.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Syncing ${portalName}...`;
        showStatusAlert("info", `Syncing ${portalName} locations for ${city}... This location sync will take some time to be completed, please don't refresh the page while loading.`);
        window.addEventListener("beforeunload", unloadHandler);

        const res = await api("/?resource=locations&action=sync", {
          method: "POST",
          body: {
            city: city,
            portal: portal,
            community: portal !== "pf" ? community : "",
            subcommunity: portal !== "pf" ? subcommunity : "",
            building: portal !== "pf" ? building : "",
          },
        });

        isLocationSyncing = false;
        closeSyncLocationsModal();

        if (res && res.success) {
          showStatusAlert("success", res.message || `Locations for ${city} synchronized successfully!`);
          if (res.last_sync_time) {
            lastSyncTimestamp = res.last_sync_time;
            const formatted = formatDateTime(res.last_sync_time);
            const relative = formatRelativeTime(res.last_sync_time);
            const portalNames = { pf: "PF", bayut: "Bayut", both: "PF & Bayut" };
            const pText = (res.portal || portal) && portalNames[res.portal || portal] ? ` · ${portalNames[res.portal || portal]}` : "";
            const cityTag = (res.city || city) ? ` (${res.city || city}${pText})` : (pText ? ` (${pText.trim()})` : "");
            const displayStr = relative ? `${formatted} (${relative})${cityTag}` : `${formatted}${cityTag}`;
            const badgeText = document.getElementById("lastSyncBadgeText");
            if (badgeText) badgeText.textContent = `Last Synced: ${displayStr}`;
          } else {
            loadLastSyncTime();
          }
          loadLocations(currentPage);
        } else {
          showStatusAlert("warning", (res && res.error) || "Sync completed with warnings.");
        }
      } catch (err) {
        console.error("Location sync error:", err);
        const errMsg = err.error || err.message || "Failed to sync locations.";
        showStatusAlert("error", `Location sync failed: ${errMsg}`);
      } finally {
        isLocationSyncing = false;
        window.removeEventListener("beforeunload", unloadHandler);
        formControls.forEach((el) => (el.disabled = false));
        if (closeBtn) closeBtn.disabled = false;
        if (loadingNotice) loadingNotice.classList.add("hidden");
        btnText.textContent = originalText;
      }
    });
  }

  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeSyncLocationsModal();
      }
    });
  }
}

// Open modal for adding new location
function openLocationModal() {
  currentEditingId = null;
  document.getElementById("modalTitle").textContent = "Add Location";
  document.getElementById("locationForm").reset();
  document.getElementById("locationId").value = "";
  const modal = document.getElementById("locationModal");
  modal.classList.remove("hidden");
  modal.style.display = "flex";
}

// Open modal for editing location
async function editLocation(id) {
  try {
    currentEditingId = id;
    const data = await api(`/?resource=locations&id=${id}`);

    document.getElementById("modalTitle").textContent = "Edit Location";
    document.getElementById("locationId").value = data.id || "";
    document.getElementById("locationName").value = data.name || "";
    document.getElementById("locationPfId").value = data.location_id || "";

    const modal = document.getElementById("locationModal");
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  } catch (error) {
    console.error("Error loading location:", error);
    alert("Error loading location data. Please try again.");
  }
}

// Close modal
function closeLocationModal() {
  const modal = document.getElementById("locationModal");
  modal.classList.add("hidden");
  modal.style.display = "none";
  currentEditingId = null;
  document.getElementById("locationForm").reset();
}

// Setup form handler for manual location add/edit
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("locationForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      const id = data.id;

      try {
        if (id) {
          // Update existing location
          await api(`/?resource=locations&id=${id}`, {
            method: "PUT",
            body: {
              name: data.name,
              location_id: data.pf_id,
            },
          });
          showStatusAlert("success", "Location updated successfully!");
        } else {
          // Create new location
          await api("/?resource=locations", {
            method: "POST",
            body: {
              name: data.name,
              location_id: data.pf_id,
            },
          });
          showStatusAlert("success", "Location created successfully!");
        }

        closeLocationModal();
        loadLocations(currentPage);
      } catch (error) {
        console.error("Error saving location:", error);
        alert("Error saving location. Please try again.");
      }
    });
  }

  // Close modal when clicking outside
  const modal = document.getElementById("locationModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeLocationModal();
      }
    });
  }
});

// Alert banner helper
function showStatusAlert(type, message) {
  const alert = document.getElementById("statusAlert");
  const icon = document.getElementById("statusAlertIcon");
  const msg = document.getElementById("statusAlertMessage");

  if (!alert || !icon || !msg) return;

  alert.className = "mb-6 rounded-lg p-4 transition-all duration-300 border block";

  if (type === "success") {
    alert.classList.add("bg-emerald-50", "border-emerald-200", "text-emerald-800");
    icon.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>`;
  } else if (type === "info") {
    alert.classList.add("bg-blue-50", "border-blue-200", "text-blue-800");
    icon.innerHTML = `<i class="fa-solid fa-circle-info text-blue-600 text-lg"></i>`;
  } else if (type === "warning") {
    alert.classList.add("bg-amber-50", "border-amber-200", "text-amber-800");
    icon.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber-600 text-lg"></i>`;
  } else {
    alert.classList.add("bg-red-50", "border-red-200", "text-red-800");
    icon.innerHTML = `<i class="fa-solid fa-circle-exclamation text-red-600 text-lg"></i>`;
  }

  msg.textContent = message;
  alert.classList.remove("hidden");

  // Auto hide success/info after 6 seconds
  if (type === "success" || type === "info") {
    setTimeout(() => {
      hideStatusAlert();
    }, 6000);
  }
}

function hideStatusAlert() {
  const alert = document.getElementById("statusAlert");
  if (alert) alert.classList.add("hidden");
}

// Date and Relative Time helpers
function formatDateTime(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return isoString;
  }
}

function formatRelativeTime(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    return "";
  } catch (e) {
    return "";
  }
}

// Helper function
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Pagination helper
function renderPagination(container, pagination, loadFunction) {
  const { page = 1, total_pages = 1, total = 0, limit = 50 } = pagination;

  if (total <= 0) {
    container.innerHTML = "";
    return;
  }

  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(total_pages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(total_pages, page + 1);

  let html = `
    <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6" data-pagination-container>
      <div class="flex flex-1 justify-between sm:hidden">
        <button data-page="${prevPage}" 
                ${page <= 1 ? "disabled" : ""}
                class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        <button data-page="${nextPage}" 
                ${page >= total_pages ? "disabled" : ""}
                class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing <span class="font-medium">${(page - 1) * limit + 1}</span>
            to <span class="font-medium">${Math.min(page * limit, total)}</span>
            of <span class="font-medium">${total}</span> results
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button data-page="${prevPage}" 
                    ${page <= 1 ? "disabled" : ""}
                    class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
              </svg>
            </button>
  `;

  for (let i = startPage; i <= endPage; i++) {
    html += `
      <button data-page="${i}" 
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                i === page
                  ? "z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              }">
        ${i}
      </button>
    `;
  }

  html += `
            <button data-page="${nextPage}" 
                    ${page >= total_pages ? "disabled" : ""}
                    class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  container.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const targetPage = parseInt(button.getAttribute("data-page"));
      if (targetPage && !button.disabled) {
        loadFunction(targetPage);
      }
    });
  });
}
