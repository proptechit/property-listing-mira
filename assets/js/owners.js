// Load all owners
let currentPage = 1;
const pageSize = 50;

async function loadOwners(page = 1) {
  try {
    currentPage = page;
    const response = await api(`/?resource=owners?page=${page}`);
    const data = response.data || [];
    const pagination = response.pagination || {};
    const tbody = document.getElementById("ownersList");
    const paginationContainer = document.getElementById("ownersPagination");

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-4 text-center text-gray-500">No owners found</td>
        </tr>
      `;
      if (paginationContainer) paginationContainer.innerHTML = "";
      return;
    }

    tbody.innerHTML = data
      .map((owner) => {
        const fullName =
          [owner.name, owner.last_name].filter(Boolean).join(" ") || "";
        const initials =
          fullName !== ""
            ? fullName
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")
                .toUpperCase()
                .substring(0, 2)
            : "O";
        // Handle photo URL - could be full URL, relative path, or file ID
        let photoUrl = null;
        if (owner.photo) {
          if (
            owner.photo.startsWith("http://") ||
            owner.photo.startsWith("https://")
          ) {
            photoUrl = owner.photo;
          } else if (owner.photo.startsWith("/")) {
            photoUrl = owner.photo;
          } else if (!isNaN(owner.photo)) {
            // If it's a numeric ID, might need to construct URL (adjust based on your Bitrix setup)
            photoUrl = null; // Will fall back to initials
          } else {
            photoUrl = owner.photo;
          }
        }

        return `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="h-10 w-10 flex-shrink-0">
                ${
                  photoUrl
                    ? `<img class="h-10 w-10 rounded-full object-cover" src="${escapeHtml(photoUrl)}" alt="${escapeHtml(fullName)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                    : ""
                }
                <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ${photoUrl ? "hidden" : ""}">
                  <span class="text-gray-500 text-sm font-medium">${initials}</span>
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">${escapeHtml(fullName)}</div>
                ${owner.position ? `<div class="text-sm text-gray-500">${escapeHtml(owner.position)}</div>` : ""}
              </div>
            </div>
          </td>

          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <a class="text-blue-500 hover:text-blue-400 transition-colors" href="mailto:${escapeHtml(owner.email)}">${escapeHtml(owner.email || "")}</a>
          </td>

          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <a class="text-blue-500 hover:text-blue-400 transition-colors" href="tel:${escapeHtml(owner.phone)}">${escapeHtml(owner.phone || "")}</a>
          </td>
        `;
      })
      .join("");

    // Render pagination - always show if we have pagination data
    if (paginationContainer && pagination.total && pagination.total > 0) {
      renderPagination(paginationContainer, pagination, loadOwners);
    } else if (paginationContainer) {
      paginationContainer.innerHTML = "";
    }
  } catch (error) {
    console.error("Error loading owners:", error);
    const tbody = document.getElementById("ownersList");
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-4 text-center text-red-500">Error loading owners</td>
      </tr>
    `;
  }
}

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
