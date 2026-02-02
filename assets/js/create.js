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
        icon: "fa-solid fa-shield-check",
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

async function loadAgentsDropdown() {
  try {
    const response = await api("/?resource=agents&page=1");
    const agents = response.data || [];
    const agentSelect = qs("#agentSelect");

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
    const ownerSelect = qs("#ownerSelect");

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
        name="amenities[]"
        value="${item.value}"
        class="rounded border-slate-300"
      />
      <i class="${item.icon} text-slate-500"></i>
      <span>${item.label}</span>
    </label>
  `,
  )
  .join("");
