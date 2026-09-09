/**
 * Reports & Analytics Dashboard JS
 */

let branchChartInstance = null;
let propertyTypeChartInstance = null;
let statusChartInstance = null;

let currentReportData = null;

/**
 * Initialize Reports Page
 */
function initReportsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const branchParam = urlParams.get("branch");

  const branchSelect = document.getElementById("reportBranchFilter");
  if (branchSelect && branchParam) {
    branchSelect.value = branchParam.toLowerCase();
  }

  loadReports(branchSelect ? branchSelect.value : "");
}

/**
 * Branch Filter Change Handler
 */
function onReportBranchChange() {
  const branchSelect = document.getElementById("reportBranchFilter");
  const selectedBranch = branchSelect ? branchSelect.value : "";

  // Update browser URL query without full reload
  const url = new URL(window.location);
  if (selectedBranch) {
    url.searchParams.set("branch", selectedBranch);
  } else {
    url.searchParams.delete("branch");
  }
  window.history.replaceState({}, "", url);

  loadReports(selectedBranch);
}

/**
 * Refresh Reports (Bust Cache)
 */
async function refreshReports() {
  const icon = document.getElementById("refreshReportIcon");
  const text = document.getElementById("refreshReportText");
  const branchSelect = document.getElementById("reportBranchFilter");
  const selectedBranch = branchSelect ? branchSelect.value : "";

  if (icon) icon.classList.add("fa-spin");
  if (text) text.textContent = "Updating...";

  try {
    await loadReports(selectedBranch, true);
  } finally {
    if (icon) icon.classList.remove("fa-spin");
    if (text) text.textContent = "Refresh";
  }
}

/**
 * Load Reports Data
 */
async function loadReports(branch = "", forceRefresh = false) {
  setLoadingState(true);

  let endpoint = "/?resource=reports";
  const params = [];
  if (branch) params.push(`branch=${encodeURIComponent(branch)}`);
  if (forceRefresh) params.push("refresh=true");
  if (params.length) endpoint += "&" + params.join("&");

  try {
    const res = await api(endpoint);

    if (res && res.success) {
      currentReportData = res;
      renderKPIs(res);
      renderBranchDistribution(res.branches, res.selected_branch);
      renderPropertyTypes(res.property_types);
      renderStatuses(res.statuses);
      renderMarketClassification(res);
      populateBranchTable(res.branches, res.selected_branch);
      updateStatusBadge(res);
    } else {
      console.error("Failed to load reports data:", res);
      alert("Could not load reports data. Please try again.");
    }
  } catch (err) {
    console.error("Error loading reports:", err);
  } finally {
    setLoadingState(false);
  }
}

/**
 * Render KPI Cards
 */
function renderKPIs(data) {
  const kpis = data.kpis || {};
  const total = kpis.total || 0;
  const active = kpis.active || 0;
  const inactive = kpis.inactive || 0;
  const activePct = kpis.active_pct !== undefined ? kpis.active_pct : 0;
  const inactivePct = kpis.inactive_pct !== undefined ? kpis.inactive_pct : 0;
  const sale = kpis.sale || 0;
  const rent = kpis.rent || 0;

  const totalEl = document.getElementById("kpiTotal");
  const activeEl = document.getElementById("kpiActive");
  const activePctEl = document.getElementById("kpiActivePct");
  const inactiveEl = document.getElementById("kpiInactive");
  const inactivePctEl = document.getElementById("kpiInactivePct");
  const purposeEl = document.getElementById("kpiPurposeSplit");
  const scopeTextEl = document.getElementById("kpiScopeText");

  if (totalEl) totalEl.textContent = formatNumber(total);
  if (activeEl) activeEl.textContent = formatNumber(active);
  if (activePctEl) activePctEl.textContent = `${activePct}% of portfolio actively published`;
  if (inactiveEl) inactiveEl.textContent = formatNumber(inactive);
  if (inactivePctEl) inactivePctEl.textContent = `${inactivePct}% in draft, pipeline or unlisted`;
  if (purposeEl) purposeEl.textContent = `${formatNumber(sale)} / ${formatNumber(rent)}`;

  if (scopeTextEl) {
    if (data.selected_branch && data.branch_labels[data.selected_branch]) {
      scopeTextEl.textContent = `Filtered to ${data.branch_labels[data.selected_branch]} branch`;
    } else {
      scopeTextEl.textContent = "Company-wide portfolio total";
    }
  }
}

/**
 * Render Branch Distribution Chart (Stacked: Active vs Inactive)
 */
function renderBranchDistribution(branches, selectedBranch) {
  const ctx = document.getElementById("branchChart");
  if (!ctx || !Array.isArray(branches)) return;

  const labels = branches.map((b) => b.name);
  const activeData = branches.map((b) => b.active);
  const inactiveData = branches.map((b) => b.inactive);

  if (branchChartInstance) {
    branchChartInstance.destroy();
  }

  const isFiltered = !!selectedBranch;

  branchChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Active (Published)",
          data: activeData,
          backgroundColor: "#10b981", // Emerald green
          borderRadius: 6,
          borderSkipped: false,
          stack: "combined",
        },
        {
          label: "Inactive (Other Stages)",
          data: inactiveData,
          backgroundColor: "#94a3b8", // Slate gray
          borderRadius: 6,
          borderSkipped: false,
          stack: "combined",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false, // Custom legend in card header
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          padding: 12,
          cornerRadius: 8,
          titleFont: { size: 13, weight: "bold" },
          bodyFont: { size: 12 },
          callbacks: {
            footer: function (tooltipItems) {
              let total = 0;
              let activeCount = 0;
              tooltipItems.forEach(function (item) {
                total += item.raw;
                if (item.datasetIndex === 0) activeCount = item.raw;
              });
              const rate = total > 0 ? ((activeCount / total) * 100).toFixed(1) : 0;
              return `Total: ${total.toLocaleString()} listings\nActive Rate: ${rate}%`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: {
            font: { weight: "600", size: 11 },
            color: function (context) {
              const b = branches[context.index];
              return b && b.is_selected ? "#2563eb" : "#475569";
            },
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: "rgba(226, 232, 240, 0.6)" },
          ticks: {
            callback: function (val) {
              return val >= 1000 ? val / 1000 + "k" : val;
            },
          },
        },
      },
      onClick: function (event, elements) {
        if (elements && elements.length > 0) {
          const index = elements[0].index;
          const branch = branches[index];
          if (branch && branch.id !== "unassigned") {
            const selectEl = document.getElementById("reportBranchFilter");
            if (selectEl) {
              selectEl.value = branch.id;
              onReportBranchChange();
            }
          }
        }
      },
    },
  });

  const summaryEl = document.getElementById("branchChartSummary");
  if (summaryEl) {
    summaryEl.textContent = `${branches.length} Branches accounted for`;
  }
}

/**
 * Render Property Type Breakdown (Doughnut & Ranked List)
 */
function renderPropertyTypes(types) {
  const ctx = document.getElementById("propertyTypeChart");
  const listEl = document.getElementById("propertyTypeList");
  if (!ctx || !Array.isArray(types)) return;

  // Filter types with counts > 0 for the doughnut chart
  const activeTypes = types.filter((t) => t.count > 0);
  const labels = activeTypes.map((t) => t.label);
  const counts = activeTypes.map((t) => t.count);

  const colors = [
    "#4f46e5", // Indigo (Apartment)
    "#06b6d4", // Cyan (Villa)
    "#10b981", // Emerald (Townhouse)
    "#f59e0b", // Amber (Office)
    "#ec4899", // Pink (Duplex)
    "#8b5cf6", // Violet (Retail)
    "#3b82f6", // Blue (Hotel Apt)
    "#14b8a6", // Teal (Bungalow)
    "#e11d48", // Rose (Penthouse)
    "#84cc16", // Lime (Shop)
    "#f97316", // Orange (Land)
    "#94a3b8", // Slate (Other)
  ];

  if (propertyTypeChartInstance) {
    propertyTypeChartInstance.destroy();
  }

  propertyTypeChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: colors.slice(0, counts.length),
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              const val = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${val.toLocaleString()} (${pct}%)`;
            },
          },
        },
      },
    },
  });

  // Populate Ranked Property Types List
  if (listEl) {
    listEl.innerHTML = types
      .filter((t) => t.count > 0)
      .map((t, idx) => {
        const dotColor = colors[idx % colors.length];
        return `
        <div class="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition text-xs">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${dotColor}"></span>
            <span class="text-gray-700 font-medium truncate flex items-center gap-1.5">
              <i class="fa-solid ${escapeHtml(t.icon || "fa-building")} text-[11px] text-gray-400"></i>
              ${escapeHtml(t.label)}
            </span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="font-semibold text-gray-900">${formatNumber(t.count)}</span>
            <span class="text-gray-400 text-[11px] w-12 text-right">(${t.share_pct}%)</span>
          </div>
        </div>
      `;
      })
      .join("");
  }
}

/**
 * Render Status Lifecycle (Doughnut & Pills List)
 */
function renderStatuses(statuses) {
  const ctx = document.getElementById("statusChart");
  const pillsEl = document.getElementById("statusPillsList");
  if (!ctx || !Array.isArray(statuses)) return;

  const activeStatuses = statuses.filter((s) => s.count > 0);
  const labels = activeStatuses.map((s) => s.label);
  const counts = activeStatuses.map((s) => s.count);
  const colors = activeStatuses.map((s) => s.color);

  if (statusChartInstance) {
    statusChartInstance.destroy();
  }

  statusChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              const val = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${val.toLocaleString()} (${pct}%)`;
            },
          },
        },
      },
    },
  });

  // Populate Status Pills List
  if (pillsEl) {
    pillsEl.innerHTML = statuses
      .filter((s) => s.count > 0)
      .map((s) => {
        const badgeStyle = s.is_active
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-gray-50 text-gray-700 border-gray-200";
        return `
        <div class="flex items-center justify-between p-2 rounded-lg border ${badgeStyle} text-xs">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${s.color}"></span>
            <span class="font-medium truncate">${escapeHtml(s.label)}</span>
            ${s.is_active ? '<span class="text-[10px] px-1.5 py-0.2 bg-emerald-600 text-white rounded-full font-bold">Active</span>' : ""}
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="font-bold">${formatNumber(s.count)}</span>
            <span class="text-gray-400 text-[11px]">(${s.share_pct}%)</span>
          </div>
        </div>
      `;
      })
      .join("");
  }
}

/**
 * Render Purpose & Category Bars
 */
function renderMarketClassification(data) {
  const cat = data.category || {};
  const pur = data.purpose || {};

  const resCount = cat.residential || 0;
  const comCount = cat.commercial || 0;
  const totalCat = resCount + comCount;
  const resPct = totalCat > 0 ? Math.round((resCount / totalCat) * 100) : 0;
  const comPct = totalCat > 0 ? 100 - resPct : 0;

  const saleCount = pur.sale || 0;
  const rentCount = pur.rent || 0;
  const totalPur = saleCount + rentCount;
  const salePct = totalPur > 0 ? Math.round((saleCount / totalPur) * 100) : 0;
  const rentPct = totalPur > 0 ? 100 - salePct : 0;

  const resBar = document.getElementById("residentialBar");
  const comBar = document.getElementById("commercialBar");
  const resText = document.getElementById("residentialCountText");
  const comText = document.getElementById("commercialCountText");

  if (resBar) resBar.style.width = `${resPct}%`;
  if (comBar) comBar.style.width = `${comPct}%`;
  if (resText) resText.textContent = `${formatNumber(resCount)} (${resPct}%)`;
  if (comText) comText.textContent = `${formatNumber(comCount)} (${comPct}%)`;

  const saleBar = document.getElementById("saleBar");
  const rentBar = document.getElementById("rentBar");
  const saleText = document.getElementById("saleCountText");
  const rentText = document.getElementById("rentCountText");

  if (saleBar) saleBar.style.width = `${salePct}%`;
  if (rentBar) rentBar.style.width = `${rentPct}%`;
  if (saleText) saleText.textContent = `${formatNumber(saleCount)} (${salePct}%)`;
  if (rentText) rentText.textContent = `${formatNumber(rentCount)} (${rentPct}%)`;

  const insightEl = document.getElementById("marketInsightText");
  if (insightEl) {
    insightEl.innerHTML = `
      <strong>Market Summary:</strong> Residential accounts for <strong>${resPct}%</strong> of inventory.
      <strong>${salePct}%</strong> of properties are for sale while <strong>${rentPct}%</strong> are for rent.
    `;
  }
}

/**
 * Populate Branch Performance Table
 */
function populateBranchTable(branches, selectedBranch) {
  const tbody = document.getElementById("branchTableBody");
  if (!tbody || !Array.isArray(branches)) return;

  if (branches.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-6 text-center text-gray-400">No branch data available.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = branches
    .map((b) => {
      const isSelected = selectedBranch && selectedBranch === b.id;
      const rowClass = isSelected ? "bg-blue-50/50 font-medium" : "hover:bg-gray-50/70";
      const branchHref = b.id !== "unassigned" ? `/?page=listings&branch=${encodeURIComponent(b.id)}` : "/?page=listings";

      return `
      <tr class="${rowClass} transition-colors">
        <!-- Branch Name & Indicator -->
        <td class="px-6 py-3.5 whitespace-nowrap">
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-xs shrink-0" style="background-color: ${b.color || "#94a3b8"}"></span>
            <div>
              <span class="font-semibold text-gray-900">${escapeHtml(b.name)}</span>
              ${b.id !== "unassigned" ? `<span class="ml-1.5 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase font-mono">${escapeHtml(b.id)}</span>` : ""}
            </div>
          </div>
        </td>

        <!-- Total Listings -->
        <td class="px-6 py-3.5 whitespace-nowrap text-right font-bold text-gray-900">
          ${formatNumber(b.total)}
        </td>

        <!-- Active (Published) -->
        <td class="px-6 py-3.5 whitespace-nowrap text-right">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ${formatNumber(b.active)}
          </span>
        </td>

        <!-- Inactive (Other Stages) -->
        <td class="px-6 py-3.5 whitespace-nowrap text-right">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            ${formatNumber(b.inactive)}
          </span>
        </td>

        <!-- Active Rate -->
        <td class="px-6 py-3.5 whitespace-nowrap">
          <div class="flex items-center gap-2">
            <div class="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div class="bg-emerald-500 h-2 rounded-full" style="width: ${Math.min(100, b.active_pct)}%"></div>
            </div>
            <span class="text-xs font-semibold text-gray-700">${b.active_pct}%</span>
          </div>
        </td>

        <!-- Portfolio Share -->
        <td class="px-6 py-3.5 whitespace-nowrap text-right text-xs text-gray-600 font-medium">
          ${b.share_pct}%
        </td>

        <!-- Action Link -->
        <td class="px-6 py-3.5 whitespace-nowrap text-center">
          <a href="${branchHref}" class="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline">
            <span>View Listings</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
        </td>
      </tr>
    `;
    })
    .join("");
}

/**
 * Update Status / Cache Badge
 */
function updateStatusBadge(data) {
  const badge = document.getElementById("reportStatusBadge");
  const text = document.getElementById("reportStatusText");
  if (!badge || !text) return;

  if (data.cached) {
    text.textContent = `Cached (${Math.round((data.cache_age_seconds || 0) / 60)}m ago)`;
    badge.className = "inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium border border-amber-200";
  } else {
    text.textContent = "Live data";
    badge.className = "inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-200";
  }
  badge.classList.remove("hidden");
}

/**
 * Loading state helper
 */
function setLoadingState(isLoading) {
  const refreshIcon = document.getElementById("refreshReportIcon");
  if (refreshIcon) {
    if (isLoading) refreshIcon.classList.add("fa-spin");
    else refreshIcon.classList.remove("fa-spin");
  }
}

/**
 * Number formatter
 */
function formatNumber(num) {
  return Number(num || 0).toLocaleString("en-US");
}

/**
 * HTML Escaper
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
