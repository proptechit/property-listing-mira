// Load all agents
let currentPage = 1;
const pageSize = 50;
let currentAgentsList = [];
let allBitrixUsers = null;
let isLoadingUsers = false;

async function loadAgents(page = 1) {
  try {
    currentPage = page;
    const response = await api(`/?resource=agents&page=${page}`);
    const data = response.data || [];
    currentAgentsList = data;
    const pagination = response.pagination || {};
    const tbody = document.getElementById("agentsList");
    const paginationContainer = document.getElementById("agentsPagination");

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-8 text-center text-gray-500">
            <div class="flex flex-col items-center justify-center">
              <i class="fa-solid fa-users text-3xl text-gray-300 mb-2"></i>
              <p class="text-sm font-medium text-gray-600">No agents found</p>
              <p class="text-xs text-gray-400 mt-0.5">Click "Add Agent" to add a Bitrix user as an agent.</p>
            </div>
          </td>
        </tr>
      `;
      if (paginationContainer) paginationContainer.innerHTML = "";
      return;
    }

    tbody.innerHTML = data
      .map((agent, index) => {
        const fullName =
          [agent.name, agent.last_name].filter(Boolean).join(" ") || "";
        const initials =
          fullName !== ""
            ? fullName
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")
                .toUpperCase()
                .substring(0, 2)
            : "A";

        // Handle photo URL
        let photoUrl = null;
        if (agent.photo) {
          if (
            agent.photo.startsWith("http://") ||
            agent.photo.startsWith("https://")
          ) {
            photoUrl = agent.photo;
          } else if (agent.photo.startsWith("/")) {
            photoUrl = agent.photo;
          } else if (!isNaN(agent.photo)) {
            photoUrl = null;
          } else {
            photoUrl = agent.photo;
          }
        }

        const isSuperAgent =
          agent.super_agent === true ||
          agent.super_agent === "1" ||
          agent.super_agent === "Y" ||
          agent.super_agent === 1;

        return `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="h-10 w-10 flex-shrink-0 relative">
                ${
                  photoUrl
                    ? `<img class="h-10 w-10 rounded-full object-cover border border-gray-200" src="${escapeHtml(photoUrl)}" alt="${escapeHtml(fullName)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                    : ""
                }
                <div class="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-sm ${photoUrl ? "hidden" : ""}">
                  ${initials}
                </div>
              </div>
              <div class="ml-4">
                <div class="flex items-center gap-1.5">
                  <div class="text-sm font-semibold text-gray-900">${escapeHtml(fullName)}</div>
                  ${
                    isSuperAgent
                      ? `
                    <span class="inline-flex items-center text-blue-600" title="Super Agent">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                    </span>
                  `
                      : ""
                  }
                </div>
                ${agent.position ? `<div class="text-xs text-gray-500">${escapeHtml(agent.position)}</div>` : ""}
              </div>
            </div>
          </td>

          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${
              agent.email
                ? `<a class="text-blue-600 hover:text-blue-800 transition-colors" href="mailto:${escapeHtml(agent.email)}">${escapeHtml(agent.email)}</a>`
                : '<span class="text-gray-400">-</span>'
            }
          </td>

          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${
              agent.phone
                ? `<a class="text-blue-600 hover:text-blue-800 transition-colors" href="tel:${escapeHtml(agent.phone)}">${escapeHtml(agent.phone)}</a>`
                : '<span class="text-gray-400">-</span>'
            }
          </td>

          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
            ${agent.branch ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">${escapeHtml(agent.branch)}</span>` : '<span class="text-gray-400">-</span>'}
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
            ${agent.pf_id ? escapeHtml(agent.pf_id) : '<span class="text-gray-400 font-sans">-</span>'}
          </td>

          <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
            ${agent.bayut_id ? escapeHtml(agent.bayut_id) : '<span class="text-gray-400 font-sans">-</span>'}
          </td>

          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <button onclick="editAgentByIndex(${index})"
                class="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-colors px-2 py-1 rounded hover:bg-blue-50">
              <i class="fa-solid fa-pen-to-square text-xs"></i>
              <span>Edit</span>
            </button>
          </td>
        </tr>
      `;
      })
      .join("");

    if (paginationContainer && pagination.total && pagination.total > 0) {
      renderPagination(paginationContainer, pagination, loadAgents);
    } else if (paginationContainer) {
      paginationContainer.innerHTML = "";
    }
  } catch (error) {
    console.error("Error loading agents:", error);
    const tbody = document.getElementById("agentsList");
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-4 text-center text-red-500">Error loading agents. Please try again.</td>
      </tr>
    `;
  }
}

// Fetch all Bitrix users for manual addition
async function fetchBitrixUsers() {
  if (allBitrixUsers !== null) return allBitrixUsers;
  if (isLoadingUsers) return [];

  isLoadingUsers = true;
  try {
    const res = await api("/?resource=agents&all_users=true");
    allBitrixUsers = res.data || [];
    return allBitrixUsers;
  } catch (err) {
    console.error("Failed to load Bitrix users:", err);
    return [];
  } finally {
    isLoadingUsers = false;
  }
}

// Modal open/close controls
function openAddAgentModal() {
  const modal = document.getElementById("agentModal");
  const form = document.getElementById("agentForm");
  const title = document.getElementById("agentModalTitle");
  const saveBtnText = document.getElementById("saveAgentBtnText");

  title.textContent = "Add Agent";
  saveBtnText.textContent = "Save Agent";
  form.reset();
  clearSelectedUser();
  hideUserSelectError();

  modal.classList.remove("hidden");
  modal.style.display = "flex";

  // Preload users if not yet loaded
  fetchBitrixUsers().then(() => {
    const input = document.getElementById("userSearchInput");
    if (input) input.focus();
  });
}

function editAgentByIndex(index) {
  const agent = currentAgentsList[index];
  if (!agent) return;

  const modal = document.getElementById("agentModal");
  const title = document.getElementById("agentModalTitle");
  const saveBtnText = document.getElementById("saveAgentBtnText");

  title.textContent = "Edit Agent";
  saveBtnText.textContent = "Update Agent";

  // Select user
  selectBitrixUser({
    id: agent.id,
    name: agent.name,
    last_name: agent.last_name,
    email: agent.email,
    photo: agent.photo,
    branch: agent.branch,
    position: agent.position,
    pf_id: agent.pf_id,
    bayut_id: agent.bayut_id,
    super_agent: agent.super_agent,
  });

  document.getElementById("pfPublicProfileId").value = agent.pf_id || "";
  document.getElementById("bayutUserId").value = agent.bayut_id || "";
  
  const isSuper =
    agent.super_agent === true ||
    agent.super_agent === "1" ||
    agent.super_agent === "Y" ||
    agent.super_agent === 1;
  document.getElementById("isSuperAgent").checked = isSuper;

  hideUserSelectError();
  modal.classList.remove("hidden");
  modal.style.display = "flex";
}

function closeAgentModal() {
  const modal = document.getElementById("agentModal");
  modal.classList.add("hidden");
  modal.style.display = "none";
  clearSelectedUser();
  hideUserSelectError();
}

// Selected User helpers
function selectBitrixUser(user) {
  const hiddenId = document.getElementById("agentUserId");
  const searchContainer = document.getElementById("userSearchContainer");
  const selectedCard = document.getElementById("selectedUserCard");
  const userNameEl = document.getElementById("selectedUserName");
  const userEmailEl = document.getElementById("selectedUserEmail");
  const userBranchEl = document.getElementById("selectedUserBranch");
  const avatarEl = document.getElementById("selectedUserAvatar");
  const resultsEl = document.getElementById("userSearchResults");

  hiddenId.value = user.id;

  const fullName = [user.name, user.last_name].filter(Boolean).join(" ") || "Unknown User";
  userNameEl.textContent = fullName;
  userEmailEl.textContent = user.email || "No email";
  userBranchEl.textContent = user.branch || user.position || "";

  const initials = fullName
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2) || "U";

  if (user.photo && (user.photo.startsWith("http") || user.photo.startsWith("/"))) {
    avatarEl.innerHTML = `<img src="${escapeHtml(user.photo)}" alt="${escapeHtml(fullName)}" class="h-full w-full object-cover">`;
  } else {
    avatarEl.innerHTML = initials;
  }

  searchContainer.classList.add("hidden");
  selectedCard.classList.remove("hidden");
  selectedCard.classList.add("flex");
  resultsEl.classList.add("hidden");
  hideUserSelectError();

  // If user has existing PF ID or Bayut ID, pre-fill them
  const pfInput = document.getElementById("pfPublicProfileId");
  const bayutInput = document.getElementById("bayutUserId");
  const superInput = document.getElementById("isSuperAgent");

  if (user.pf_id && !pfInput.value) {
    pfInput.value = user.pf_id;
  }
  if (user.bayut_id && !bayutInput.value) {
    bayutInput.value = user.bayut_id;
  }
  if (user.super_agent !== undefined && user.super_agent !== null) {
    const isSuper =
      user.super_agent === true ||
      user.super_agent === "1" ||
      user.super_agent === "Y" ||
      user.super_agent === 1;
    superInput.checked = isSuper;
  }
}

function clearSelectedUser() {
  document.getElementById("agentUserId").value = "";
  const searchContainer = document.getElementById("userSearchContainer");
  const selectedCard = document.getElementById("selectedUserCard");
  const searchInput = document.getElementById("userSearchInput");

  selectedCard.classList.add("hidden");
  selectedCard.classList.remove("flex");
  searchContainer.classList.remove("hidden");
  searchInput.value = "";
  document.getElementById("userSearchResults").classList.add("hidden");
}

function showUserSelectError() {
  const err = document.getElementById("userSelectError");
  if (err) err.classList.remove("hidden");
}

function hideUserSelectError() {
  const err = document.getElementById("userSelectError");
  if (err) err.classList.add("hidden");
}

// Decode HTML entities
function decodeHtml(html) {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Setup Modal interactions & search
function initAgentModal() {
  const searchInput = document.getElementById("userSearchInput");
  const resultsContainer = document.getElementById("userSearchResults");
  const form = document.getElementById("agentForm");

  // Search input handler
  if (searchInput) {
    let debounceTimer;

    const performSearch = async () => {
      const q = searchInput.value.trim().toLowerCase();

      // Only search and show dropdown when user has typed something
      if (!q) {
        if (resultsContainer) {
          resultsContainer.innerHTML = "";
          resultsContainer.classList.add("hidden");
        }
        return;
      }

      const users = await fetchBitrixUsers();
      const filtered = users.filter((u) => {
        const name = `${u.name || ""} ${u.last_name || ""}`.toLowerCase();
        const email = (u.email || "").toLowerCase();
        const pos = (u.position || "").toLowerCase();
        const branch = (u.branch || "").toLowerCase();
        return name.includes(q) || email.includes(q) || pos.includes(q) || branch.includes(q);
      });

      renderSearchResults(filtered.slice(0, 15));
    };

    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(performSearch, 150);
    });

    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim().length > 0) {
        performSearch();
      }
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && resultsContainer) {
        resultsContainer.classList.add("hidden");
      }
    });
  }

  function renderSearchResults(users) {
    if (!resultsContainer) return;

    if (users.length === 0) {
      resultsContainer.innerHTML = `
        <div class="px-4 py-3 text-xs text-gray-500 text-center">
          No Bitrix users found matching your search.
        </div>
      `;
      resultsContainer.classList.remove("hidden");
      return;
    }

    resultsContainer.innerHTML = users
      .map((u) => {
        const name = decodeHtml(u.name || "");
        const lastName = decodeHtml(u.last_name || "");
        const fullName = [name, lastName].filter(Boolean).join(" ") || "Unknown";
        const initials = fullName
          .split(" ")
          .map((n) => n.charAt(0))
          .join("")
          .toUpperCase()
          .substring(0, 2) || "U";

        const photoHtml = u.photo && (u.photo.startsWith("http") || u.photo.startsWith("/"))
          ? `<img src="${escapeHtml(u.photo)}" class="h-8 w-8 rounded-full object-cover">`
          : `<div class="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-xs">${initials}</div>`;

        return `
          <div class="user-search-item px-3 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors"
               data-user='${escapeHtml(JSON.stringify(u))}'>
            <div class="flex-shrink-0">
              ${photoHtml}
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-gray-900 truncate">${escapeHtml(fullName)}</div>
              <div class="text-xs text-gray-500 truncate">${escapeHtml(u.email || "No email")} ${u.branch ? `• ${escapeHtml(u.branch)}` : ""}</div>
            </div>
            ${
              u.pf_id || u.bayut_id
                ? `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">Has Portal ID</span>`
                : ""
            }
          </div>
        `;
      })
      .join("");

    resultsContainer.classList.remove("hidden");

    // Add click listeners to results
    resultsContainer.querySelectorAll(".user-search-item").forEach((item) => {
      item.addEventListener("click", () => {
        try {
          const user = JSON.parse(item.getAttribute("data-user"));
          selectBitrixUser(user);
        } catch (e) {
          console.error("Error selecting user:", e);
        }
      });
    });
  }

  // Click outside to hide search dropdown
  document.addEventListener("click", (e) => {
    if (
      resultsContainer &&
      !resultsContainer.contains(e.target) &&
      searchInput &&
      !searchInput.contains(e.target)
    ) {
      resultsContainer.classList.add("hidden");
    }
  });

  // Form submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const userId = document.getElementById("agentUserId").value;
      if (!userId) {
        showUserSelectError();
        return;
      }

      const pfId = document.getElementById("pfPublicProfileId").value.trim();
      const bayutId = document.getElementById("bayutUserId").value.trim();
      const isSuper = document.getElementById("isSuperAgent").checked;

      const saveBtn = document.getElementById("saveAgentBtn");
      const saveBtnText = document.getElementById("saveAgentBtnText");
      const originalText = saveBtnText.textContent;

      try {
        saveBtn.disabled = true;
        saveBtnText.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Saving...`;

        const res = await api("/?resource=agents", {
          method: "POST",
          body: {
            user_id: parseInt(userId, 10),
            pf_id: pfId,
            bayut_id: bayutId,
            super_agent: isSuper,
          },
        });

        closeAgentModal();
        showStatusAlert("success", res.message || "Agent saved successfully!");
        loadAgents(currentPage);

        // Invalidate cached Bitrix users so next add shows updated values
        allBitrixUsers = null;
      } catch (err) {
        console.error("Error saving agent:", err);
        const errMsg = err.error || err.message || "Failed to save agent profile.";
        alert(`Error saving agent: ${errMsg}`);
      } finally {
        saveBtn.disabled = false;
        saveBtnText.textContent = originalText;
      }
    });
  }
}

// Sync portal user accounts with Bitrix by email
async function syncPortalUsers() {
  const confirmed = confirm(
    "Sync PF and Bayut user accounts with Bitrix based on email?\n\nThis will synchronize users from Property Finder and Bayut across all branches (main, st1, st2, st3, st4, st5, po, eva)."
  );
  if (!confirmed) return;

  const btn = document.getElementById("syncUsersBtn");
  const icon = document.getElementById("syncUsersIcon");
  const text = document.getElementById("syncUsersText");

  const originalText = text.textContent;

  try {
    btn.disabled = true;
    icon.classList.add("fa-spin");
    text.textContent = "Syncing Users...";
    showStatusAlert("info", "Syncing Property Finder and Bayut users across all branches... Please wait.");

    const res = await api("/?resource=agents&action=sync-portal-users", {
      method: "POST",
    });

    if (res && res.success) {
      showStatusAlert(
        "success",
        res.message || "Portal user accounts synced with Bitrix by email successfully!"
      );
      loadAgents(currentPage);
      // Invalidate cached Bitrix users
      allBitrixUsers = null;
    } else {
      const errMsg = (res && res.error) ? res.error : "Sync completed with issues.";
      showStatusAlert("warning", errMsg);
    }
  } catch (err) {
    console.error("Sync error:", err);
    const errMsg = err.error || err.message || "Failed to sync portal user accounts.";
    showStatusAlert("error", `Sync failed: ${errMsg}`);
  } finally {
    btn.disabled = false;
    icon.classList.remove("fa-spin");
    text.textContent = originalText;
  }
}

// Alert banner helper
function showStatusAlert(type, message) {
  const alert = document.getElementById("statusAlert");
  const icon = document.getElementById("statusAlertIcon");
  const msg = document.getElementById("statusAlertMessage");

  if (!alert || !icon || !msg) return;

  alert.className = "mb-6 rounded-lg p-4 transition-all duration-300 border block";

  if (type === "success") {
    alert.classList.add("bg-emerald-50", "border-emerald-200", "text-emerald-800");
    icon.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>`;
  } else if (type === "info") {
    alert.classList.add("bg-blue-50", "border-blue-200", "text-blue-800");
    icon.innerHTML = `<i class="fa-solid fa-circle-info text-blue-600 text-lg"></i>`;
  } else if (type === "warning") {
    alert.classList.add("bg-amber-50", "border-amber-200", "text-amber-800");
    icon.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber-600 text-lg"></i>`;
  } else {
    alert.classList.add("bg-red-50", "border-red-200", "text-red-800");
    icon.innerHTML = `<i class="fa-solid fa-circle-exclamation text-red-600 text-lg"></i>`;
  }

  msg.textContent = message;
  alert.classList.remove("hidden");

  // Auto hide success/info after 6 seconds
  if (type === "success" || type === "info") {
    setTimeout(() => {
      hideStatusAlert();
    }, 6000);
  }
}

function hideStatusAlert() {
  const alert = document.getElementById("statusAlert");
  if (alert) alert.classList.add("hidden");
}

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
      const targetPage = parseInt(button.getAttribute("data-page"), 10);
      if (targetPage && !button.disabled) {
        loadFunction(targetPage);
      }
    });
  });
}
