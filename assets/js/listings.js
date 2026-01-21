// Load all listings for the list page
let currentPage = 1;
const pageSize = 50;

async function loadListings(page = 1) {
  try {
    currentPage = page;
    const response = await api(`/?resource=listings&page=${page}`);
    const data = response.data || [];
    const pagination = response.pagination || {};
    const tbody = document.getElementById("listingsTable");
    const paginationContainer = document.getElementById("listingsPagination");

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-4 text-center text-gray-500">No listings found</td>
        </tr>
      `;
      if (paginationContainer) paginationContainer.innerHTML = "";
      return;
    }

    tbody.innerHTML = data
      .map(
        (l) => `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${escapeHtml(l.title || "")}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500">${escapeHtml(l.location?.name || "")}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-semibold text-gray-900">${formatPrice(l.price || 0)}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              l.status === "available"
                ? "bg-blue-100 text-blue-800"
                : l.status === "sold"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-yellow-100 text-yellow-800"
            }">
              ${escapeHtml(l.status || "")}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <a href="&page=listings&action=view&id=${l.id}" class="text-blue-600 hover:text-blue-800 mr-3 transition-colors">View</a>
            <a href="&page=listings&action=edit&id=${l.id}" class="text-blue-600 hover:text-blue-800 transition-colors">Edit</a>
          </td>
        </tr>
      `,
      )
      .join("");

    // Render pagination - always show if we have pagination data
    if (paginationContainer && pagination.total && pagination.total > 0) {
      renderPagination(paginationContainer, pagination, loadListings);
    } else if (paginationContainer) {
      paginationContainer.innerHTML = "";
    }
  } catch (error) {
    console.error("Error loading listings:", error);
    const tbody = document.getElementById("listingsTable");
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-4 text-center text-red-500">Error loading listings</td>
      </tr>
    `;
  }
}

// Load single listing details for view page
async function loadListingDetails(id) {
  try {
    const data = await api(`/?resource=listings/${id}`);
    const container = document.getElementById("listingDetails");

    container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-3">${escapeHtml(data.title || "")}</h2>
          <p class="text-gray-600 leading-relaxed">${escapeHtml(data.description || "No description")}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          <div>
            <span class="text-sm font-medium text-gray-500 block mb-1">Price</span>
            <p class="text-xl font-semibold text-gray-900">$${formatPrice(data.price || 0)}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500 block mb-1">Status</span>
            <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              data.status === "available"
                ? "bg-blue-100 text-blue-800"
                : data.status === "sold"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-yellow-100 text-yellow-800"
            }">
              ${escapeHtml(data.status || "")}
            </span>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500 block mb-1">Location</span>
            <p class="text-gray-900">${escapeHtml(data.location?.name || "")}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500 block mb-1">Agent</span>
            <p class="text-gray-900">${escapeHtml(
              data.agent
                ? [data.agent.name, data.agent.last_name]
                    .filter(Boolean)
                    .join(" ")
                : "",
            )}</p>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-500 block mb-1">Owner</span>
            <p class="text-gray-900">${escapeHtml(
              data.owner
                ? [data.owner.name, data.owner.last_name]
                    .filter(Boolean)
                    .join(" ")
                : "",
            )}</p>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error loading listing details:", error);
    const container = document.getElementById("listingDetails");
    container.innerHTML = `
      <div class="text-red-600">
        <p>Error loading listing details. Please try again.</p>
      </div>
    `;
  }
}

// Load form options (locations, agents, owners) for create/edit forms
async function loadFormOptions() {
  try {
    const [locationsRes, agentsRes, ownersRes] = await Promise.all([
      api("/locations").catch(() => ({ data: [] })),
      api("/agents").catch(() => ({ data: [] })),
      api("/owners").catch(() => ({ data: [] })),
    ]);

    // Handle both old format (array) and new format (object with data property)
    const locations = Array.isArray(locationsRes)
      ? locationsRes
      : locationsRes.data || [];
    const agents = Array.isArray(agentsRes) ? agentsRes : agentsRes.data || [];
    const owners = Array.isArray(ownersRes) ? ownersRes : ownersRes.data || [];

    // Populate location select
    const locationSelect = document.getElementById("locationSelect");
    if (locationSelect) {
      locationSelect.innerHTML =
        '<option value="">Select Location</option>' +
        locations
          .map(
            (loc) =>
              `<option value="${loc.id}">${escapeHtml(loc.name || "")}</option>`,
          )
          .join("");
    }

    // Populate agent select
    const agentSelect = document.getElementById("agentSelect");
    if (agentSelect) {
      agentSelect.innerHTML =
        '<option value="">Select Agent</option>' +
        agents
          .map((agent) => {
            const fullName =
              [agent.name, agent.last_name].filter(Boolean).join(" ") || "";
            return `<option value="${agent.id}">${escapeHtml(fullName)}</option>`;
          })
          .join("");
    }

    // Populate owner select
    const ownerSelect = document.getElementById("ownerSelect");
    if (ownerSelect) {
      ownerSelect.innerHTML =
        '<option value="">Select Owner</option>' +
        owners
          .map((owner) => {
            const fullName =
              [owner.name, owner.last_name].filter(Boolean).join(" ") || "";
            return `<option value="${owner.id}">${escapeHtml(fullName)}</option>`;
          })
          .join("");
    }
  } catch (error) {
    console.error("Error loading form options:", error);
  }
}

// Load listing data for edit form
async function loadListingForEdit(id) {
  try {
    const data = await api(`/?resource=listings/${id}`);

    document.getElementById("title").value = data.title || "";
    document.getElementById("description").value = data.description || "";
    document.getElementById("price").value = data.price || "";
    document.getElementById("status").value = data.status || "available";

    if (data.location_id) {
      document.getElementById("locationSelect").value = data.location_id;
    }
    if (data.agent_id) {
      document.getElementById("agentSelect").value = data.agent_id;
    }
    if (data.owner_id) {
      document.getElementById("ownerSelect").value = data.owner_id;
    }
  } catch (error) {
    console.error("Error loading listing for edit:", error);
    alert("Error loading listing data. Please refresh the page.");
  }
}

// Setup create form handler
function setupCreateForm() {
  const form = document.getElementById("createListingForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Convert string values to appropriate types
    data.price = parseFloat(data.price);
    data.location_id = parseInt(data.location_id);
    data.agent_id = parseInt(data.agent_id);
    data.owner_id = parseInt(data.owner_id);

    try {
      await api("/listings", {
        method: "POST",
        body: JSON.stringify(data),
      });

      alert("Listing created successfully!");
      window.location.href = "&page=listings&action=list";
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Error creating listing. Please try again.");
    }
  });
}

// Setup edit form handler
function setupEditForm(id) {
  const form = document.getElementById("editListingForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Convert string values to appropriate types
    data.price = parseFloat(data.price);
    data.location_id = parseInt(data.location_id);
    data.agent_id = parseInt(data.agent_id);
    data.owner_id = parseInt(data.owner_id);

    try {
      await api(`/?resource=listings/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      alert("Listing updated successfully!");
      window.location.href = "&page=listings&action=list";
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("Error updating listing. Please try again.");
    }
  });
}

// Helper functions
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
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
