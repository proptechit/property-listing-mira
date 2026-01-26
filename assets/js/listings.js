let currentPage = 1;
const pageSize = 50;

const state = {
  searchTerm: "",
  filters: {
    reference: "",
    title: "",
    minPrice: "",
    maxPrice: "",
    location: "",
    status: "",
    type: "",
    bedrooms: "",
    bathrooms: "",
    minSize: "",
    maxSize: "",
  },
};

let searchTimer;

function qs(el) {
  return document.querySelector(el);
}

function qsa(el) {
  return document.querySelectorAll(el);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price || 0));
}

function toNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normStr(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

function buildQueryParams(page, searchTerm, filters) {
  const params = new URLSearchParams();
  params.set("resource", "listings");
  params.set("page", String(page));
  params.set("limit", String(pageSize));

  if (searchTerm && searchTerm.trim()) params.set("search", searchTerm.trim());

  const map = {
    reference: "reference",
    title: "title",
    minPrice: "min_price",
    maxPrice: "max_price",
    location: "location",
    status: "status",
    type: "property_type",
    bedrooms: "bedrooms_min",
    bathrooms: "bathrooms_min",
    minSize: "min_size",
    maxSize: "max_size",
  };

  Object.keys(map).forEach((k) => {
    const v = filters?.[k];
    if (v !== null && v !== undefined && String(v).trim() !== "") {
      params.set(map[k], String(v).trim());
    }
  });

  return params.toString();
}

function matchesSearchAndFiltersLocal(listing, searchTerm, filters) {
  const s = normStr(searchTerm);
  const ref = normStr(listing?.reference);
  const title = normStr(listing?.title);
  const location = normStr(listing?.location?.name || listing?.location);
  const status = normStr(listing?.status);
  const type = normStr(listing?.property_type_pf || listing?.property_type);
  const bedrooms = toNum(listing?.bedrooms);
  const bathrooms = toNum(listing?.bathrooms);
  const size = toNum(listing?.size);
  const price = toNum(listing?.price);

  if (s) {
    const hay = [
      ref,
      title,
      location,
      status,
      type,
      String(price ?? ""),
      String(size ?? ""),
      String(bedrooms ?? ""),
      String(bathrooms ?? ""),
    ].join(" ");
    if (!hay.includes(s)) return false;
  }

  const f = filters || {};

  if (f.reference && !ref.includes(normStr(f.reference))) return false;
  if (f.title && !title.includes(normStr(f.title))) return false;
  if (f.location && !location.includes(normStr(f.location))) return false;

  if (f.status && normStr(f.status) !== status) return false;

  if (f.type && !type.includes(normStr(f.type))) return false;

  const minP = toNum(f.minPrice);
  const maxP = toNum(f.maxPrice);
  if (minP !== null && (price === null || price < minP)) return false;
  if (maxP !== null && (price === null || price > maxP)) return false;

  const minB = toNum(f.bedrooms);
  const minBa = toNum(f.bathrooms);
  if (minB !== null && (bedrooms === null || bedrooms < minB)) return false;
  if (minBa !== null && (bathrooms === null || bathrooms < minBa)) return false;

  const minS = toNum(f.minSize);
  const maxS = toNum(f.maxSize);
  if (minS !== null && (size === null || size < minS)) return false;
  if (maxS !== null && (size === null || size > maxS)) return false;

  return true;
}

function getActiveChips(filters, searchTerm) {
  const chips = [];
  const push = (key, label, value) => {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      chips.push({ key, label, value: String(value).trim() });
    }
  };

  push("searchTerm", "Search", searchTerm);

  push("reference", "Ref", filters.reference);
  push("title", "Title", filters.title);
  push("location", "Location", filters.location);
  push("status", "Status", filters.status);
  push("type", "Type", filters.type);

  push("minPrice", "Min Price", filters.minPrice);
  push("maxPrice", "Max Price", filters.maxPrice);

  push("bedrooms", "Bedrooms ≥", filters.bedrooms);
  push("bathrooms", "Bathrooms ≥", filters.bathrooms);

  push("minSize", "Min Size", filters.minSize);
  push("maxSize", "Max Size", filters.maxSize);

  return chips;
}

function renderChips() {
  const activeChips = qs("#activeChips");
  const chipsWrap = qs("#chipsWrap");
  if (!activeChips || !chipsWrap) return;

  const chips = getActiveChips(state.filters, state.searchTerm);

  if (!chips.length) {
    activeChips.classList.add("hidden");
    chipsWrap.innerHTML = "";
    return;
  }

  activeChips.classList.remove("hidden");

  chipsWrap.innerHTML = chips
    .map(
      (c) => `
    <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      <span>${escapeHtml(c.label)}: ${escapeHtml(c.value)}</span>
      <button type="button" class="text-slate-500 hover:text-slate-800" data-chip-remove="${escapeHtml(c.key)}">✕</button>
    </span>
  `,
    )
    .join("");

  chipsWrap.querySelectorAll("[data-chip-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-chip-remove");
      if (key === "searchTerm") {
        state.searchTerm = "";
        const searchInput = qs("#searchInput");
        if (searchInput) searchInput.value = "";
      } else if (key in state.filters) {
        state.filters[key] = "";
        syncFiltersToUI();
      }
      renderChips();
      loadListings(1, state.searchTerm, state.filters);
    });
  });
}

function syncFiltersToUI() {
  const set = (id, val) => {
    const el = qs(id);
    if (el) el.value = val ?? "";
  };

  set("#f_reference", state.filters.reference);
  set("#f_title", state.filters.title);
  set("#f_minPrice", state.filters.minPrice);
  set("#f_maxPrice", state.filters.maxPrice);
  set("#f_location", state.filters.location);
  set("#f_status", state.filters.status);
  set("#f_type", state.filters.type);
  set("#f_bedrooms", state.filters.bedrooms);
  set("#f_bathrooms", state.filters.bathrooms);
  set("#f_minSize", state.filters.minSize);
  set("#f_maxSize", state.filters.maxSize);
}

function readFiltersFromUI() {
  const get = (id) => (qs(id)?.value ?? "").trim();

  return {
    reference: get("#f_reference"),
    title: get("#f_title"),
    minPrice: get("#f_minPrice"),
    maxPrice: get("#f_maxPrice"),
    location: get("#f_location"),
    status: get("#f_status"),
    type: get("#f_type"),
    bedrooms: get("#f_bedrooms"),
    bathrooms: get("#f_bathrooms"),
    minSize: get("#f_minSize"),
    maxSize: get("#f_maxSize"),
  };
}

function openFiltersDrawer() {
  const drawer = qs("#filtersDrawer");
  if (!drawer) return;
  drawer.classList.remove("hidden");
  drawer.setAttribute("aria-hidden", "false");
  syncFiltersToUI();
}

function closeFiltersDrawer() {
  const drawer = qs("#filtersDrawer");
  if (!drawer) return;
  drawer.classList.add("hidden");
  drawer.setAttribute("aria-hidden", "true");
}

async function loadListings(page = 1, searchTerm = "", filters = {}) {
  try {
    currentPage = page;

    const tbody = qs("#listingsTable");
    const paginationContainer = qs("#listingsPagination");

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-4 text-center text-gray-500">Loading...</td>
        </tr>
      `;
    }

    const query = buildQueryParams(page, searchTerm, filters);

    let response;
    try {
      response = await api(`/?${query}`);
    } catch (_) {
      response = await api(
        `/?resource=listings&page=${page}&limit=${pageSize}`,
      );
    }

    let data = response?.data || [];
    const pagination = response?.pagination || {};

    if (!Array.isArray(data)) data = [];

    const apiDoesNotSupportFilters =
      query.includes("min_price") ||
      query.includes("max_price") ||
      query.includes("bedrooms_min") ||
      query.includes("bathrooms_min") ||
      query.includes("min_size") ||
      query.includes("max_size") ||
      query.includes("status") ||
      query.includes("property_type") ||
      query.includes("reference") ||
      query.includes("title") ||
      query.includes("location") ||
      query.includes("search");

    if (apiDoesNotSupportFilters) {
      data = data.filter((l) =>
        matchesSearchAndFiltersLocal(l, searchTerm, filters),
      );
    }

    if (!data.length) {
      if (tbody) {
        tbody.innerHTML = `
          <tr class="hover:bg-blue-50/30 transition-colors group cursor-pointer">
            <td colspan="7" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center justify-center">
                <i class="fa-solid fa-magnifying-glass text-slate-300 text-4xl mb-4"></i>
                <p class="text-gray-500 font-medium">No properties match "${escapeHtml(searchTerm)}"</p>
                <p class="text-gray-400 text-sm">Try adjusting your keywords or filters</p>
              </div>
            </td>
          </tr>
        `;
      }
      if (paginationContainer) paginationContainer.innerHTML = "";
      renderChips();
      return;
    }

    if (tbody) {
      tbody.innerHTML = data
        .map(
          (l) => `
        <tr class="hover:bg-blue-50/30 transition-colors group cursor-pointer">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center gap-4">
              <div class="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                <img
                  class="h-24 w-24 rounded-md object-cover bg-gray-100"
                  src="${l?.images?.[0]?.urlMachine || "/img/placeholder.png"}"
                  alt="${escapeHtml(l.title || "Listing image")}"
                  loading="lazy"
                />
              </div>
              <div>
                <div class="text-sm font-bold text-slate-800">${escapeHtml(l.title || "")}</div>
                <div class="text-xs text-slate-500">${escapeHtml(l.reference || "")}</div>
              </div>
            </div>
          </td>

          <td class="px-6 py-4 text-sm font-medium">
            <div class="text-sm text-gray-500">
              <span class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase">
                ${escapeHtml(l.property_type_pf || l.property_type || "")}
              </span>
            </div>
          </td>

          <td class="px-6 py-4 text-sm font-medium">
            <div class="flex gap-2 text-slate-600">
              <span class="text-xs flex items-center gap-1"><i class="fa-solid fa-bed text-slate-400"></i> ${escapeHtml(l.bedrooms ?? "")}</span>
              <span class="text-xs flex items-center gap-1"><i class="fa-solid fa-bath text-slate-400"></i> ${escapeHtml(l.bathrooms ?? "")}</span>
              <span class="text-xs flex items-center gap-1"><i class="fa-solid fa-ruler-combined text-slate-400"></i> ${escapeHtml((l.size ?? "") + (l.size ? " sqft" : ""))}</span>
            </div>
          </td>

          <td class="px-6 py-4 text-sm font-medium">
            <div class="text-sm text-gray-500 capitalize">${escapeHtml(l.location?.name || l.location || "")}</div>
          </td>

          <td class="px-6 py-4 text-sm font-medium text-right">
            <div class="text-sm font-bold text-slate-700">${formatPrice(l.price || 0)}</div>
          </td>

          <td class="px-6 py-4 text-sm font-medium">
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
            <div class="relative inline-block text-left" data-menu>
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-slate-600 hover:bg-gray-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-menu-btn
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span class="sr-only">Open actions</span>
                <span class="text-xl leading-none">⋯</span>
              </button>

              <div
                class="absolute right-0 z-20 mt-2 hidden w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                data-menu-panel
                role="menu"
              >
                <a href="?page=listings&action=view&id=${l.id}"
                   class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                   role="menuitem">View</a>

                <a href="?page=listings&action=edit&id=${l.id}"
                   class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                   role="menuitem">Edit</a>

                <button type="button"
                  class="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  data-action="publish"
                  data-id="${l.id}"
                  role="menuitem">Publish</button>

                <button type="button"
                  class="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  data-action="unpublish"
                  data-id="${l.id}"
                  role="menuitem">Unpublish</button>

                <button type="button"
                  class="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  data-action="download_pdf"
                  data-id="${l.id}"
                  role="menuitem">Download PDF</button>

                <div class="my-1 h-px bg-gray-100"></div>

                <button type="button"
                  class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  data-action="delete"
                  data-id="${l.id}"
                  role="menuitem">Delete</button>
              </div>
            </div>
          </td>
        </tr>
      `,
        )
        .join("");
    }

    if (paginationContainer && pagination?.total && pagination.total > 0) {
      renderPagination(paginationContainer, pagination, (targetPage) => {
        loadListings(targetPage, state.searchTerm, state.filters);
      });
    } else if (paginationContainer) {
      paginationContainer.innerHTML = "";
    }

    renderChips();
  } catch (error) {
    console.error("Error loading listings:", error);
    const tbody = qs("#listingsTable");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-4 text-center text-red-500">Error loading listings</td>
        </tr>
      `;
    }
  }
}

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
      if (targetPage && !button.disabled) loadFunction(targetPage);
    });
  });
}

function closeAllMenus(exceptMenuEl = null) {
  qsa("[data-menu]").forEach((menu) => {
    if (exceptMenuEl && menu === exceptMenuEl) return;
    const panel = menu.querySelector("[data-menu-panel]");
    const btn = menu.querySelector("[data-menu-btn]");
    if (panel) panel.classList.add("hidden");
    if (btn) btn.setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-menu-btn]");
  const menu = e.target.closest("[data-menu]");
  const actionBtn = e.target.closest("[data-action]");

  if (actionBtn) {
    const action = actionBtn.getAttribute("data-action");
    const id = actionBtn.getAttribute("data-id");

    closeAllMenus();

    if (action === "publish") return;
    if (action === "unpublish") return;
    if (action === "download_pdf") return;
    if (action === "delete") return;
    return;
  }

  if (!menu) {
    closeAllMenus();
    return;
  }

  if (btn) {
    const panel = menu.querySelector("[data-menu-panel]");
    const isOpen = panel && !panel.classList.contains("hidden");
    closeAllMenus(menu);
    if (panel) panel.classList.toggle("hidden", isOpen);
    btn.setAttribute("aria-expanded", String(!isOpen));
    return;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAllMenus();
    closeFiltersDrawer();
  }
});

function wireSearch() {
  const searchInput = qs("#searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const term = e.target.value || "";
    state.searchTerm = term;

    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      renderChips();
      loadListings(1, state.searchTerm, state.filters);
    }, 450);
  });
}

function wireFilters() {
  const openBtn = qs("#openFiltersBtn");
  const closeBtn = qs("#closeFiltersBtn");
  const cancelBtn = qs("#cancelFiltersBtn");
  const applyBtn = qs("#applyFiltersBtn");
  const resetBtn = qs("#resetFiltersBtn");
  const backdrop = qs("#filtersBackdrop");

  if (openBtn) openBtn.addEventListener("click", openFiltersDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeFiltersDrawer);
  if (cancelBtn) cancelBtn.addEventListener("click", closeFiltersDrawer);
  if (backdrop) backdrop.addEventListener("click", closeFiltersDrawer);

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      state.filters = {
        reference: "",
        title: "",
        minPrice: "",
        maxPrice: "",
        location: "",
        status: "",
        type: "",
        bedrooms: "",
        bathrooms: "",
        minSize: "",
        maxSize: "",
      };
      syncFiltersToUI();
      renderChips();
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      state.filters = readFiltersFromUI();
      closeFiltersDrawer();
      renderChips();
      loadListings(1, state.searchTerm, state.filters);
    });
  }

  const clearAllBtn = qs("#clearAllBtn");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      state.searchTerm = "";
      const searchInput = qs("#searchInput");
      if (searchInput) searchInput.value = "";

      state.filters = {
        reference: "",
        title: "",
        minPrice: "",
        maxPrice: "",
        location: "",
        status: "",
        type: "",
        bedrooms: "",
        bathrooms: "",
        minSize: "",
        maxSize: "",
      };

      syncFiltersToUI();
      renderChips();
      loadListings(1, state.searchTerm, state.filters);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  wireSearch();
  wireFilters();
  loadListings(1, state.searchTerm, state.filters);
});
