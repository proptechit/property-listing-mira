let currentEditingId = null;
let currentPage = 1;

// Load all locations
async function loadLocations(page = 1) {
  try {
    currentPage = page;
    const response = await api(`/?resource=locations?page=${page}`);
    // Handle both old format (array) and new format (object with data property)
    const data = Array.isArray(response) ? response : response.data || [];
    const pagination = response.pagination || {};
    const tbody = document.getElementById("locationsList");
    const paginationContainer = document.getElementById("locationsPagination");

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="2" class="px-6 py-4 text-center text-gray-500">No locations found</td>
        </tr>
      `;
      if (paginationContainer) paginationContainer.innerHTML = "";
      return;
    }

    tbody.innerHTML = data
      .map(
        (loc) => `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${escapeHtml(loc.name || "")}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button onclick="editLocation(${loc.id})" class="text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
          </td>
        </tr>
      `,
      )
      .join("");

    // Render pagination - always show if we have pagination data
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
        <td colspan="2" class="px-6 py-4 text-center text-red-500">Error loading locations</td>
      </tr>
    `;
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
  modal.classList.add("items-center", "justify-center");
}

// Open modal for editing location
async function editLocation(id) {
  try {
    currentEditingId = id;
    const data = await api(`/?resource=locations/${id}`);

    document.getElementById("modalTitle").textContent = "Edit Location";
    document.getElementById("locationId").value = data.id || "";
    document.getElementById("locationName").value = data.name || "";

    const modal = document.getElementById("locationModal");
    modal.classList.remove("hidden");
    modal.style.display = "flex";
    modal.classList.add("items-center", "justify-center");
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
  modal.classList.remove("items-center", "justify-center");
  currentEditingId = null;
  document.getElementById("locationForm").reset();
}

// Setup form handler
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
          await api(`/?resource=locations/${id}`, {
            method: "PUT",
            body: JSON.stringify({
              name: data.name,
              city: data.city,
              state: data.state,
              country: data.country,
            }),
          });
          alert("Location updated successfully!");
        } else {
          // Create new location
          await api("/locations", {
            method: "POST",
            body: JSON.stringify({
              name: data.name,
              city: data.city,
              state: data.state,
              country: data.country,
            }),
          });
          alert("Location created successfully!");
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

// Helper function
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Pagination helper
function renderPagination(container, pagination, loadFunction) {
  const { page = 1, total_pages = 1, total = 0, limit = 50 } = pagination;

  // Always show pagination if we have items
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

  // Add event listeners to pagination buttons
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
