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
      { value: "villa", label: "Villa", icon: "fa-solid fa-house-chimney" },
      { value: "townhouse", label: "Townhouse", icon: "fa-solid fa-house" },
      { value: "office", label: "Office", icon: "fa-solid fa-briefcase" },
      { value: "shop", label: "Shop", icon: "fa-solid fa-store" },
      { value: "warehouse", label: "Warehouse", icon: "fa-solid fa-warehouse" },
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
    hiddenInputId: "projectStatus",
    btnId: "projectStatusBtn",
    labelId: "projectStatusLabel",
    menuId: "projectStatusMenu",
    placeholder: "Select Status",
    options: [
      { value: "ready", label: "Ready", icon: "fa-solid fa-circle-check" },
      {
        value: "off_plan",
        label: "Off-plan",
        icon: "fa-solid fa-diagram-project",
      },
      {
        value: "under_construction",
        label: "Under Construction",
        icon: "fa-solid fa-person-digging",
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
      { value: "rent", label: "Rent", icon: "fa-solid fa-key" },
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
        value: "bank_transfer",
        label: "Bank Transfer",
        icon: "fa-solid fa-building-columns",
      },
      { value: "cheque", label: "Cheque", icon: "fa-solid fa-receipt" },
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
      { value: "sharjah", label: "Sharjah", icon: "fa-solid fa-mosque" },
      { value: "ajman", label: "Ajman", icon: "fa-solid fa-location-dot" },
      {
        value: "uaq",
        label: "Umm Al Quwain",
        icon: "fa-solid fa-location-dot",
      },
      {
        value: "ras_al_khaimah",
        label: "Ras Al Khaimah",
        icon: "fa-solid fa-mountain",
      },
      { value: "fujairah", label: "Fujairah", icon: "fa-solid fa-water" },
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