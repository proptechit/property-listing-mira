let currentPage = 1;
const pageSize = 50;

const agentMap = {}; // Store agent ID-to-name mapping
const ownerMap = {}; // Store owner ID-to-name mapping

const state = {
  searchTerm: "",
  viewMode: "list", // 'list' | 'grid'
  filters: {
    reference: "",
    title: "",
    minPrice: "",
    maxPrice: "",
    location: "",
    status: "",
    agent: "",
    owner: "",
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

function prettyLabel(v) {
  return String(v ?? "")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price || 0));
}

function formatPriceWithType(price, priceType) {
  const base = `AED ${formatPrice(price || 0)}`;
  const pt = String(priceType ?? "")
    .trim()
    .toLowerCase();
  if (!pt || pt === "sale") return base;
  return `${base} / ${prettyLabel(pt)}`;
}

function setViewMode(mode) {
  const m = mode === "grid" ? "grid" : "list";
  state.viewMode = m;
  try {
    localStorage.setItem("listings_view_mode", m);
  } catch (_) {}

  const listWrap = qs("#listingsListView");
  const gridWrap = qs("#listingsGridView");
  const listBtn = qs("#viewListBtn");
  const gridBtn = qs("#viewGridBtn");

  if (listWrap) listWrap.classList.toggle("hidden", m !== "list");
  if (gridWrap) gridWrap.classList.toggle("hidden", m !== "grid");

  const activeCls = "bg-blue-600 text-white shadow-md shadow-blue-100";
  const inactiveCls = "bg-slate-100 text-slate-600 hover:bg-slate-200";

  if (listBtn) {
    listBtn.classList.remove(...inactiveCls.split(" "));
    listBtn.classList.remove(...activeCls.split(" "));
    listBtn.classList.add(
      ...(m === "list" ? activeCls : inactiveCls).split(" "),
    );
    listBtn.setAttribute("aria-pressed", String(m === "list"));
  }
  if (gridBtn) {
    gridBtn.classList.remove(...inactiveCls.split(" "));
    gridBtn.classList.remove(...activeCls.split(" "));
    gridBtn.classList.add(
      ...(m === "grid" ? activeCls : inactiveCls).split(" "),
    );
    gridBtn.setAttribute("aria-pressed", String(m === "grid"));
  }
}

function wireViewToggle() {
  const listBtn = qs("#viewListBtn");
  const gridBtn = qs("#viewGridBtn");

  // restore
  let saved = "list";
  try {
    saved = localStorage.getItem("listings_view_mode") || "list";
  } catch (_) {}
  setViewMode(saved);

  if (listBtn) {
    listBtn.addEventListener("click", () => {
      setViewMode("list");
      loadListings(1, state.searchTerm, state.filters);
    });
  }
  if (gridBtn) {
    gridBtn.addEventListener("click", () => {
      setViewMode("grid");
      loadListings(1, state.searchTerm, state.filters);
    });
  }
}

function navigateToListing(id) {
  if (!id) return;
  window.location.href = `?page=listings&action=view&id=${encodeURIComponent(
    String(id),
  )}`;
}

function wireListingClicks() {
  const tbody = qs("#listingsTable");
  if (tbody) {
    tbody.addEventListener("click", (e) => {
      if (
        e.target.closest(
          "a,button,[data-menu],[data-menu-btn],[data-menu-panel]",
        )
      ) {
        return;
      }
      const tr = e.target.closest("tr[data-row-id]");
      if (!tr) return;
      navigateToListing(tr.getAttribute("data-row-id"));
    });
  }

  const grid = qs("#listingsGrid");
  if (grid) {
    grid.addEventListener("click", (e) => {
      if (e.target.closest("a,button")) return;
      const card = e.target.closest("[data-card-id]");
      if (!card) return;
      navigateToListing(card.getAttribute("data-card-id"));
    });
  }
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
    agent: "listing_agent",
    owner: "listing_owner",
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
  const agent = normStr(listing?.listing_agent);
  const owner = normStr(listing?.listing_owner);
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
      agent,
      owner,
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

  // For agent, convert ID to name if it's stored as ID
  if (f.agent) {
    const agentFilter = agentMap[f.agent]
      ? normStr(agentMap[f.agent])
      : normStr(f.agent);
    if (!agent.includes(agentFilter)) return false;
  }

  // For owner, convert ID to name if it's stored as ID
  if (f.owner) {
    const ownerFilter = ownerMap[f.owner]
      ? normStr(ownerMap[f.owner])
      : normStr(f.owner);
    if (!owner.includes(ownerFilter)) return false;
  }

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

  // For agent, display name from agentMap if available, otherwise show ID
  const agentValue =
    filters.agent && agentMap[filters.agent]
      ? agentMap[filters.agent]
      : filters.agent;
  push("agent", "Agent", agentValue);

  // For owner, display name from ownerMap if available, otherwise show ID
  const ownerValue =
    filters.owner && ownerMap[filters.owner]
      ? ownerMap[filters.owner]
      : filters.owner;
  push("owner", "Owner", ownerValue);

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
  set("#statusFilter", state.filters.status);
  set("#f_agent", state.filters.agent);
  set("#f_owner", state.filters.owner);
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
    agent: get("#f_agent"),
    owner: get("#f_owner"),
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
    const grid = qs("#listingsGrid");
    const paginationContainer = qs("#listingsPagination");

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="px-6 py-4 text-center text-gray-500">Loading...</td>
        </tr>
      `;
    }
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full">
          <div class="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${Array.from({ length: 8 })
              .map(
                () => `
              <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div class="h-40 bg-slate-200"></div>
                <div class="p-4">
                  <div class="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div class="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div class="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
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
      query.includes("agent") ||
      query.includes("owner") ||
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
      const emptyHtml = `
        <div class="flex flex-col items-center justify-center py-12">
          <i class="fa-solid fa-magnifying-glass text-slate-300 text-4xl mb-4"></i>
          <p class="text-gray-500 font-medium">No properties match "${escapeHtml(
            searchTerm,
          )}"</p>
          <p class="text-gray-400 text-sm">Try adjusting your keywords or filters</p>
        </div>
      `;

      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" class="px-6 py-4 text-center">${emptyHtml}</td>
          </tr>
        `;
      }
      if (grid) {
        grid.innerHTML = `<div class="col-span-full">${emptyHtml}</div>`;
      }
      if (paginationContainer) paginationContainer.innerHTML = "";
      renderChips();
      return;
    }

    const renderTable = () => {
      if (!tbody) return;
      tbody.innerHTML = data
        .map(
          (l) => `
        <tr class="hover:bg-blue-50/30 transition-colors group cursor-pointer" data-row-id="${escapeHtml(
          String(l.id || ""),
        )}">
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
                <div class="text-lg font-bold text-slate-800">${escapeHtml(l.title || "")}</div>
                <div class="text-sm text-slate-500">${escapeHtml(l.reference || "")}</div>
              </div>
            </div>
          </td>

          <td class="px-6 py-4 text-sm font-medium">
            <div class="text-sm text-gray-500">
              <span class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full  font-bold uppercase">
                ${escapeHtml(l.property_type_pf || l.property_type || "")}
              </span>
            </div>
          </td>

          <td class="px-6 py-4 text-sm font-medium">
            <div class="flex gap-2 text-slate-600">
              <span class="text-sm flex items-center gap-1"><i class="fa-solid fa-bed text-slate-400"></i> ${escapeHtml(l.bedrooms ?? "")}</span>
              <span class="text-sm flex items-center gap-1"><i class="fa-solid fa-bath text-slate-400"></i> ${escapeHtml(l.bathrooms ?? "")}</span>
              <span class="text-sm flex items-center gap-1"><i class="fa-solid fa-ruler-combined text-slate-400"></i> ${escapeHtml((l.size ?? "") + (l.size ? " sqft" : ""))}</span>
            </div>
          </td>

          <td class="px-6 py-4 text-sm font-medium">
            <div class="text-md text-gray-500 capitalize">${escapeHtml(l.location?.name || l.location || "")}</div>
          </td>

          <td class="px-6 py-4 text-sm font-medium text-right">
            <div class="text-sm font-bold text-slate-700">${escapeHtml(
              formatPriceWithType(l.price || 0, l.price_type),
            )}</div>
          </td>

          <td class="px-6 py-4 text-sm font-medium">
            <span class="px-2.5 py-1 inline-flex text-sm px-3 py-1 rounded-full  font-bold uppercase ${
              l.status === "available"
                ? "bg-blue-100 text-blue-800"
                : l.status === "sold"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-yellow-100 text-yellow-800"
            }">
              ${escapeHtml(l.status || "")}
            </span>
          </td>


          <td class="px-6 py-4 text-sm font-medium text-right">
            <div class="text-sm font-bold text-slate-700"> ${escapeHtml(l.listing_agent || "")}</div>
          </td>


          <td class="px-6 py-4 text-sm font-medium text-right">
            <div class="text-sm font-bold text-slate-700"> ${escapeHtml(l.listing_owner || "")}</div>
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
                   class="block px-4 py-2 text-md text-slate-700 hover:bg-slate-50"
                   role="menuitem">View</a>

                <a href="?page=listings&action=edit&id=${l.id}"
                   class="${IS_ADMIN == false ? "hidden" : "block"} px-4 py-2 text-md text-slate-700 hover:bg-slate-50"
                   role="menuitem">Edit</a>

                <button type="button"
                  class="${IS_ADMIN == false || l.status == "Published" ? "hidden" : "block"} w-full px-4 py-2 text-left text-md text-slate-700 hover:bg-slate-50"
                  data-action="publish"
                  data-id="${l.id}"
                  role="menuitem">Publish</button>

                <button type="button"
                  class="${IS_ADMIN == false || l.status == "Unpublished" ? "hidden" : "block"} w-full px-4 py-2 text-left text-md text-slate-700 hover:bg-slate-50"
                  data-action="unpublish"
                  data-id="${l.id}"
                  role="menuitem">Unpublish</button>

                <a href="https://crm.mira-international.com/local/listing-brochure/?id=${l.id}&user_id=${USER_ID}"
                   class="block px-4 py-2 text-md text-slate-700 hover:bg-slate-50"
                   role="menuitem"
                   target="_blank"
                   >Download PDF</a>

                <div class="my-1 h-px bg-gray-100"></div>

                <button type="button"
                  class="block w-full px-4 py-2 text-left text-md text-red-600 hover:bg-red-50"
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
    };

    const renderGrid = () => {
      if (!grid) return;
      grid.innerHTML = data
        .map((l) => {
          const img = l?.images?.[0]?.urlMachine || "/img/placeholder.png";
          const type =
            l.property_type_pf ||
            l.property_type ||
            l.property_type_bayut ||
            "";
          const location = l.location?.name || l.location || "";
          const beds = l.bedrooms ?? "";
          const baths = l.bathrooms ?? "";
          const size = l.size ?? "";
          const price = formatPriceWithType(l.price || 0, l.price_type);
          const status = l.status ? prettyLabel(l.status) : "";

          return `
            <div class="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-md hover:shadow-blue-50 transition cursor-pointer" data-card-id="${escapeHtml(
              String(l.id || ""),
            )}">
              <div class="relative bg-slate-100">
                <img src="${escapeHtml(
                  img,
                )}" class="w-full h-44 object-cover" alt="${escapeHtml(
                  l.title || "Listing image",
                )}" loading="lazy">
                ${
                  status
                    ? `<div class="absolute top-3 left-3"><span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase bg-blue-50 text-blue-700">${escapeHtml(
                        status,
                      )}</span></div>`
                    : ""
                }
              </div>

              <div class="p-4">
                <div class="text-md font-bold text-slate-800 line-clamp-2">${escapeHtml(
                  l.title || "",
                )}</div>
                <div class="text-sm text-slate-500 mt-1 flex items-center justify-between gap-2">
                  <span class="truncate">${escapeHtml(location)}</span>
                  <span class="font-extrabold text-slate-800">${escapeHtml(
                    price,
                  )}</span>
                </div>

                <div class="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                  ${
                    type
                      ? `<span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold uppercase">${escapeHtml(
                          type,
                        )}</span>`
                      : ""
                  }
                  <span class="bg-slate-50 text-slate-600 px-3 py-1 rounded-full font-semibold"><i class="fa-solid fa-bed text-slate-400 mr-1"></i>${escapeHtml(
                    String(beds),
                  )}</span>
                  <span class="bg-slate-50 text-slate-600 px-3 py-1 rounded-full font-semibold"><i class="fa-solid fa-bath text-slate-400 mr-1"></i>${escapeHtml(
                    String(baths),
                  )}</span>
                  <span class="bg-slate-50 text-slate-600 px-3 py-1 rounded-full font-semibold"><i class="fa-solid fa-ruler-combined text-slate-400 mr-1"></i>${escapeHtml(
                    String(size),
                  )}${size ? " sqft" : ""}</span>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    };

    if (state.viewMode === "grid") {
      renderGrid();
      // keep table in sync for menu wiring/pagination, but hidden anyway
      renderTable();
    } else {
      renderTable();
      renderGrid();
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

// Action handlers for listings
async function publishListing(id) {
  if (!id) return;

  if (!confirm("Are you sure you want to publish this listing?")) {
    return;
  }

  try {
    const response = await api(`/?resource=listings&id=${id}`, {
      method: "PUT",
      body: {
        status: "Published",
      },
    });

    if (response) {
      alert("Listing published successfully!");
      loadListings(currentPage, state.searchTerm, state.filters);
    }
  } catch (error) {
    console.error("Publish error:", error);
    alert("Error publishing listing: " + (error.message || "Unknown error"));
  }
}

async function unpublishListing(id) {
  if (!id) return;

  if (!confirm("Are you sure you want to unpublish this listing?")) {
    return;
  }

  try {
    const response = await api(`/?resource=listings&id=${id}`, {
      method: "PUT",
      body: {
        status: "Unpublished",
      },
    });

    if (response) {
      alert("Listing unpublished successfully!");
      loadListings(currentPage, state.searchTerm, state.filters);
    }
  } catch (error) {
    console.error("Unpublish error:", error);
    alert("Error unpublishing listing: " + (error.message || "Unknown error"));
  }
}

async function deleteListing(id) {
  if (!id) return;

  if (
    !confirm(
      "Are you sure you want to delete this listing? This action cannot be undone.",
    )
  ) {
    return;
  }

  try {
    const response = await api(`/?resource=listings&id=${id}`, {
      method: "DELETE",
    });

    if (response) {
      alert("Listing deleted successfully!");
      loadListings(currentPage, state.searchTerm, state.filters);
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert("Error deleting listing: " + (error.message || "Unknown error"));
  }
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-menu-btn]");
  const menu = e.target.closest("[data-menu]");
  const actionBtn = e.target.closest("[data-action]");

  if (actionBtn) {
    const action = actionBtn.getAttribute("data-action");
    const id = actionBtn.getAttribute("data-id");

    closeAllMenus();

    if (action === "publish") {
      publishListing(id);
      return;
    }
    if (action === "unpublish") {
      unpublishListing(id);
      return;
    }
    if (action === "download_pdf") return;
    if (action === "delete") {
      deleteListing(id);
      return;
    }
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
  const quickStatusFilter = qs("#statusFilter");

  if (openBtn) openBtn.addEventListener("click", openFiltersDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeFiltersDrawer);
  if (cancelBtn) cancelBtn.addEventListener("click", closeFiltersDrawer);
  if (backdrop) backdrop.addEventListener("click", closeFiltersDrawer);

  // Wire up quick status filter
  if (quickStatusFilter) {
    quickStatusFilter.addEventListener("change", (e) => {
      state.filters.status = e.target.value || "";
      renderChips();
      loadListings(1, state.searchTerm, state.filters);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      state.filters = {
        reference: "",
        title: "",
        minPrice: "",
        maxPrice: "",
        location: "",
        status: "",
        agent: "",
        owner: "",
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
        agent: "",
        owner: "",
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

async function loadAgentsDropdown() {
  try {
    const response = await api("/?resource=agents&page=1");
    const agents = response.data || [];
    const agentSelect = qs("#f_agent");

    if (!agentSelect) return;

    // Clear existing options except "Any"
    agentSelect.innerHTML = '<option value="">Any</option>';

    // Add agent options and populate agentMap
    agents.forEach((agent) => {
      const fullName =
        [agent.name, agent.last_name].filter(Boolean).join(" ") || "Unknown";
      const option = document.createElement("option");
      option.value = agent.id; // Use ID as value for API filtering
      option.textContent = fullName; // Display name to user
      agentSelect.appendChild(option);

      // Store ID-to-name mapping for chip display
      agentMap[agent.id] = fullName;
    });
  } catch (err) {
    console.error("Failed to load agents:", err);
  }
}

async function loadOwnersDropdown() {
  try {
    const response = await api("/?resource=owners&page=1");
    const owners = response.data || [];
    const ownerSelect = qs("#f_owner");

    if (!ownerSelect) return;

    // Clear existing options except "Any"
    ownerSelect.innerHTML = '<option value="">Any</option>';

    // Add owner options and populate ownerMap
    owners.forEach((owner) => {
      const fullName =
        [owner.name, owner.last_name].filter(Boolean).join(" ") || "Unknown";
      const option = document.createElement("option");
      option.value = owner.id; // Use ID as value for API filtering
      option.textContent = fullName; // Display name to user
      ownerSelect.appendChild(option);

      // Store ID-to-name mapping for chip display
      ownerMap[owner.id] = fullName;
    });
  } catch (err) {
    console.error("Failed to load owners:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  wireSearch();
  wireFilters();
  wireViewToggle();
  loadAgentsDropdown();
  loadOwnersDropdown();
  wireListingClicks();
  loadListings(1, state.searchTerm, state.filters);
});
