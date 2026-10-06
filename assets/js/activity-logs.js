/**
 * Activity Logs & Audit Trail Page Controller (Admin Only)
 */

const activityState = {
  page: 1,
  limit: 50,
  total: 0,
  logs: [],
  filters: {
    listing_id: "",
    action: "",
    user_id: "",
  },
};

const ACTION_CONFIG = {
  created: {
    label: "Created",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconClass: "fa-solid fa-circle-plus text-emerald-600",
  },
  updated: {
    label: "Updated",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    iconClass: "fa-solid fa-pen-to-square text-blue-600",
  },
  published: {
    label: "Published",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    iconClass: "fa-solid fa-circle-check text-teal-600",
  },
  unpublished: {
    label: "Unpublished",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    iconClass: "fa-solid fa-circle-pause text-amber-600",
  },
  deleted: {
    label: "Deleted",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    iconClass: "fa-solid fa-trash-can text-rose-600",
  },
  viewed: {
    label: "Viewed",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
    iconClass: "fa-solid fa-eye text-violet-600",
  },
  duplicated: {
    label: "Duplicated",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconClass: "fa-solid fa-clone text-indigo-600",
  },
  refreshed: {
    label: "Refreshed",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    iconClass: "fa-solid fa-arrows-rotate text-sky-600",
  },
};

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-cyan-500",
];

function getAvatarColor(str) {
  let hash = 0;
  for (let i = 0; i < (str || "").length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function formatTimestamp(dateString) {
  if (!dateString) return "-";
  let str = String(dateString).trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(str)) {
    str = str.replace(" ", "T");
  }
  const date = new Date(str);
  if (isNaN(date.getTime())) return escapeHtml(str);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function timeAgo(dateString) {
  if (!dateString) return "-";
  let str = String(dateString).trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(str)) {
    str = str.replace(" ", "T");
  }
  const date = new Date(str);
  if (isNaN(date.getTime())) return dateString;

  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function formatFieldName(name) {
  return String(name || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchActivityLogs() {
  const tbody = document.querySelector("#activityLogsTableBody");
  const refreshIcon = document.querySelector("#refreshLogsIcon");

  if (refreshIcon) refreshIcon.classList.add("fa-spin");

  try {
    let url = `/?resource=activity-logs&page=${activityState.page}&limit=${activityState.limit}`;

    if (activityState.filters.listing_id) {
      url += `&listing_id=${encodeURIComponent(activityState.filters.listing_id)}`;
    }
    if (activityState.filters.action) {
      url += `&action=${encodeURIComponent(activityState.filters.action)}`;
    }
    if (activityState.filters.user_id) {
      url += `&user_id=${encodeURIComponent(activityState.filters.user_id)}`;
    }

    const res = await api(url);

    activityState.logs = res?.items || [];
    activityState.total = res?.total || activityState.logs.length;

    renderActivityTable(activityState.logs);
    updatePaginationControls();
    updateStatsCounters(activityState.logs, activityState.total);
  } catch (err) {
    console.error("Error loading activity logs:", err);
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-12 text-center text-rose-600">
            <div class="flex flex-col items-center justify-center gap-2">
              <i class="fa-solid fa-triangle-exclamation text-2xl text-rose-500"></i>
              <span class="font-semibold">Failed to load activity logs</span>
              <span class="text-xs text-rose-500">${escapeHtml(err?.error || err?.message || "Unknown error")}</span>
            </div>
          </td>
        </tr>
      `;
    }
  } finally {
    if (refreshIcon) refreshIcon.classList.remove("fa-spin");
  }
}

function renderActivityTable(logs) {
  const tbody = document.querySelector("#activityLogsTableBody");
  if (!tbody) return;

  if (!logs || logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-16 text-center text-gray-500">
          <div class="flex flex-col items-center justify-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-xl">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div class="font-semibold text-gray-800">No activity logs found</div>
            <p class="text-xs text-gray-500 max-w-sm">No activity events match your current filter parameters. Try adjusting the search filters.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = logs
    .map((log) => {
      const action = String(log.action || "").toLowerCase();
      const cfg = ACTION_CONFIG[action] || {
        label: action || "Unknown",
        badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
        iconClass: "fa-solid fa-circle-info text-gray-500",
      };

      const userName = log.user_name || "System";
      const userRole = log.user_role || (log.user_id == 1 ? "Admin" : "Agent");
      const isAdminRole = userRole.toLowerCase().includes("admin");
      const avatarBg = getAvatarColor(userName);
      const initials = getInitials(userName);

      const listingId = log.listing_id || log.parent_id;
      const listingRef = log.reference ? ` (${log.reference})` : "";
      const listingTitle = log.listing_title || `Listing #${listingId}`;

      const changesExist =
        log.changes &&
        (typeof log.changes === "object"
          ? Object.keys(log.changes).length > 0
          : String(log.changes).trim().length > 0);

      const changesCount =
        changesExist && typeof log.changes === "object"
          ? Object.keys(log.changes).length
          : null;

      return `
        <tr class="hover:bg-slate-50/75 transition-colors">
          <!-- Action & Time -->
          <td class="px-5 py-4 whitespace-nowrap">
            <div class="flex items-start gap-3">
              <div class="mt-0.5">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badgeClass}">
                  <i class="${cfg.iconClass} text-[11px]"></i>
                  <span>${escapeHtml(cfg.label)}</span>
                </span>
              </div>
              <div>
                <div class="text-xs font-semibold text-gray-900">${timeAgo(log.created_at)}</div>
                <div class="text-[11px] text-gray-400 mt-0.5" title="${escapeHtml(log.created_at || "")}">
                  ${formatTimestamp(log.created_at)}
                </div>
              </div>
            </div>
          </td>

          <!-- Listing Link & Title -->
          <td class="px-5 py-4">
            <div class="min-w-[180px]">
              ${
                listingId
                  ? `<a href="?page=listings&action=view&id=${encodeURIComponent(listingId)}" 
                       class="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1">
                       <span>#${escapeHtml(String(listingId))}</span>
                       <span class="text-xs text-gray-500 font-normal">${escapeHtml(listingRef)}</span>
                       <i class="fa-solid fa-arrow-up-right-from-square text-[10px] ml-0.5 opacity-60"></i>
                     </a>`
                  : `<span class="text-sm font-semibold text-gray-400">-</span>`
              }
              <div class="text-xs text-gray-600 truncate max-w-xs mt-0.5 font-medium" title="${escapeHtml(listingTitle)}">
                ${escapeHtml(listingTitle)}
              </div>
            </div>
          </td>

          <!-- Actor (User) -->
          <td class="px-5 py-4 whitespace-nowrap">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                ${initials}
              </div>
              <div>
                <div class="text-sm font-semibold text-gray-900">${escapeHtml(userName)}</div>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isAdminRole
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }">
                    ${escapeHtml(userRole)}
                  </span>
                  ${
                    log.user_id
                      ? `<span class="text-[10px] text-gray-400 font-mono">#${escapeHtml(String(log.user_id))}</span>`
                      : ""
                  }
                </div>
              </div>
            </div>
          </td>

          <!-- Description & Portals -->
          <td class="px-5 py-4">
            <div class="max-w-md">
              <div class="text-sm text-gray-800 leading-snug">${escapeHtml(log.description || "-")}</div>
              ${
                log.portals
                  ? `<div class="flex flex-wrap gap-1 mt-1.5">
                       ${String(log.portals)
                         .split(",")
                         .map(
                           (p) => `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                             <i class="fa-solid fa-satellite-dish mr-1 text-[9px] text-slate-400"></i>${escapeHtml(p.trim())}
                           </span>`
                         )
                         .join("")}
                     </div>`
                  : ""
              }
            </div>
          </td>

          <!-- Changes / Details -->
          <td class="px-5 py-4 whitespace-nowrap text-right">
            ${
              changesExist
                ? `<button type="button" onclick="openChangesModal(${log.id})"
                     class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs">
                     <i class="fa-solid fa-code-compare text-xs"></i>
                     <span>${changesCount !== null ? `Changes (${changesCount})` : "View Changes"}</span>
                   </button>`
                : `<span class="text-xs text-gray-400 italic">No field diff</span>`
            }
          </td>
        </tr>
      `;
    })
    .join("");
}

function updatePaginationControls() {
  const pageStartEl = document.querySelector("#pageStart");
  const pageEndEl = document.querySelector("#pageEnd");
  const totalRecordsEl = document.querySelector("#totalRecords");
  const pageNumberDisplay = document.querySelector("#pageNumberDisplay");
  const prevBtn = document.querySelector("#prevPageBtn");
  const nextBtn = document.querySelector("#nextPageBtn");

  const total = activityState.total;
  const start = total === 0 ? 0 : (activityState.page - 1) * activityState.limit + 1;
  const end = Math.min(start + activityState.logs.length - 1, total);

  if (pageStartEl) pageStartEl.textContent = start;
  if (pageEndEl) pageEndEl.textContent = end;
  if (totalRecordsEl) totalRecordsEl.textContent = total;
  if (pageNumberDisplay) pageNumberDisplay.textContent = `Page ${activityState.page}`;

  if (prevBtn) prevBtn.disabled = activityState.page <= 1;
  if (nextBtn) nextBtn.disabled = end >= total;
}

function updateStatsCounters(logs, total) {
  const totalEl = document.querySelector("#statTotalCount");
  const updatesEl = document.querySelector("#statUpdatesCount");
  const publishEl = document.querySelector("#statPublishCount");
  const viewsEl = document.querySelector("#statViewsCount");

  if (totalEl) totalEl.textContent = total;

  let updates = 0;
  let publish = 0;
  let views = 0;

  logs.forEach((l) => {
    const a = String(l.action || "").toLowerCase();
    if (a === "updated") updates++;
    if (a === "published" || a === "unpublished") publish++;
    if (a === "viewed") views++;
  });

  if (updatesEl) updatesEl.textContent = updates;
  if (publishEl) publishEl.textContent = publish;
  if (viewsEl) viewsEl.textContent = views;
}

function openChangesModal(logId) {
  const log = activityState.logs.find((l) => l.id == logId);
  const modal = document.querySelector("#changesDetailModal");
  const modalTitle = document.querySelector("#changesModalTitle");
  const modalSubtitle = document.querySelector("#changesModalSubtitle");
  const modalBody = document.querySelector("#changesModalBody");

  if (!modal || !modalBody || !log) return;

  const action = String(log.action || "").toUpperCase();
  const listingId = log.listing_id || log.parent_id || "-";
  const listingRef = log.reference ? ` (${log.reference})` : "";

  if (modalTitle) modalTitle.textContent = `[${action}] Audit Details`;
  if (modalSubtitle) modalSubtitle.textContent = `Listing #${listingId}${listingRef} • By ${log.user_name || "System"}`;

  let bodyHtml = "";

  const changes = log.changes;

  if (changes && typeof changes === "object" && !Array.isArray(changes) && Object.keys(changes).length > 0) {
    bodyHtml += `
      <div class="space-y-3">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Modified Fields</div>
        <div class="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
    `;

    for (const [key, diff] of Object.entries(changes)) {
      const fieldTitle = formatFieldName(key);

      if (diff && typeof diff === "object" && ("old" in diff || "new" in diff)) {
        const oldVal = diff.old === null || diff.old === "" ? "(empty)" : JSON.stringify(diff.old);
        const newVal = diff.new === null || diff.new === "" ? "(empty)" : JSON.stringify(diff.new);

        bodyHtml += `
          <div class="p-3.5 hover:bg-slate-50 transition-colors">
            <div class="text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
              <span>${escapeHtml(fieldTitle)}</span>
              <span class="text-[10px] text-gray-400 font-mono">${escapeHtml(key)}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div class="bg-rose-50 border border-rose-100 rounded-lg p-2 text-rose-800 font-mono break-all">
                <span class="text-[10px] font-bold text-rose-500 uppercase block mb-0.5">Previous Value</span>
                ${escapeHtml(oldVal)}
              </div>
              <div class="bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-emerald-800 font-mono break-all">
                <span class="text-[10px] font-bold text-emerald-500 uppercase block mb-0.5">New Value</span>
                ${escapeHtml(newVal)}
              </div>
            </div>
          </div>
        `;
      } else if (diff && typeof diff === "object" && ("old_count" in diff || "new_count" in diff)) {
        bodyHtml += `
          <div class="p-3.5 hover:bg-slate-50 transition-colors">
            <div class="text-xs font-bold text-gray-800 mb-1.5">${escapeHtml(fieldTitle)}</div>
            <div class="flex items-center gap-3 text-xs">
              <span class="px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-100 font-mono">
                ${diff.old_count} items
              </span>
              <i class="fa-solid fa-arrow-right text-gray-400 text-xs"></i>
              <span class="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold font-mono">
                ${diff.new_count} items
              </span>
            </div>
          </div>
        `;
      } else {
        bodyHtml += `
          <div class="p-3.5 hover:bg-slate-50 transition-colors">
            <div class="text-xs font-bold text-gray-800 mb-1">${escapeHtml(fieldTitle)}</div>
            <pre class="bg-gray-50 p-2 rounded-lg text-xs font-mono text-gray-700 overflow-x-auto">${escapeHtml(
              JSON.stringify(diff, null, 2)
            )}</pre>
          </div>
        `;
      }
    }

    bodyHtml += `</div></div>`;
  } else if (changes) {
    bodyHtml += `
      <div>
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Raw Payload</div>
        <pre class="bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs font-mono text-gray-800 overflow-x-auto">${escapeHtml(
          typeof changes === "string" ? changes : JSON.stringify(changes, null, 2)
        )}</pre>
      </div>
    `;
  }

  // Technical Metadata (IP, Browser User Agent)
  if (log.ip_address || log.user_agent) {
    bodyHtml += `
      <div class="pt-3 border-t border-gray-100">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Technical Metadata</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          ${
            log.ip_address
              ? `<div class="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                   <span class="text-gray-400 block text-[10px] font-semibold uppercase">Client IP</span>
                   <span class="font-mono text-gray-800 font-medium">${escapeHtml(log.ip_address)}</span>
                 </div>`
              : ""
          }
          ${
            log.user_agent
              ? `<div class="bg-gray-50 p-2.5 rounded-lg border border-gray-100 sm:col-span-2">
                   <span class="text-gray-400 block text-[10px] font-semibold uppercase">Browser / User Agent</span>
                   <span class="font-mono text-gray-700 text-[11px] break-all">${escapeHtml(log.user_agent)}</span>
                 </div>`
              : ""
          }
        </div>
      </div>
    `;
  }

  modalBody.innerHTML = bodyHtml;
  modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function closeChangesModal() {
  const modal = document.querySelector("#changesDetailModal");
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

function wireEventListeners() {
  const form = document.querySelector("#activityFilterForm");
  const resetBtn = document.querySelector("#resetFilterBtn");
  const refreshBtn = document.querySelector("#refreshLogsBtn");
  const prevBtn = document.querySelector("#prevPageBtn");
  const nextBtn = document.querySelector("#nextPageBtn");
  const modal = document.querySelector("#changesDetailModal");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      activityState.filters.listing_id = document.querySelector("#filterListingId")?.value?.trim() || "";
      activityState.filters.action = document.querySelector("#filterAction")?.value || "";
      activityState.filters.user_id = document.querySelector("#filterUserId")?.value?.trim() || "";
      activityState.page = 1;
      fetchActivityLogs();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (document.querySelector("#filterListingId")) document.querySelector("#filterListingId").value = "";
      if (document.querySelector("#filterAction")) document.querySelector("#filterAction").value = "";
      if (document.querySelector("#filterUserId")) document.querySelector("#filterUserId").value = "";
      activityState.filters = { listing_id: "", action: "", user_id: "" };
      activityState.page = 1;
      fetchActivityLogs();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      fetchActivityLogs();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (activityState.page > 1) {
        activityState.page--;
        fetchActivityLogs();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      activityState.page++;
      fetchActivityLogs();
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeChangesModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeChangesModal();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Pre-populate filters from URL query parameters if available
  const urlParams = new URLSearchParams(window.location.search);
  const qListing = urlParams.get("listing_id");
  const qAction = urlParams.get("action_filter");

  if (qListing) {
    activityState.filters.listing_id = qListing;
    const input = document.querySelector("#filterListingId");
    if (input) input.value = qListing;
  }

  if (qAction) {
    activityState.filters.action = qAction;
    const select = document.querySelector("#filterAction");
    if (select) select.value = qAction;
  }

  wireEventListeners();
  fetchActivityLogs();
});
