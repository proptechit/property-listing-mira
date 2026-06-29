let currentEditingId = null;
let currentPage = 1;

// Load all developers
async function loadDevelopers(page = 1) {
  try {
    currentPage = page;
    const response = await api(`/?resource=developers&page=${page}`);
    const data = Array.isArray(response) ? response : response.data || [];
    const pagination = response.pagination || {};
    const tbody = document.getElementById("developersList");
    const paginationContainer = document.getElementById("developersPagination");

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="px-6 py-4 text-center text-gray-500">No developers found</td>
        </tr>
      `;
      if (paginationContainer) paginationContainer.innerHTML = "";
      return;
    }

    tbody.innerHTML = data
      .map(
        (dev) => `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${escapeHtml(dev.id || "")}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${escapeHtml(dev.name || "")}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-4">
            <button onclick="editDeveloper(${dev.id})" class="text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
            <button onclick="deleteDeveloper(${dev.id}, '${escapeHtml(dev.name || "").replace(/'/g, "\\'")}')" class="text-red-600 hover:text-red-800 transition-colors">Delete</button>
          </td>
        </tr>
      `,
      )
      .join("");

    // Render pagination
    if (paginationContainer && pagination.total && pagination.total > 0) {
      renderPagination(paginationContainer, pagination, loadDevelopers);
    } else if (paginationContainer) {
      paginationContainer.innerHTML = "";
    }
  } catch (error) {
    console.error("Error loading developers:", error);
    const tbody = document.getElementById("developersList");
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="px-6 py-4 text-center text-red-500">Error loading developers</td>
      </tr>
    `;
  }
}

// Open modal for adding new developer
function openDeveloperModal() {
  currentEditingId = null;
  document.getElementById("modalTitle").textContent = "Add Developer";
  document.getElementById("developerForm").reset();
  document.getElementById("developerId").value = "";
  const modal = document.getElementById("developerModal");
  modal.classList.remove("hidden");
  modal.style.display = "flex";
  modal.classList.add("items-center", "justify-center");
}

// Open modal for editing developer
async function editDeveloper(id) {
  try {
    currentEditingId = id;
    const data = await api(`/?resource=developers&id=${id}`);

    document.getElementById("modalTitle").textContent = "Edit Developer";
    document.getElementById("developerId").value = data.id || "";
    document.getElementById("developerName").value = data.name || "";

    const modal = document.getElementById("developerModal");
    modal.classList.remove("hidden");
    modal.style.display = "flex";
    modal.classList.add("items-center", "justify-center");
  } catch (error) {
    console.error("Error loading developer:", error);
    alert("Error loading developer data. Please try again.");
  }
}

// Delete developer
async function deleteDeveloper(id, name) {
  if (!confirm(`Are you sure you want to delete developer "${name}"?`)) {
    return;
  }

  try {
    await api(`/?resource=developers&id=${id}`, {
      method: "DELETE",
    });
    alert("Developer deleted successfully!");
    loadDevelopers(currentPage);
  } catch (error) {
    console.error("Error deleting developer:", error);
    alert("Error deleting developer. Please try again.");
  }
}

// Close modal
function closeDeveloperModal() {
  const modal = document.getElementById("developerModal");
  modal.classList.add("hidden");
  modal.style.display = "none";
  modal.classList.remove("items-center", "justify-center");
  currentEditingId = null;
  document.getElementById("developerForm").reset();
}

// Setup form handler
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("developerForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      const id = data.id;

      try {
        if (id) {
          // Update existing developer
          await api(`/?resource=developers&id=${id}`, {
            method: "PUT",
            body: JSON.stringify({
              name: data.name,
            }),
          });
          alert("Developer updated successfully!");
        } else {
          // Create new developer
          await api("/?resource=developers", {
            method: "POST",
            body: JSON.stringify({
              name: data.name,
            }),
          });
          alert("Developer created successfully!");
        }

        closeDeveloperModal();
        loadDevelopers(currentPage);
      } catch (error) {
        console.error("Error saving developer:", error);
        alert("Error saving developer. Please try again.");
      }
    });
  }

  // Close modal when clicking outside
  const modal = document.getElementById("developerModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeDeveloperModal();
      }
    });
  }
});

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
