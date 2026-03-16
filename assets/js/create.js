function closeAllIconMenus(except = null) {
  document.querySelectorAll("[data-icon-menu]").forEach((wrap) => {
    if (except && wrap === except) return;
    const menu = wrap.querySelector("[data-icon-menu-panel]");
    const btn = wrap.querySelector("[data-icon-menu-btn]");
    if (menu) menu.classList.add("hidden");
    if (btn) btn.setAttribute("aria-expanded", "false");
  });
}

function buildIconMenuItem({ value, label, icon }) {
  const safeLabel = escapeHtml(label);
  return `
    <button type="button"
      class="w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
      data-icon-item
      data-value="${escapeHtml(value)}"
      data-label="${safeLabel}"
    >
      <i class="${escapeHtml(icon)} text-slate-500 w-4"></i>
      <span class="truncate">${safeLabel}</span>
    </button>
  `;
}

function setupIconSelect({
  hiddenInputId,
  btnId,
  labelId,
  menuId,
  options,
  placeholder,
}) {
  const hidden = document.getElementById(hiddenInputId);
  const btn = document.getElementById(btnId);
  const label = document.getElementById(labelId);
  const menu = document.getElementById(menuId);

  if (!hidden || !btn || !label || !menu) return;

  const wrapper = document.createElement("div");
  wrapper.className = "relative";
  wrapper.setAttribute("data-icon-menu", "1");

  btn.parentElement.insertBefore(wrapper, btn);
  wrapper.appendChild(btn);
  wrapper.appendChild(menu);

  btn.setAttribute("data-icon-menu-btn", "1");
  menu.setAttribute("data-icon-menu-panel", "1");

  menu.innerHTML = options.map(buildIconMenuItem).join("");

  const setValue = (opt) => {
    hidden.value = opt.value;
    label.innerHTML = `
      <span class="inline-flex items-center gap-2">
        <i class="${escapeHtml(opt.icon)} text-slate-500"></i>
        <span class="text-slate-800">${escapeHtml(opt.label)}</span>
      </span>
    `;
  };

  if (!hidden.value) {
    label.textContent = placeholder || "Select";
    label.classList.add("text-slate-400");
  }

  btn.addEventListener("click", () => {
    const isOpen = !menu.classList.contains("hidden");
    closeAllIconMenus(wrapper);
    menu.classList.toggle("hidden", isOpen);
    btn.setAttribute("aria-expanded", String(!isOpen));
  });

  menu.querySelectorAll("[data-icon-item]").forEach((item) => {
    item.addEventListener("click", () => {
      const value = item.getAttribute("data-value") || "";
      const lbl = item.getAttribute("data-label") || "";
      const opt = options.find((o) => o.value === value) || {
        value,
        label: lbl,
        icon: "fa-solid fa-circle",
      };
      label.classList.remove("text-slate-400");
      setValue(opt);
      menu.classList.add("hidden");
      btn.setAttribute("aria-expanded", "false");
    });
  });

  return { setValue };
}

// Fallback helpers (create page currently includes `assets/js/listings.js` first,
// but we keep these to avoid hard coupling).
if (typeof window.qs !== "function") {
  window.qs = (sel) => document.querySelector(sel);
}
if (typeof window.escapeHtml !== "function") {
  window.escapeHtml = (text) => {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
  };
}

let locationSearchTimer;
let locationActiveIndex = -1;
let locationActiveItems = [];

let bayutLocationSearchTimer;
let bayutLocationActiveIndex = -1;
let bayutLocationActiveItems = [];

function closeLocationMenu(type = "pf") {
  const menu =
    type === "pf" ? qs("#locationSearchMenu") : qs("#bayutLocationSearchMenu");
  if (menu) menu.classList.add("hidden");

  if (type === "pf") {
    locationActiveIndex = -1;
    locationActiveItems = [];
  } else {
    bayutLocationActiveIndex = -1;
    bayutLocationActiveItems = [];
  }
}

function setLocationSelection({ id, name, pfId } = {}, type = "pf") {
  const select =
    type === "pf" ? qs("#locationSelect") : qs("#bayutLocationSelect");
  const input =
    type === "pf"
      ? qs("#locationSearchInput")
      : qs("#bayutLocationSearchInput");
  const clearBtn =
    type === "pf" ? qs("#clearLocationBtn") : qs("#clearBayutLocationBtn");
  const menu =
    type === "pf" ? qs("#locationSearchMenu") : qs("#bayutLocationSearchMenu");

  if (!select || !input) return;

  if (!id) {
    // reset
    select.value = "";
    input.value = "";
    input.dataset.selectedId = "";
    input.dataset.selectedName = "";
    if (clearBtn) clearBtn.classList.add("hidden");
    if (menu) {
      menu.innerHTML =
        '<div class="p-3 text-md text-slate-500">Type at least 2 characters to search…</div>';
    }
    return;
  }

  // ensure selected option exists
  const existing = select.querySelector(
    `option[value="${CSS.escape(String(id))}"]`,
  );
  if (!existing) {
    const opt = document.createElement("option");
    opt.value = String(id);
    opt.textContent = String(name || pfId || id);
    select.appendChild(opt);
  }
  select.value = String(id);

  input.value = String(name || "");
  input.dataset.selectedId = String(id);
  input.dataset.selectedName = String(name || "");
  if (clearBtn) clearBtn.classList.remove("hidden");
}

async function fetchLocationsForSearch(query, type = "pf") {
  const q = String(query || "").trim();
  if (q.length < 2) return [];

  url =
    type === "pf"
      ? `/?resource=locations&q=${encodeURIComponent(q)}&page=1`
      : `/?resource=bayut-locations&q=${encodeURIComponent(q)}&page=1`;
  const res = await api(url);
  const data = Array.isArray(res) ? res : res?.data || [];
  return Array.isArray(data) ? data : [];
}

function renderLocationResults(results, query, type = "pf") {
  const menu =
    type === "pf" ? qs("#locationSearchMenu") : qs("#bayutLocationSearchMenu");
  if (!menu) return;

  if (type === "pf") {
    locationActiveItems = results;
    locationActiveIndex = -1;
  } else {
    bayutLocationActiveItems = results;
    bayutLocationActiveIndex = -1;
  }

  if (!query || String(query).trim().length < 2) {
    menu.innerHTML =
      '<div class="p-3 text-md text-slate-500">Type at least 2 characters to search…</div>';
    menu.classList.remove("hidden");
    return;
  }

  if (!results.length) {
    menu.innerHTML =
      '<div class="p-3 text-md text-slate-500">No locations found. Try a different keyword.</div>';
    menu.classList.remove("hidden");
    return;
  }

  menu.innerHTML = results
    .slice(0, 12)
    .map((loc, idx) => {
      const name = loc?.name || "";
      const pfId = loc?.location_id || "";
      return `
        <button type="button"
          class="w-full px-4 py-3 text-left hover:bg-slate-50 transition flex items-center justify-between gap-3"
          data-loc-item="1"
          data-idx="${idx}"
        >
          <div class="min-w-0">
            <div class="text-md font-semibold text-slate-800 truncate">${escapeHtml(
              name,
            )}</div>
            ${
              pfId
                ? `<div class="text-xs text-slate-400 font-semibold">PF ID: ${escapeHtml(
                    pfId,
                  )}</div>`
                : ""
            }
          </div>
          <i class="fa-solid fa-arrow-right text-slate-300"></i>
        </button>
      `;
    })
    .join("");

  menu.classList.remove("hidden");

  menu.querySelectorAll("[data-loc-item]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-idx"));
      const loc = results[idx];
      if (!loc) return;
      setLocationSelection(
        {
          id: loc.id,
          name: loc.name,
          pfId: loc.location_id,
        },
        type,
      );
      closeLocationMenu(type);
    });
  });
}

function setupLocationSearch(type = "pf") {
  const input =
    type === "pf"
      ? qs("#locationSearchInput")
      : qs("#bayutLocationSearchInput");
  const select =
    type === "pf" ? qs("#locationSelect") : qs("#bayutLocationSelect");
  const menu =
    type === "pf" ? qs("#locationSearchMenu") : qs("#bayutLocationSearchMenu");
  const clearBtn =
    type === "pf" ? qs("#clearLocationBtn") : qs("#clearBayutLocationBtn");

  if (!input || !select || !menu) return;

  // If select already has a value (e.g. browser back), reflect it
  if (select.value) {
    const opt = select.querySelector(
      `option[value="${CSS.escape(select.value)}"]`,
    );
    setLocationSelection(
      { id: select.value, name: opt?.textContent || "" },
      type,
    );
  }

  input.addEventListener("input", () => {
    const q = input.value || "";

    // If user edits text after selecting, clear selection until they pick again
    if (input.dataset.selectedId && q !== input.dataset.selectedName) {
      select.value = "";
      input.dataset.selectedId = "";
      input.dataset.selectedName = "";
      if (clearBtn) clearBtn.classList.add("hidden");
    }

    clearTimeout(locationSearchTimer);
    locationSearchTimer = setTimeout(async () => {
      try {
        const results = await fetchLocationsForSearch(q, type);
        renderLocationResults(results, q, type);
      } catch (e) {
        menu.innerHTML =
          '<div class="p-3 text-md text-rose-600">Failed to search locations. Please try again.</div>';
        menu.classList.remove("hidden");
      }
    }, 250);
  });

  input.addEventListener("focus", () => {
    // show helper or last results
    if (menu.classList.contains("hidden")) menu.classList.remove("hidden");
  });

  input.addEventListener("keydown", (e) => {
    const open = !menu.classList.contains("hidden");
    if (!open) return;

    const items = Array.from(menu.querySelectorAll("[data-loc-item]"));
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (type === "pf") {
        locationActiveIndex = Math.min(
          items.length - 1,
          locationActiveIndex + 1,
        );
      } else {
        bayutLocationActiveIndex = Math.min(
          items.length - 1,
          bayutLocationActiveIndex + 1,
        );
      }
      items.forEach((el, i) =>
        el.classList.toggle(
          "bg-slate-50",
          i ===
            (type === "pf" ? locationActiveIndex : bayutLocationActiveIndex),
        ),
      );
      items[
        type === "pf" ? locationActiveIndex : bayutLocationActiveIndex
      ]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (type === "pf") {
        locationActiveIndex = Math.max(0, locationActiveIndex - 1);
      } else {
        bayutLocationActiveIndex = Math.max(0, bayutLocationActiveIndex - 1);
      }
      items.forEach((el, i) =>
        el.classList.toggle(
          "bg-slate-50",
          i ===
            (type === "pf" ? locationActiveIndex : bayutLocationActiveIndex),
        ),
      );
      items[
        type === "pf" ? locationActiveIndex : bayutLocationActiveIndex
      ]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      if (type === "pf") {
        if (locationActiveIndex >= 0) {
          e.preventDefault();
          items[locationActiveIndex].click();
        }
      } else {
        if (bayutLocationActiveIndex >= 0) {
          e.preventDefault();
          items[bayutLocationActiveIndex].click();
        }
      }
    } else if (e.key === "Escape") {
      closeLocationMenu(type);
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      setLocationSelection({}, type);
      input.focus();
      closeLocationMenu(type);
    });
  }

  document.addEventListener("click", (e) => {
    if (type === "pf") {
      if (
        e.target.closest("#locationSearchMenu") ||
        e.target.closest("#locationSearchInput")
      ) {
        return;
      }
    } else {
      if (
        e.target.closest("#bayutLocationSearchMenu") ||
        e.target.closest("#bayutLocationSearchInput")
      ) {
        return;
      }
    }
    closeLocationMenu(type);
  });
}

function setupCreatePageUI() {
  setupIconSelect({
    hiddenInputId: "propertyCategory",
    btnId: "propertyCategoryBtn",
    labelId: "propertyCategoryLabel",
    menuId: "propertyCategoryMenu",
    placeholder: "Select Category",
    options: [
      { value: "residential", label: "Residential", icon: "fa-solid fa-house" },
      {
        value: "commercial",
        label: "Commercial",
        icon: "fa-solid fa-building",
      },
    ],
  });

  setupIconSelect({
    hiddenInputId: "propertyType",
    btnId: "propertyTypeBtn",
    labelId: "propertyTypeLabel",
    menuId: "propertyTypeMenu",
    placeholder: "Select Type",
    options: [
      { value: "apartment", label: "Apartment", icon: "fa-solid fa-building" },
      { value: "bungalow", label: "Bungalow", icon: "fa-solid fa-house" },
      {
        value: "bulk-rent-unit",
        label: "Bulk Rent Unit",
        icon: "fa-solid fa-layer-group",
      },
      {
        value: "bulk-sale-unit",
        label: "Bulk Sale Unit",
        icon: "fa-solid fa-layer-group",
      },
      {
        value: "business-center",
        label: "Business Center",
        icon: "fa-solid fa-city",
      },
      { value: "cabin", label: "Cabin", icon: "fa-solid fa-house-tree" },
      { value: "cafeteria", label: "Cafeteria", icon: "fa-solid fa-mug-hot" },
      { value: "chalet", label: "Chalet", icon: "fa-solid fa-house-snowflake" },
      { value: "clinic", label: "Clinic", icon: "fa-solid fa-house-medical" },
      {
        value: "co-working-space",
        label: "Co-working Space",
        icon: "fa-solid fa-people-group",
      },
      {
        value: "compound",
        label: "Compound",
        icon: "fa-solid fa-building-circle-check",
      },
      { value: "duplex", label: "Duplex", icon: "fa-solid fa-building" },
      { value: "factory", label: "Factory", icon: "fa-solid fa-industry" },
      { value: "farm", label: "Farm", icon: "fa-solid fa-tractor" },
      {
        value: "full-floor",
        label: "Full Floor",
        icon: "fa-solid fa-layer-group",
      },
      {
        value: "half-floor",
        label: "Half Floor",
        icon: "fa-solid fa-layer-group",
      },
      {
        value: "hotel-apartment",
        label: "Hotel Apartment",
        icon: "fa-solid fa-hotel",
      },
      {
        value: "ivilla",
        label: "Independent Villa",
        icon: "fa-solid fa-house-chimney",
      },
      { value: "land", label: "Land", icon: "fa-solid fa-mountain-sun" },
      {
        value: "labor-camp",
        label: "Labor Camp",
        icon: "fa-solid fa-people-roof",
      },
      {
        value: "medical-facility",
        label: "Medical Facility",
        icon: "fa-solid fa-hospital",
      },
      {
        value: "office-space",
        label: "Office Space",
        icon: "fa-solid fa-briefcase",
      },
      { value: "palace", label: "Palace", icon: "fa-solid fa-crown" },
      {
        value: "penthouse",
        label: "Penthouse",
        icon: "fa-solid fa-building-user",
      },
      { value: "rest-house", label: "Rest House", icon: "fa-solid fa-bed" },
      {
        value: "restaurant",
        label: "Restaurant",
        icon: "fa-solid fa-utensils",
      },
      { value: "retail", label: "Retail", icon: "fa-solid fa-bag-shopping" },
      { value: "roof", label: "Roof", icon: "fa-solid fa-house-circle-check" },
      {
        value: "show-room",
        label: "Showroom",
        icon: "fa-solid fa-store-large",
      },
      { value: "shop", label: "Shop", icon: "fa-solid fa-store" },
      {
        value: "staff-accommodation",
        label: "Staff Accommodation",
        icon: "fa-solid fa-house-user",
      },
      { value: "townhouse", label: "Townhouse", icon: "fa-solid fa-house" },
      { value: "twin-house", label: "Twin House", icon: "fa-solid fa-house" },
      { value: "villa", label: "Villa", icon: "fa-solid fa-house-chimney" },
      { value: "warehouse", label: "Warehouse", icon: "fa-solid fa-warehouse" },
      {
        value: "whole-building",
        label: "Whole Building",
        icon: "fa-solid fa-building",
      },
    ],
  });

  setupIconSelect({
    hiddenInputId: "purposeType",
    btnId: "purposeTypeBtn",
    labelId: "purposeTypeLabel",
    menuId: "purposeTypeMenu",
    placeholder: "Select Sale/Rent",
    options: [
      { value: "For Sale", label: "Buy", icon: "fa-solid fa-bag-shopping" },
      {
        value: "For Rent",
        label: "Rent",
        icon: "fa-solid fa-hand-holding-dollar",
      },
    ],
  });

  setupIconSelect({
    hiddenInputId: "furnishingType",
    btnId: "furnishingTypeBtn",
    labelId: "furnishingTypeLabel",
    menuId: "furnishingTypeMenu",
    placeholder: "Select Furnishing",
    options: [
      { value: "furnished", label: "Furnished", icon: "fa-solid fa-couch" },
      {
        value: "semi_furnished",
        label: "Semi-Furnished",
        icon: "fa-solid fa-chair",
      },
      {
        value: "unfurnished",
        label: "Unfurnished",
        icon: "fa-regular fa-square",
      },
    ],
  });

  setupIconSelect({
    hiddenInputId: "finishingType",
    btnId: "finishingTypeBtn",
    labelId: "finishingTypeLabel",
    menuId: "finishingTypeMenu",
    placeholder: "Select Finishing",
    options: [
      {
        value: "fully-finished",
        label: "Fully Finished",
        icon: "fa-solid fa-circle-check",
      },
      {
        value: "semi-furnished",
        label: "Semi-Finished",
        icon: "fa-solid fa-couch",
      },
      {
        value: "unfinished",
        label: "Unfinished",
        icon: "fa-solid fa-hammer",
      },
    ],
  });

  setupIconSelect({
    hiddenInputId: "permitType",
    btnId: "permitTypeBtn",
    labelId: "permitTypeLabel",
    menuId: "permitTypeMenu",
    placeholder: "Select Permit Type",
    options: [
      {
        value: "rera",
        label: "RERA (Dubai)",
        icon: "fa-solid fa-building-shield",
      },
      {
        value: "dtcm",
        label: "DTCM (Dubai)",
        icon: "fa-solid fa-building-columns",
      },
      {
        value: "adrec",
        label: "ABREC (Abu Dhabi)",
        icon: "fa-solid fa-landmark",
      },
    ],
  });

  setupIconSelect({
    hiddenInputId: "projectStatus",
    btnId: "projectStatusBtn",
    labelId: "projectStatusLabel",
    menuId: "projectStatusMenu",
    placeholder: "Select Status",
    options: [
      {
        value: "completed",
        label: "Completed",
        icon: "fa-solid fa-circle-check",
      },
      {
        value: "completed_primary",
        label: "Completed Primary",
        icon: "fa-solid fa-circle-check",
      },
      {
        value: "off_plan",
        label: "Off-plan",
        icon: "fa-solid fa-diagram-project",
      },
      {
        value: "off_plan_primary",
        label: "Off-plan Primary",
        icon: "fa-solid fa-diagram-project",
      },
    ],
  });

  setupIconSelect({
    hiddenInputId: "amountType",
    btnId: "amountTypeBtn",
    labelId: "amountTypeLabel",
    menuId: "amountTypeMenu",
    placeholder: "Select Amount Type",
    options: [
      { value: "yearly", label: "Yearly", icon: "fa-solid fa-key" },
      { value: "monthly", label: "Monthly", icon: "fa-solid fa-key" },
      { value: "weekly", label: "Weekly", icon: "fa-solid fa-key" },
      { value: "daily", label: "Daily", icon: "fa-solid fa-key" },
      { value: "sale", label: "Sale", icon: "fa-solid fa-handshake" },
    ],
  });

  setupIconSelect({
    hiddenInputId: "paymentMethod",
    btnId: "paymentMethodBtn",
    labelId: "paymentMethodLabel",
    menuId: "paymentMethodMenu",
    placeholder: "Select Payment Method",
    options: [
      { value: "cash", label: "Cash", icon: "fa-solid fa-money-bill" },
      {
        value: "installments",
        label: "Installments",
        icon: "fa-solid fa-receipt",
      },
    ],
  });

  setupIconSelect({
    hiddenInputId: "uaeEmirate",
    btnId: "uaeEmirateBtn",
    labelId: "uaeEmirateLabel",
    menuId: "uaeEmirateMenu",
    placeholder: "Select Emirate",
    options: [
      { value: "dubai", label: "Dubai", icon: "fa-solid fa-city" },
      { value: "abu_dhabi", label: "Abu Dhabi", icon: "fa-solid fa-landmark" },
      {
        value: "northern_emirates",
        label: "Northern Emirates",
        icon: "fa-solid fa-landmark",
      },
    ],
  });

  document.addEventListener("click", (e) => {
    const inside = e.target.closest("[data-icon-menu]");
    if (!inside) closeAllIconMenus();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllIconMenus();
  });
}

// Called by the page if present
async function loadFormOptions() {
  await Promise.allSettled([loadAgentsDropdown(), loadOwnersDropdown()]);
}

// Called by the page if present
function setupCreateForm() {
  setupCreatePageUI();
  setupLocationSearch();
  initializeImageManagement();
  initializeDocumentManagement();
  attachFormSubmissionHandler();
}

async function loadAgentsDropdown() {
  try {
    const response = await api("/?resource=agents&all=true");
    const agents = response.data || [];
    const agentSelect = qs("#agentSelect");

    if (!agentSelect) return;

    // Clear existing options except "Please select"
    agentSelect.innerHTML = '<option value="">Please select</option>';

    // Add agent options
    agents.forEach((agent) => {
      const fullName =
        [agent.name, agent.last_name].filter(Boolean).join(" ") || "Unknown";
      const option = document.createElement("option");
      option.value = agent.id; // Use ID as value for API filtering
      option.textContent = fullName; // Display name to user
      agentSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load agents:", err);
  }
}

async function loadOwnersDropdown() {
  try {
    const response = await api("/?resource=owners&all=true");
    const owners = response.data || [];
    const ownerSelect = qs("#ownerSelect");

    if (!ownerSelect) return;

    // Clear existing options except "Please select"
    ownerSelect.innerHTML = '<option value="">Please select</option>';

    // Add owner options
    owners.forEach((owner) => {
      const fullName =
        [owner.name, owner.last_name].filter(Boolean).join(" ") || "Unknown";
      const option = document.createElement("option");
      option.value = owner.id; // Use ID as value for API filtering
      option.textContent = fullName; // Display name to user
      ownerSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load owners:", err);
  }
}

// Amenities
const amenities = [
  { value: "balcony", label: "Balcony", icon: "fa-solid fa-person-shelter" },
  { value: "barbecue-area", label: "Barbecue Area", icon: "fa-solid fa-fire" },
  {
    value: "built-in-wardrobes",
    label: "Built-in Wardrobes",
    icon: "fa-solid fa-box-archive",
  },
  { value: "central-ac", label: "Central AC", icon: "fa-solid fa-snowflake" },
  {
    value: "childrens-play-area",
    label: "Children's Play Area",
    icon: "fa-solid fa-child-reaching",
  },
  {
    value: "childrens-pool",
    label: "Children's Pool",
    icon: "fa-solid fa-person-swimming",
  },
  {
    value: "concierge",
    label: "Concierge",
    icon: "fa-solid fa-bell-concierge",
  },
  {
    value: "conference-room",
    label: "Conference Room",
    icon: "fa-solid fa-people-line",
  },
  {
    value: "covered-parking",
    label: "Covered Parking",
    icon: "fa-solid fa-square-parking",
  },
  {
    value: "kitchen-appliances",
    label: "Kitchen Appliances",
    icon: "fa-solid fa-blender",
  },
  {
    value: "lobby-in-building",
    label: "Lobby in Building",
    icon: "fa-solid fa-building",
  },
  { value: "maid-service", label: "Maid Service", icon: "fa-solid fa-broom" },
  { value: "maids-room", label: "Maid’s Room", icon: "fa-solid fa-bed" },
  { value: "pets-allowed", label: "Pets Allowed", icon: "fa-solid fa-paw" },
  {
    value: "private-garden",
    label: "Private Garden",
    icon: "fa-solid fa-seedling",
  },
  { value: "private-gym", label: "Private Gym", icon: "fa-solid fa-dumbbell" },
  {
    value: "private-jacuzzi",
    label: "Private Jacuzzi",
    icon: "fa-solid fa-hot-tub-person",
  },
  {
    value: "private-pool",
    label: "Private Pool",
    icon: "fa-solid fa-water-ladder",
  },
  { value: "sanitation", label: "Sanitation", icon: "fa-solid fa-soap" },
  { value: "security", label: "Security", icon: "fa-solid fa-shield-halved" },
  { value: "shared-gym", label: "Shared Gym", icon: "fa-solid fa-dumbbell" },
  {
    value: "shared-pool",
    label: "Shared Pool",
    icon: "fa-solid fa-water-ladder",
  },
  { value: "shared-spa", label: "Shared Spa", icon: "fa-solid fa-spa" },
  { value: "study", label: "Study", icon: "fa-solid fa-book-open" },
  {
    value: "vastu-compliant",
    label: "Vastu Compliant",
    icon: "fa-solid fa-compass-drafting",
  },
  {
    value: "view-of-landmark",
    label: "View of Landmark",
    icon: "fa-solid fa-landmark",
  },
  { value: "view-of-water", label: "View of Water", icon: "fa-solid fa-water" },
  {
    value: "walk-in-closet",
    label: "Walk-in Closet",
    icon: "fa-solid fa-door-open",
  },
];

const container = document.getElementById("amenitiesContainer");

container.innerHTML = amenities
  .map(
    (item) => `
    <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-md text-slate-700">
      <input
        type="checkbox"
        name="amenities_pf[]"
        value="${item.value}"
        class="rounded border-slate-300"
      />
      <i class="${item.icon} text-slate-500"></i>
      <span>${item.label}</span>
    </label>
  `,
  )
  .join("");

// ============================================================================
// IMAGE PREVIEW AND MANAGEMENT
// ============================================================================

let imageGallery = []; // Store image data
let draggedImageId = null; // Track dragged image
const documentRemovalState = {};
const documentPreviewState = {};

const documentFieldConfig = {
  title_deed: {
    previewId: "titleDeedPreview",
    label: "Title Deed",
  },
  passport_copy: {
    previewId: "passportPreview",
    label: "Passport Copy",
  },
  emirates_id: {
    previewId: "emiratesPreview",
    label: "UAE ID",
  },
  contract_a: {
    previewId: "contractPreview",
    label: "Contract A",
  },
  listing_form: {
    previewId: "listingFormPreview",
    label: "Listing Form",
  },
};

function toImageId(id) {
  return String(id ?? "");
}

function handleImageInputChange(e) {
  const files = Array.from(e?.target?.files || []);
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = {
        id: Date.now() + Math.random(),
        src: event.target.result,
        name: file.name,
      };
      imageGallery.push(imageData);
      renderImageGallery();
    };
    reader.readAsDataURL(file);
  });

  if (e?.target) {
    e.target.value = ""; // Reset input so selecting same file again still triggers change
  }
}

window.handleImageInputChange = handleImageInputChange;

function initializeImageManagement() {
  const addImageBtn = document.getElementById("addImageBtn");
  const imageInput = document.getElementById("imageInput");
  const imageGrid = document.getElementById("imagePreviewGrid");

  if (!imageInput || !imageGrid) return;
  if (imageInput.dataset.imageManagementBound === "1") return;
  imageInput.dataset.imageManagementBound = "1";

  if (addImageBtn) {
    addImageBtn.addEventListener("click", () => {
      if (typeof imageInput.showPicker === "function") {
        imageInput.showPicker();
        return;
      }
      imageInput.click();
    });

    addImageBtn.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (typeof imageInput.showPicker === "function") {
        imageInput.showPicker();
        return;
      }
      imageInput.click();
    });
  }

  setupDragAndDrop();
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getDocumentUrl(doc) {
  if (Array.isArray(doc)) {
    return getDocumentUrl(doc[0] || null);
  }
  if (!doc) return "";
  if (typeof doc === "string") return doc;
  return (
    doc.urlMachine ||
    doc.url ||
    doc.downloadUrl ||
    doc.previewUrl ||
    doc.href ||
    doc.src ||
    ""
  );
}

function inferFileNameFromUrl(url, fallbackLabel) {
  if (!url) return fallbackLabel || "Document";

  try {
    const parsed = new URL(url, window.location.origin);
    const fileName = decodeURIComponent(
      (parsed.pathname || "").split("/").filter(Boolean).pop() || "",
    );
    if (
      !fileName ||
      /^crm\.controller\./i.test(fileName) ||
      !/\.[a-z0-9]{2,8}$/i.test(fileName)
    ) {
      return fallbackLabel || "Document";
    }

    return fileName;
  } catch {
    const cleanedUrl = String(url).split("?")[0].split("#")[0];
    const fileName = decodeURIComponent(cleanedUrl.split("/").pop() || "");
    if (
      !fileName ||
      /^crm\.controller\./i.test(fileName) ||
      !/\.[a-z0-9]{2,8}$/i.test(fileName)
    ) {
      return fallbackLabel || "Document";
    }

    return fileName;
  }
}

function getDocumentName(doc, fallbackLabel) {
  if (Array.isArray(doc)) {
    return getDocumentName(doc[0] || null, fallbackLabel);
  }
  if (!doc) return fallbackLabel || "Document";
  if (typeof doc === "string") {
    return inferFileNameFromUrl(doc, fallbackLabel);
  }

  const candidates = [
    doc.name,
    doc.fileName,
    doc.filename,
    doc.originalName,
    doc.original_name,
    doc.description,
    doc.title,
  ];

  for (const candidate of candidates) {
    const value = String(candidate ?? "").trim();
    if (value) return value;
  }

  return inferFileNameFromUrl(getDocumentUrl(doc), fallbackLabel);
}

function renderDocumentPreview(fieldName, documentData = null) {
  const config = documentFieldConfig[fieldName];
  if (!config) return;

  const preview = document.getElementById(config.previewId);
  if (!preview) return;

  if (!documentData) {
    documentPreviewState[fieldName] = [];
    preview.innerHTML = "";
    return;
  }

  const entries = Array.isArray(documentData)
    ? documentData.filter(Boolean)
    : [documentData];
  const primaryDocument = entries[0];
  if (!primaryDocument) {
    documentPreviewState[fieldName] = [];
    preview.innerHTML = "";
    return;
  }
  documentPreviewState[fieldName] = entries;

  const name = getDocumentName(documentData, config.label);
  const url = getDocumentUrl(documentData);
  const removeMode = entries.some((entry) => entry?.isExistingDocument)
    ? "existing"
    : "new";
  const extraCount = entries.length > 1 ? entries.length - 1 : 0;
  const secondaryLabel =
    extraCount > 0
      ? `<span class="ml-2 text-xs font-medium text-slate-400">+${extraCount} more</span>`
      : "";
  const removeButton = `
    <button type="button" class="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50" data-document-remove="${escapeAttribute(fieldName)}" data-remove-mode="${removeMode}">
      <i class="fa-solid fa-trash-can"></i>
      <span>Remove</span>
    </button>
  `;

  if (url) {
    preview.innerHTML = `
      <div class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer" class="inline-flex min-w-0 items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
          <i class="fa-solid fa-file-lines shrink-0"></i>
          <span class="truncate">${escapeAttribute(name)}</span>
          ${secondaryLabel}
        </a>
        ${removeButton}
      </div>
    `;
    return;
  }

  preview.innerHTML = `
    <div class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
      <div class="inline-flex min-w-0 items-center gap-2">
        <i class="fa-solid fa-file-lines shrink-0"></i>
        <span class="truncate">${escapeAttribute(name)}</span>
        ${secondaryLabel}
      </div>
      ${removeButton}
    </div>
  `;
}

function clearDocumentSelection(fieldName, removeExisting = false) {
  const input = document.querySelector(`input[name="${fieldName}"]`);
  if (input) {
    input.value = "";
  }

  const existingFileId = removeExisting
    ? (documentPreviewState[fieldName]?.[0]?.existingFileId ?? null)
    : null;
  documentRemovalState[fieldName] = removeExisting
    ? { removeExisting: true, existingFileId: existingFileId }
    : false;
  documentPreviewState[fieldName] = [];
  renderDocumentPreview(fieldName, null);
}

function initializeDocumentManagement() {
  Object.keys(documentFieldConfig).forEach((fieldName) => {
    const input = document.querySelector(`input[name="${fieldName}"]`);
    if (!input || input.dataset.documentPreviewBound === "1") return;

    input.dataset.documentPreviewBound = "1";
    input.addEventListener("change", (e) => {
      const file = e?.target?.files?.[0];
      if (!file || !file.name) {
        documentRemovalState[fieldName] = false;
        documentPreviewState[fieldName] = [];
        renderDocumentPreview(fieldName, null);
        return;
      }

      documentRemovalState[fieldName] = false;
      renderDocumentPreview(fieldName, {
        name: file.name,
        isExistingDocument: false,
      });
    });

    const preview = document.getElementById(
      documentFieldConfig[fieldName].previewId,
    );
    if (!preview || preview.dataset.documentRemoveBound === "1") return;

    preview.dataset.documentRemoveBound = "1";
    preview.addEventListener("click", (e) => {
      const button = e.target.closest("[data-document-remove]");
      if (!button) return;

      const removeMode = button.getAttribute("data-remove-mode") || "new";
      clearDocumentSelection(fieldName, removeMode === "existing");
    });
  });
}

function renderImageGallery() {
  const imageGrid = document.getElementById("imagePreviewGrid");
  if (!imageGrid) return;

  imageGrid.innerHTML = imageGallery
    .map((image, index) => {
      return `
    <div class="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-square shadow-sm hover:shadow-md transition-shadow cursor-move" draggable="true" data-image-id="${image.id}">
      <img src="${image.src}" alt="${image.name}" class="w-full h-full object-cover pointer-events-none select-none">
      
      <!-- Overlay with actions -->
      <div class="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 z-10">
        <div class="flex gap-2">
          ${
            index > 0
              ? `<button type="button" class="move-up-btn p-2.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white transition-colors shadow-lg" data-id="${image.id}" title="Move up">
                <i class="fa-solid fa-arrow-up text-sm"></i>
              </button>`
              : ""
          }
          ${
            index < imageGallery.length - 1
              ? `<button type="button" class="move-down-btn p-2.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white transition-colors shadow-lg" data-id="${image.id}" title="Move down">
                <i class="fa-solid fa-arrow-down text-sm"></i>
              </button>`
              : ""
          }
        </div>
        <button type="button" class="remove-image-btn p-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg" data-id="${image.id}" title="Remove image">
          <i class="fa-solid fa-trash-can text-sm"></i>
        </button>
      </div>
      
      <!-- Index label -->
      <div class="absolute top-2 left-2  bg-opacity-70 text-white text-xs font-bold px-3 py-1.5 rounded-md z-20">
        ${index + 1}
      </div>
    </div>
  `;
    })
    .join("");

  // Attach event listeners
  document.querySelectorAll(".remove-image-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-id");
      removeImage(id);
    });
  });

  document.querySelectorAll(".move-up-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-id");
      moveImageUp(id);
    });
  });

  document.querySelectorAll(".move-down-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-id");
      moveImageDown(id);
    });
  });

  updateImagesInput();

  // When gallery height changes inside an open collapsible section,
  // recalculate section max-height to prevent overlap with next sections.
  if (typeof refreshCollapsibleHeights === "function") {
    requestAnimationFrame(refreshCollapsibleHeights);
  }
}

function removeImage(id) {
  if (!id) return;
  const targetId = toImageId(id);
  imageGallery = imageGallery.filter(
    (img) => img && toImageId(img.id) !== targetId,
  );
  renderImageGallery();
}

function reorderImages(fromIndex, toIndex) {
  if (
    fromIndex < 0 ||
    fromIndex >= imageGallery.length ||
    toIndex < 0 ||
    toIndex >= imageGallery.length
  )
    return;

  const [movedImage] = imageGallery.splice(fromIndex, 1);
  imageGallery.splice(toIndex, 0, movedImage);
  renderImageGallery();
}

function setupDragAndDrop() {
  const imageGrid = document.getElementById("imagePreviewGrid");
  if (!imageGrid) return;

  imageGrid.addEventListener("dragstart", (e) => {
    if (e.target.closest("[data-image-id]")) {
      const imageEl = e.target.closest("[data-image-id]");
      draggedImageId = imageEl.getAttribute("data-image-id");
      imageEl.classList.add("opacity-50");
      e.dataTransfer.effectAllowed = "move";
    }
  });

  imageGrid.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const imageEl = e.target.closest("[data-image-id]");
    if (imageEl && draggedImageId !== imageEl.getAttribute("data-image-id")) {
      imageEl.classList.add("ring-2", "ring-blue-500");
    }
  });

  imageGrid.addEventListener("dragleave", (e) => {
    const imageEl = e.target.closest("[data-image-id]");
    if (imageEl) {
      imageEl.classList.remove("ring-2", "ring-blue-500");
    }
  });

  imageGrid.addEventListener("drop", (e) => {
    e.preventDefault();
    const dropTarget = e.target.closest("[data-image-id]");

    if (dropTarget && draggedImageId) {
      const targetId = dropTarget.getAttribute("data-image-id");
      if (draggedImageId !== targetId) {
        const fromIndex = imageGallery.findIndex(
          (img) => img && toImageId(img.id) === toImageId(draggedImageId),
        );
        const toIndex = imageGallery.findIndex(
          (img) => img && toImageId(img.id) === toImageId(targetId),
        );

        if (fromIndex !== -1 && toIndex !== -1) {
          reorderImages(fromIndex, toIndex);
        }
      }
    }

    document.querySelectorAll("[data-image-id]").forEach((el) => {
      el.classList.remove("opacity-50", "ring-2", "ring-blue-500");
    });
    draggedImageId = null;
  });

  imageGrid.addEventListener("dragend", () => {
    document.querySelectorAll("[data-image-id]").forEach((el) => {
      el.classList.remove("opacity-50", "ring-2", "ring-blue-500");
    });
    draggedImageId = null;
  });
}

function moveImageUp(id) {
  if (!id) return;
  const index = imageGallery.findIndex(
    (img) => img && toImageId(img.id) === toImageId(id),
  );
  if (index > 0 && index !== -1) {
    [imageGallery[index], imageGallery[index - 1]] = [
      imageGallery[index - 1],
      imageGallery[index],
    ];
    renderImageGallery();
  }
}

function moveImageDown(id) {
  if (!id) return;
  const index = imageGallery.findIndex(
    (img) => img && toImageId(img.id) === toImageId(id),
  );
  if (index !== -1 && index < imageGallery.length - 1) {
    [imageGallery[index], imageGallery[index + 1]] = [
      imageGallery[index + 1],
      imageGallery[index],
    ];
    renderImageGallery();
  }
}

function updateImagesInput() {
  const imagesInput = document.getElementById("imagesInput");
  if (!imagesInput) return;
  imagesInput.value = JSON.stringify(imageGallery);
}

function shuffleImages() {
  if (imageGallery.length <= 1) return;

  // Fisher-Yates shuffle algorithm
  for (let i = imageGallery.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [imageGallery[i], imageGallery[j]] = [imageGallery[j], imageGallery[i]];
  }

  renderImageGallery();
}

// ============================================================================
// FORM SUBMISSION HANDLER
// ============================================================================

function attachFormSubmissionHandler(id) {
  const createForm = document.getElementById("createListingForm");
  const editForm = document.getElementById("editListingForm");
  const form = createForm || editForm;

  if (!form) return;
  if (form.dataset.submitHandlerBound === "1") return;
  form.dataset.submitHandlerBound = "1";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Make sure description is more than 750 and less than 2000 characters
    const description = form.querySelector('textarea[name="description_en"]');
    if (description) {
      const descriptionValue = description.value;
      if (descriptionValue.length < 750) {
        alert("Description must be at least 750 characters.");
        return;
      }
      if (descriptionValue.length > 2000) {
        alert("Description must be less than 2000 characters.");
        return;
      }
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      const isEdit = editForm !== null;
      submitBtn.innerHTML = isEdit
        ? '<i class="fa-solid fa-spinner fa-spin"></i> Updating...'
        : '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
      // Gather form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // convert documents
      for (const key of Object.keys(documentFieldConfig)) {
        const file = formData.get(key);
        if (
          documentRemovalState[key] &&
          typeof documentRemovalState[key] === "object" &&
          documentRemovalState[key].removeExisting
        ) {
          data[key] = false;
          continue;
        }

        const hasFile =
          file instanceof File &&
          file.size > 0 &&
          String(file.name || "").trim() !== "";

        if (!hasFile) {
          const existingPreview = documentPreviewState[key]?.[0] || null;
          const existingFileId = existingPreview?.existingFileId ?? null;

          if (existingFileId !== null && existingFileId !== undefined) {
            data[key] = {
              existingFileId,
            };
          } else {
            delete data[key];
          }
          continue;
        }

        data[key] = {
          name: file.name,
          src: await fileToBase64(file),
        };
      }

      // Parse amenities array
      const amenities = formData.getAll("amenities_pf[]");
      if (amenities.length > 0) {
        data.amenities_pf = amenities;
      }
      delete data["amenities_pf[]"];

      // Parse portals multi-select (Object.fromEntries keeps only last value)
      data.portals = formData
        .getAll("portals")
        .map((v) => String(v || "").trim())
        .filter(Boolean);

      // Parse image data
      const imagesValue = data.images || "[]";
      if (imagesValue) {
        try {
          data.images = JSON.parse(imagesValue);
        } catch {
          data.images = [];
        }
      } else {
        data.images = [];
      }

      // Convert empty strings to null for cleaner API payload
      Object.keys(data).forEach((key) => {
        if (data[key] === "") {
          data[key] = null;
        }
      });

      // Determine if it's create or edit
      const isEdit = editForm !== null;
      const method = isEdit ? "PUT" : "POST";

      // POST/PUT to API
      const response = await api(
        "/?resource=listings" + (isEdit ? `&id=${id}` : ""),
        {
          method: method,
          body: data,
        },
      );

      // Success - redirect to listings
      if (response && response.id) {
        const message = isEdit
          ? "Listing updated successfully!"
          : "Listing created successfully!";
        alert(message);
        window.location.href = "?page=listings&action=list";
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      const isEdit = editForm !== null;
      const action = isEdit ? "updating" : "creating";
      alert(
        "Error " + action + " listing: " + (error.message || "Unknown error"),
      );

      // Restore button state
      if (submitBtn) {
        submitBtn.disabled = false;
        const isEdit = editForm !== null;
        submitBtn.innerHTML = isEdit
          ? '<i class="fa-solid fa-floppy-disk"></i> Update Listing'
          : '<i class="fa-solid fa-floppy-disk"></i> Save Listing';
      }
    }
  });
}

window.renderDocumentPreview = renderDocumentPreview;
window.initializeDocumentManagement = initializeDocumentManagement;
