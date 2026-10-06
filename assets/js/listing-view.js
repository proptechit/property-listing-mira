function qs(el) {
  return document.querySelector(el);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

// Fallback placeholder when listings have no images
const PLACEHOLDER_IMAGE = "https://placehold.co/800x600?text=No+Image";

const BRANCH_LABELS = {
  main: "Main",
  st1: "ST1",
  st2: "ST2",
  st3: "ST3",
  st4: "ST4",
  st5: "ST5",
  po: "PO",
  eva: "Eva",
};

function formatPrice(price) {
  const n = Number(price || 0);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function prettyLabel(v) {
  const str = String(v ?? "")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
  return str === 'Gcc' ? 'GCC' : str;
}

function getImageUrl(img) {
  if (!img) return "";
  if (typeof img === "string") return img;
  return (
    img.urlMachine ||
    img.url ||
    img.downloadUrl ||
    img.previewUrl ||
    img.href ||
    ""
  );
}

function buildDetailRow(label, value, icon = null) {
  const v =
    value !== undefined && value !== null && String(value).trim() !== "";

  return `
    <div class="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-b-0">
      <div class="flex items-center gap-2 text-md font-semibold text-slate-500">
        ${icon ? `<i class="fa-solid ${icon} text-slate-400"></i>` : ""}
        <span>${escapeHtml(label)}</span>
      </div>
      <div class="text-md font-bold text-slate-800 text-right">
        ${v ? escapeHtml(String(value)) : "-"}
      </div>
    </div>
  `;
}

function formatDate(dateString) {
  if (!dateString) return "-";
  let str = String(dateString).trim();
  if (!str) return "-";
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(str)) {
    str = str.replace(" ", "T");
  }
  const date = new Date(str);
  if (isNaN(date.getTime())) return escapeHtml(str);

  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDateOnly(dateString) {
  if (!dateString || dateString === "N") return "-";
  let str = String(dateString).trim();
  if (!str || str === "N") return "-";
  const dateOnly = str.split("T")[0].split(" ")[0];
  const parts = dateOnly.split("-");
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }
  }
  return escapeHtml(dateOnly);
}

function buildDetailRowHtml(label, html, icon = null) {
  const has = html !== undefined && html !== null && String(html).trim() !== "";
  const iconClass = icon ? (icon.includes("fa-") ? icon : `fa-solid ${icon}`) : "";
  return `
    <div class="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-b-0">
      <div class="flex items-center gap-2 text-md font-semibold text-slate-500">
        ${icon ? `<i class="${iconClass} text-slate-400"></i>` : ""}
        <span>${escapeHtml(label)}</span>
      </div>
      <div class="text-md font-bold text-slate-800 text-right">${has ? html : "-"}</div>
    </div>
  `;
}

function buildPill(label, tone = "slate") {
  const toneMap = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-amber-50 text-amber-700",
    red: "bg-rose-50 text-rose-700",
  };
  const cls = toneMap[tone] || toneMap.slate;
  return `<span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase ${cls}">${escapeHtml(
    label,
  )}</span>`;
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  const urls = images.map(getImageUrl).filter(Boolean);
  // de-dupe
  return [...new Set(urls)];
}

function renderListingDetails(container, listing) {
  const images = normalizeImages(listing?.images);
  const mainImage = images[0] || PLACEHOLDER_IMAGE;
  const otherImages = images.slice(1);

  const title = listing?.title || "Listing";
  const reference = listing?.reference || "";

  const priceType = listing?.price_type ? prettyLabel(listing.price_type) : "";
  const price = listing?.price ? `AED ${formatPrice(listing.price)}` : "-";

  const sizeUnit = listing?.size_unit ? prettyLabel(listing.size_unit) : "sqft";
  const size =
    listing?.size !== undefined &&
    listing?.size !== null &&
    listing?.size !== ""
      ? `${listing.size} ${sizeUnit}`
      : "-";

  const propertyType =
    listing?.property_type_pf || listing?.property_type_bayut || "-";

  const location =
    typeof listing?.location === "string"
      ? listing.location
      : listing?.location?.name;

  const agent = listing?.listing_agent
    ? typeof listing.listing_agent === "object"
      ? listing.listing_agent.name
      : listing.listing_agent
    : "-";

  const ownerObj = listing?.listing_owner;
  let ownerName = "-";
  let ownerId = null;
  let ownerPhone = null;

  if (ownerObj) {
    if (typeof ownerObj === "object") {
      ownerName = ownerObj.name || String(ownerObj.id || "-");
      ownerId = ownerObj.id || null;
      ownerPhone = ownerObj.phone || null;
    } else {
      ownerName = String(ownerObj);
      if (!isNaN(ownerObj) && Number(ownerObj) > 0) {
        ownerId = ownerObj;
      }
    }
  }

  let ownerHtml = escapeHtml(ownerName);
  if (ownerId) {
    const bitrixProfileUrl = `https://crm.mira-international.com/company/personal/user/${encodeURIComponent(ownerId)}/`;
    ownerHtml = `<a href="${escapeHtml(bitrixProfileUrl)}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline font-bold transition inline-flex items-center gap-1 justify-end">${escapeHtml(ownerName)} <i class="fa-solid fa-arrow-up-right-from-square text-xs text-blue-400"></i></a>`;
  }

  const cleanPhone = ownerPhone ? String(ownerPhone).replace(/\D/g, "") : null;
  let ownerWhatsappHtml = '<span class="text-slate-400 font-normal">Not available</span>';
  if (cleanPhone) {
    const waUrl = `https://wa.me/${encodeURIComponent(cleanPhone)}`;
    ownerWhatsappHtml = `<a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold transition"><i class="fa-brands fa-whatsapp text-lg text-emerald-500"></i> ${escapeHtml(ownerPhone)}</a>`;
  }

  const developer = listing?.developer
    ? typeof listing.developer === "object"
      ? listing.developer.name
      : listing.developer
    : "-";

  const desc = listing?.description_en || listing?.description_ar || "";

  const status = listing?.status ? prettyLabel(listing.status) : "";

  const pills = [
    status ? buildPill(status, "blue") : "",
    listing?.purpose ? buildPill(prettyLabel(listing.purpose), "slate") : "",
    listing?.category ? buildPill(prettyLabel(listing.category), "slate") : "",
    listing?.project_status
      ? buildPill(prettyLabel(listing.project_status), "slate")
      : "",
    listing?.furnishing_type
      ? buildPill(prettyLabel(listing.furnishing_type), "slate")
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const amenitiesPf = Array.isArray(listing?.amenities_pf)
    ? listing.amenities_pf.map(prettyLabel)
    : [];
  const amenitiesBayut = Array.isArray(listing?.amenities_bayut)
    ? listing.amenities_bayut.map(prettyLabel)
    : [];

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="relative bg-slate-100">
            <img id="listingMainImage" src="${escapeHtml(
              mainImage,
            )}" class="w-full h-[320px] sm:h-[420px] object-cover" alt="${escapeHtml(
              title,
            )}">
            <div class="absolute top-4 left-4 flex flex-wrap gap-2">${pills}</div>
          </div>

          <div class="p-4 border-t border-slate-200">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-lg font-bold text-slate-800">${escapeHtml(title)}</div>
                <div class="text-md text-slate-500">${reference ? escapeHtml(reference) : ""}</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-extrabold text-slate-800">${escapeHtml(price)}</div>
                <div class="text-md text-slate-500">${escapeHtml(priceType)}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2 text-lg font-bold text-slate-800">
              <i class="fa-solid fa-align-left text-slate-400"></i>
              Description
            </div>
          </div>
          <div class="text-md text-slate-700 leading-relaxed whitespace-pre-line">${
            desc
              ? escapeHtml(desc)
              : '<span class="text-slate-400">No description provided.</span>'
          }</div>
        </div>
      </div>

      <div class="lg:col-span-5 space-y-4">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="text-lg font-bold text-slate-800">Key details</div>
            <div class="text-xs text-slate-400 font-semibold">ID: ${escapeHtml(
              String(listing?.id ?? ""),
            )}</div>
          </div>
          <div class="space-y-0">
            ${buildDetailRow("Type", prettyLabel(propertyType), "fa-house")}
            ${buildDetailRow("Bedrooms", (listing?.bedrooms == 0 && listing?.bedrooms !== null && listing?.bedrooms !== "") ? "Studio" : listing?.bedrooms, "fa-bed")}
            ${buildDetailRow("Bathrooms", (listing?.bathrooms == 0 && listing?.bathrooms !== null && listing?.bathrooms !== "") ? "None" : listing?.bathrooms, "fa-bath")}
            ${buildDetailRow("Size", size, "fa-ruler-combined")}
            ${buildDetailRow("Location", location, "fa-location-dot")}
            ${buildDetailRow("Agent", agent, "fa-user-tie")}
            ${buildDetailRow("Branch", listing?.branch ? (BRANCH_LABELS[String(listing.branch).toLowerCase()] || listing.branch) : "", "fa-code-branch")}
            ${buildDetailRowHtml("Owner", ownerHtml, "fa-id-card")}
            ${buildDetailRowHtml("Owner WhatsApp", ownerWhatsappHtml, "fa-brands fa-whatsapp text-emerald-500")}
            ${buildDetailRow("Developer", developer, "fa-helmet-safety")}
            ${buildDetailRow("Ownership", listing?.ownership ? prettyLabel(listing.ownership) : "", "fa-key")}
            ${buildDetailRow("Available From", listing?.available_from ? formatDateOnly(listing.available_from) : "", "fa-calendar-days")}
            ${buildDetailRow("Created At", formatDate(listing?.created_at), "fa-clock")}
            ${buildDetailRow("Updated At", formatDate(listing?.updated_at), "fa-clock")}
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2 text-lg font-bold text-slate-800">
              <i class="fa-solid fa-cloud-arrow-up text-slate-400"></i>
              <span>Portal Sync Dates</span>
            </div>            
          </div>

          <div class="space-y-4">
            <!-- Property Finder -->
            <div class="border border-slate-100 rounded-xl p-3.5 bg-slate-50/60">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <img src="./assets/images/propertyfinder.webp" alt="Property Finder" class="w-4 h-4 object-contain" />
                  Property Finder
                </div>
                ${
                  listing?.propertyfinder_id
                    ? `<a href="https://propertyfinder.ae/go/${escapeHtml(listing.propertyfinder_id)}" target="_blank" class="text-xs text-blue-600 hover:underline font-bold inline-flex items-center gap-1">
                        ID: ${escapeHtml(listing.propertyfinder_id)} <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                      </a>`
                    : '<span class="text-xs text-slate-400 font-medium">No ID</span>'
                }
              </div>
              <div class="space-y-0 text-sm">
                ${buildDetailRow("Created At", formatDate(listing?.pf_created_at), "fa-calendar-plus")}
                ${buildDetailRow("Updated At", formatDate(listing?.pf_updated_at), "fa-clock-rotate-left")}
              </div>
            </div>

            <!-- Bayut -->
            <div class="border border-slate-100 rounded-xl p-3.5 bg-slate-50/60">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <img src="./assets/images/bayut.png" alt="Bayut" class="w-4 h-4 object-contain" />
                  Bayut
                </div>
                ${
                  listing?.bayut_id
                    ? `<a href="https://www.bayut.com/property/details-${escapeHtml(listing.bayut_id)}.html" target="_blank" class="text-xs text-blue-600 hover:underline font-bold inline-flex items-center gap-1">
                        ID: ${escapeHtml(listing.bayut_id)} <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                      </a>`
                    : '<span class="text-xs text-slate-400 font-medium">No ID</span>'
                }
              </div>
              <div class="space-y-0 text-sm">
                ${buildDetailRow("Created At", formatDate(listing?.bayut_created_at), "fa-calendar-plus")}
                ${buildDetailRow("Updated At", formatDate(listing?.bayut_updated_at), "fa-clock-rotate-left")}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div class="text-lg font-bold text-slate-800 mb-4">More details</div>
          <div class="space-y-0">
            ${buildDetailRow("Emirate", listing?.emirate ? prettyLabel(listing.emirate) : "", "fa-map")}
            ${
              listing?.is_unit_restricted || listing?.unit_number === "***"
                ? buildDetailRowHtml(
                    "Unit number",
                    `<span class="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg text-xs font-bold border border-amber-200/60" title="Visible only to listing owner and their admins"><i class="fa-solid fa-lock text-[10px]"></i> Restricted (***)</span>`,
                    "fa-door-closed"
                  )
                : buildDetailRow("Unit number", listing?.unit_number, "fa-door-closed")
            }
            ${buildDetailRow("Floor", listing?.floor_number, "fa-layer-group")}
            ${buildDetailRow("Parking slots", listing?.parking_slots, "fa-square-parking")}
            ${buildDetailRow("Total floors", listing?.total_floors, "fa-building")}
            ${buildDetailRow("Elevators", listing?.elevators, "fa-elevator")}
            ${buildDetailRow("Advertisement no.", listing?.advertisement_number, "fa-hashtag")}
            ${buildDetailRow("Compliance", listing?.compliance_type ? prettyLabel(listing.compliance_type) : "", "fa-file-signature")}
            ${
              listing?.brochure_url
                ? buildDetailRowHtml(
                    "Brochure",
                    `<a class="text-blue-600 hover:text-blue-700 font-bold" target="_blank" href="${escapeHtml(
                      listing.brochure_url + "&user_id=" + USER_ID,
                    )}">Open</a>`,
                  )
                : ""
            }
          </div>
        </div>

        ${
          amenitiesPf.length || amenitiesBayut.length
            ? `
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div class="text-lg font-bold text-slate-800 mb-4">Amenities</div>
            ${
              amenitiesPf.length
                ? `
              <div class="mb-4">
                <div class="text-md font-semibold text-slate-500 mb-2">PropertyFinder</div>
                <div class="flex flex-wrap gap-2">
                  ${amenitiesPf
                    .slice(0, 30)
                    .map((a) => buildPill(a, "slate"))
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
            ${
              amenitiesBayut.length
                ? `
              <div>
                <div class="text-md font-semibold text-slate-500 mb-2">Bayut</div>
                <div class="flex flex-wrap gap-2">
                  ${amenitiesBayut
                    .slice(0, 30)
                    .map((a) => buildPill(a, "slate"))
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
          </div>
        `
            : ""
        }
      </div>
    </div>

    <div class="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2 text-lg font-bold text-slate-800">
          <i class="fa-solid fa-images text-slate-400"></i>
          Gallery
          ${
            listing?.watermark_bayut === true ||
            listing?.watermark_bayut === "Y" ||
            listing?.watermark_bayut === 1 ||
            listing?.watermark_bayut === "1"
              ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <i class="fa-solid fa-stamp text-[10px]"></i> Bayut Watermark
                </span>`
              : ""
          }
          ${
            listing?.watermark_pf === true ||
            listing?.watermark_pf === "Y" ||
            listing?.watermark_pf === 1 ||
            listing?.watermark_pf === "1"
              ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  <i class="fa-solid fa-stamp text-[10px]"></i> PF Watermark
                </span>`
              : ""
          }
        </div>
        <div class="text-md text-slate-500 font-semibold">${images.length} image${
          images.length === 1 ? "" : "s"
        }</div>
      </div>

      ${
        otherImages.length
          ? `
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          ${otherImages
            .map(
              (url) => `
            <button type="button" class="group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:ring-2 hover:ring-blue-500 transition" data-thumb="${escapeHtml(
              url,
            )}">
              <img src="${escapeHtml(
                url,
              )}" class="w-full h-48 object-cover group-hover:scale-[1.02] transition" alt="Listing image">
            </button>
          `,
            )
            .join("")}
        </div>
      `
          : `<div class="text-md text-slate-400">No additional images.</div>`
      }
    </div>
  `;

  // allow brochure row HTML (already escaped above for URL)
  container.querySelectorAll("a").forEach((a) => {
    a.rel = "noopener noreferrer";
  });

  // thumbnails -> main image
  const mainImgEl = qs("#listingMainImage");
  container.querySelectorAll("[data-thumb]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = btn.getAttribute("data-thumb");
      if (mainImgEl && url) mainImgEl.src = url;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

async function loadListingDetails(id) {
  const container = qs("#listingDetails");
  if (!container) return;

  try {
    container.innerHTML = `
      <div class="animate-pulse">
        <div class="h-5 bg-slate-200 rounded w-1/2 mb-3"></div>
        <div class="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
        <div class="h-4 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div class="h-[420px] bg-slate-200 rounded-2xl mb-6"></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="h-40 bg-slate-200 rounded-2xl"></div>
          <div class="h-40 bg-slate-200 rounded-2xl"></div>
          <div class="h-40 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    `;

    const listing = await api(
      `/?resource=listings&id=${encodeURIComponent(id)}&track_view=1`,
    );

    // Hide edit button for non-admin
    const editBtn = qs("#editListingBtn");
    if (editBtn) {
      const isOwner = listing?.listing_owner?.id == USER_ID;
      const isAgent = listing?.listing_agent?.id == USER_ID;

      if (!(IS_ADMIN || isOwner || isAgent)) {
        editBtn.classList.add("hidden");
      }
    }

    wireActionButtons(id, listing?.reference || "");
    renderListingDetails(container, listing);

    if (IS_ADMIN) {
      loadListingActivityLogs(id);
    }
  } catch (err) {
    container.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm border border-rose-200 p-6">
        <div class="text-lg font-bold text-rose-700">Failed to load listing</div>
        <div class="text-md text-rose-600 mt-1">${escapeHtml(
          err?.error || err?.message || "Unknown error",
        )}</div>
      </div>
    `;
  }
}

function openRefreshListingModal(id, currentRef = "") {
  const modal = qs("#refreshListingModal");
  const idInput = qs("#refreshListingId");
  const refInput = qs("#refreshReferenceInput");
  const submitBtn = qs("#submitRefreshModalBtn");

  if (!modal || !idInput || !refInput) return;

  idInput.value = id || "";
  refInput.value = currentRef || "";

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i><span>Save & Refresh</span>';
  }

  modal.classList.remove("hidden");
  modal.style.display = "flex";

  setTimeout(() => {
    refInput.focus();
    refInput.select();
  }, 50);
}

function closeRefreshListingModal() {
  const modal = qs("#refreshListingModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.style.display = "none";
}

function wireRefreshModal(id) {
  const modal = qs("#refreshListingModal");
  const form = qs("#refreshListingForm");
  const closeBtn = qs("#closeRefreshModalBtn");
  const cancelBtn = qs("#cancelRefreshModalBtn");

  if (closeBtn) closeBtn.addEventListener("click", closeRefreshListingModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeRefreshListingModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeRefreshListingModal();
    });
  }

  if (form && !form.dataset.wired) {
    form.dataset.wired = "true";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const listingId = qs("#refreshListingId")?.value || id;
      const ref = qs("#refreshReferenceInput")?.value?.trim();
      const submitBtn = qs("#submitRefreshModalBtn");

      if (!listingId) {
        alert("Listing ID is missing");
        return;
      }
      if (!ref) {
        alert("Please enter a reference number.");
        qs("#refreshReferenceInput")?.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Saving & Refreshing...</span>';
      }

      try {
        const response = await api(`/?resource=listings&action=refresh&id=${encodeURIComponent(listingId)}`, {
          method: "POST",
          body: { reference: ref },
        });

        closeRefreshListingModal();

        if (response && response.success) {
          alert(`Listing reference saved (${response.reference || ref}) and refresh workflow started successfully!`);
          loadListingDetails(listingId);
        } else {
          alert("Listing refreshed.");
          loadListingDetails(listingId);
        }
      } catch (error) {
        console.error("Refresh listing error:", error);
        alert("Error refreshing listing: " + (error.message || "Unknown error"));
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i><span>Save & Refresh</span>';
        }
      }
    });
  }
}

function wireActionButtons(id, currentReference = "") {
  wireRefreshModal(id);

  const refreshBtn = qs("#refreshListingBtn");
  if (refreshBtn && !refreshBtn.dataset.wired) {
    refreshBtn.dataset.wired = "true";
    refreshBtn.addEventListener("click", () => {
      openRefreshListingModal(id, currentReference);
    });
  }

  const dupBtn = qs("#duplicateListingBtn");
  if (dupBtn && !dupBtn.dataset.wired) {
    dupBtn.dataset.wired = "true";
    dupBtn.addEventListener("click", async () => {
      if (!confirm("Are you sure you want to duplicate this listing?")) {
        return;
      }

      const overlay = document.createElement("div");
      overlay.id = "dupLoadingOverlay";
      overlay.className = "fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center backdrop-blur-sm";
      overlay.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
          <div class="inline-block animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <h3 class="text-lg font-bold text-slate-800">Duplicating Listing</h3>
          <p class="text-sm text-slate-500 mt-1">Starting duplicate workflow... Please wait.</p>
        </div>
      `;
      document.body.appendChild(overlay);

      try {
        const res = await api(`/?resource=listings&action=duplicate&id=${encodeURIComponent(id)}`, {
          method: "POST",
        });

        overlay.remove();

        if (res && res.success) {
          alert("Duplicate listing workflow started successfully! The duplicated listing will appear shortly in your listings list.");
          window.location.href = "?page=listings&action=list";
        } else {
          alert("Duplication initiated.");
          window.location.href = "?page=listings&action=list";
        }
      } catch (err) {
        overlay.remove();
        console.error("Duplicate listing error:", err);
        alert("Error duplicating listing: " + (err.message || "Unknown error"));
      }
    });
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeRefreshListingModal();
  }
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin-Only Activity History Component for Single Listing View
 * ─────────────────────────────────────────────────────────────────────────────
 */

let _cachedListingLogs = [];
let _currentLogsFilter = "all";

const ACTIVITY_ACTION_CONFIG = {
  created: {
    label: "Created",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconClass: "fa-solid fa-circle-plus text-emerald-600",
    dotClass: "bg-emerald-500",
  },
  updated: {
    label: "Updated",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    iconClass: "fa-solid fa-pen-to-square text-blue-600",
    dotClass: "bg-blue-500",
  },
  published: {
    label: "Published",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    iconClass: "fa-solid fa-circle-check text-teal-600",
    dotClass: "bg-teal-500",
  },
  unpublished: {
    label: "Unpublished",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    iconClass: "fa-solid fa-circle-pause text-amber-600",
    dotClass: "bg-amber-500",
  },
  deleted: {
    label: "Deleted",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    iconClass: "fa-solid fa-trash-can text-rose-600",
    dotClass: "bg-rose-500",
  },
  viewed: {
    label: "Viewed",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
    iconClass: "fa-solid fa-eye text-violet-600",
    dotClass: "bg-violet-500",
  },
  duplicated: {
    label: "Duplicated",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconClass: "fa-solid fa-clone text-indigo-600",
    dotClass: "bg-indigo-500",
  },
  refreshed: {
    label: "Refreshed",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    iconClass: "fa-solid fa-arrows-rotate text-sky-600",
    dotClass: "bg-sky-500",
  },
};

const LOG_AVATAR_COLORS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-cyan-500",
];

function getLogAvatarColor(str) {
  let hash = 0;
  for (let i = 0; i < (str || "").length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LOG_AVATAR_COLORS[Math.abs(hash) % LOG_AVATAR_COLORS.length];
}

function getLogInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
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

function formatLogTimestamp(dateString) {
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

function formatLogFieldName(name) {
  return String(name || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function loadListingActivityLogs(id, forceReload = false) {
  if (!IS_ADMIN) return;

  const section = qs("#listingActivityLogsSection");
  if (!section) return;

  section.classList.remove("hidden");

  if (forceReload || _cachedListingLogs.length === 0) {
    section.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <div class="h-5 bg-slate-200 rounded w-40 animate-pulse"></div>
              <div class="h-3 bg-slate-100 rounded w-64 mt-1.5 animate-pulse"></div>
            </div>
          </div>
          <div class="h-8 bg-slate-100 rounded-xl w-24 animate-pulse"></div>
        </div>
        <div class="space-y-4">
          <div class="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
          <div class="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
          <div class="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
        </div>
      </div>
    `;

    try {
      const res = await api(
        `/?resource=activity-logs&listing_id=${encodeURIComponent(id)}&limit=100`
      );
      _cachedListingLogs = res?.items || [];
    } catch (err) {
      console.error("Failed to load listing activity logs:", err);
      section.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center text-slate-500">
          <div class="text-sm font-semibold text-rose-600">Failed to load activity history</div>
          <div class="text-xs text-slate-400 mt-1">${escapeHtml(
            err?.error || err?.message || "Unknown error"
          )}</div>
        </div>
      `;
      return;
    }
  }

  renderListingActivitySection(section, _cachedListingLogs, _currentLogsFilter, id);
}

function renderListingActivitySection(container, logs, currentFilter, listingId) {
  // Filter logic
  const filtered = logs.filter((log) => {
    const a = String(log.action || "").toLowerCase();
    if (currentFilter === "edits") return a === "updated";
    if (currentFilter === "status") return a === "published" || a === "unpublished";
    if (currentFilter === "views") return a === "viewed";
    if (currentFilter === "workflows")
      return a === "created" || a === "refreshed" || a === "duplicated" || a === "deleted";
    return true; // 'all'
  });

  const totalAll = logs.length;
  const totalEdits = logs.filter((l) => l.action === "updated").length;
  const totalStatus = logs.filter((l) => l.action === "published" || l.action === "unpublished").length;
  const totalViews = logs.filter((l) => l.action === "viewed").length;
  const totalWorkflows = logs.filter(
    (l) => ["created", "refreshed", "duplicated", "deleted"].includes(l.action)
  ).length;

  container.innerHTML = `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-7">
      <!-- Section Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
            <i class="fa-solid fa-clock-rotate-left text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h2 class="text-lg font-bold text-slate-900">Activity History</h2>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                <i class="fa-solid fa-shield-halved text-[9px]"></i> Admin Only
              </span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                ${totalAll} ${totalAll === 1 ? "event" : "events"}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Chronological audit log of all changes, approvals, views, and automated workflows on this listing
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-center">
          <button id="refreshListingLogsBtn" type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs">
            <i class="fa-solid fa-arrows-rotate text-slate-400" id="refreshListingLogsIcon"></i>
            <span>Refresh</span>
          </button>
          <a href="?page=activity-logs&action=list&listing_id=${encodeURIComponent(listingId)}"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            <span>Global Logs</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
        </div>
      </div>

      <!-- Action Filter Pills -->
      <div class="flex flex-wrap items-center gap-1.5 pt-4 pb-5">
        <button type="button" data-act-filter="all"
          class="px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            currentFilter === "all"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }">
          All (${totalAll})
        </button>
        <button type="button" data-act-filter="edits"
          class="px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            currentFilter === "edits"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }">
          Edits & Updates (${totalEdits})
        </button>
        <button type="button" data-act-filter="status"
          class="px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            currentFilter === "status"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }">
          Status Changes (${totalStatus})
        </button>
        <button type="button" data-act-filter="views"
          class="px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            currentFilter === "views"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }">
          Views (${totalViews})
        </button>
        <button type="button" data-act-filter="workflows"
          class="px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            currentFilter === "workflows"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }">
          Workflows (${totalWorkflows})
        </button>
      </div>

      <!-- Timeline List -->
      ${
        filtered.length === 0
          ? `
        <div class="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-sm">
            <i class="fa-solid fa-inbox"></i>
          </div>
          <div class="text-sm font-semibold text-slate-700">No activity logs in this category</div>
          <p class="text-xs text-slate-400 mt-1">Try selecting a different filter above.</p>
        </div>
      `
          : `
        <div class="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          ${filtered
            .map((log) => {
              const action = String(log.action || "").toLowerCase();
              const cfg = ACTIVITY_ACTION_CONFIG[action] || {
                label: action,
                badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
                iconClass: "fa-solid fa-circle-info text-slate-500",
                dotClass: "bg-slate-400",
              };

              const userName = log.user_name || "System";
              const userRole = log.user_role || (log.user_id == 1 ? "Admin" : "Agent");
              const isAdmin = userRole.toLowerCase().includes("admin");
              const avatarColor = getLogAvatarColor(userName);
              const initials = getLogInitials(userName);

              const changes = log.changes;
              const hasDiff =
                changes &&
                typeof changes === "object" &&
                !Array.isArray(changes) &&
                Object.keys(changes).length > 0;

              return `
                <div class="relative group">
                  <!-- Timeline dot -->
                  <div class="absolute -left-[30px] sm:-left-[38px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-slate-200 group-hover:border-blue-500 flex items-center justify-center shadow-2xs transition-colors">
                    <span class="w-2 h-2 rounded-full ${cfg.dotClass}"></span>
                  </div>

                  <!-- Event Box -->
                  <div class="bg-slate-50/75 hover:bg-slate-50 rounded-xl border border-slate-200/80 p-4 transition-all hover:shadow-2xs">
                    <!-- Top Row -->
                    <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div class="flex items-center gap-2">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          cfg.badgeClass
                        }">
                          <i class="${cfg.iconClass} text-[10px]"></i>
                          <span>${escapeHtml(cfg.label)}</span>
                        </span>

                        <div class="flex items-center gap-1.5">
                          <span class="w-5 h-5 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                            ${initials}
                          </span>
                          <span class="text-xs font-bold text-slate-800">${escapeHtml(userName)}</span>
                          <span class="text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            isAdmin
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-slate-200 text-slate-700"
                          }">
                            ${escapeHtml(userRole)}
                          </span>
                          ${
                            log.user_id
                              ? `<span class="text-[10px] text-slate-400 font-mono">#${escapeHtml(
                                  String(log.user_id)
                                )}</span>`
                              : ""
                          }
                        </div>
                      </div>

                      <div class="text-right">
                        <span class="text-xs font-semibold text-slate-700">${timeAgo(
                          log.created_at
                        )}</span>
                        <span class="text-[10px] text-slate-400 block" title="${escapeHtml(
                          log.created_at || ""
                        )}">
                          ${formatLogTimestamp(log.created_at)}
                        </span>
                      </div>
                    </div>

                    <!-- Description -->
                    <p class="text-sm text-slate-700 font-medium">${escapeHtml(
                      log.description || "-"
                    )}</p>

                    <!-- Portals tag if present -->
                    ${
                      log.portals
                        ? `<div class="flex flex-wrap gap-1 mt-2">
                             ${String(log.portals)
                               .split(",")
                               .map(
                                 (p) => `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white text-slate-600 border border-slate-200">
                                   <i class="fa-solid fa-satellite-dish mr-1 text-[9px] text-slate-400"></i>${escapeHtml(
                                     p.trim()
                                   )}
                                 </span>`
                               )
                               .join("")}
                           </div>`
                        : ""
                    }

                    <!-- Expandable field changes diff -->
                    ${
                      hasDiff
                        ? `
                      <details class="mt-3 group/diff">
                        <summary class="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 select-none">
                          <i class="fa-solid fa-code-compare text-[10px]"></i>
                          <span>View ${Object.keys(changes).length} modified ${
                            Object.keys(changes).length === 1 ? "field" : "fields"
                          }</span>
                          <i class="fa-solid fa-chevron-down text-[9px] transition-transform group-open/diff:rotate-180 ml-1"></i>
                        </summary>
                        <div class="mt-2.5 pt-2.5 border-t border-slate-200/80 space-y-2">
                          ${Object.entries(changes)
                            .map(([k, d]) => {
                              const title = formatLogFieldName(k);
                              if (d && typeof d === "object" && ("old" in d || "new" in d)) {
                                const oldStr =
                                  d.old === null || d.old === ""
                                    ? "(empty)"
                                    : typeof d.old === "object"
                                    ? JSON.stringify(d.old)
                                    : String(d.old);
                                const newStr =
                                  d.new === null || d.new === ""
                                    ? "(empty)"
                                    : typeof d.new === "object"
                                    ? JSON.stringify(d.new)
                                    : String(d.new);

                                return `
                                  <div class="bg-white rounded-lg p-2.5 border border-slate-200/90 text-xs">
                                    <div class="font-bold text-slate-700 mb-1 flex items-center justify-between">
                                      <span>${escapeHtml(title)}</span>
                                      <span class="text-[10px] text-slate-400 font-mono">${escapeHtml(k)}</span>
                                    </div>
                                    <div class="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                                      <span class="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 line-through">
                                        ${escapeHtml(oldStr)}
                                      </span>
                                      <i class="fa-solid fa-arrow-right text-[10px] text-slate-400"></i>
                                      <span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">
                                        ${escapeHtml(newStr)}
                                      </span>
                                    </div>
                                  </div>
                                `;
                              }
                              if (d && typeof d === "object" && ("old_count" in d || "new_count" in d)) {
                                return `
                                  <div class="bg-white rounded-lg p-2.5 border border-slate-200/90 text-xs">
                                    <span class="font-bold text-slate-700">${escapeHtml(title)}:</span>
                                    <span class="font-mono text-slate-600 ml-1.5">
                                      ${d.old_count} items → <span class="font-bold text-emerald-700">${d.new_count} items</span>
                                    </span>
                                  </div>
                                `;
                              }
                              return `
                                <div class="bg-white rounded-lg p-2 border border-slate-200 text-xs font-mono text-slate-600">
                                  <span class="font-bold text-slate-700">${escapeHtml(title)}:</span> ${escapeHtml(
                                JSON.stringify(d)
                              )}
                                </div>
                              `;
                            })
                            .join("")}
                        </div>
                      </details>
                    `
                        : ""
                    }

                    <!-- Technical Device Details (Discreet) -->
                    ${
                      log.ip_address || log.user_agent
                        ? `
                      <details class="mt-2 text-[11px] text-slate-400">
                        <summary class="cursor-pointer hover:text-slate-600 select-none inline-flex items-center gap-1">
                          <i class="fa-solid fa-network-wired text-[9px]"></i>
                          <span>Device info</span>
                        </summary>
                        <div class="mt-1 p-2 bg-white rounded border border-slate-200 space-y-0.5 font-mono text-[10px] text-slate-600">
                          ${
                            log.ip_address
                              ? `<div><span class="text-slate-400">IP:</span> ${escapeHtml(
                                  log.ip_address
                                )}</div>`
                              : ""
                          }
                          ${
                            log.user_agent
                              ? `<div class="break-all"><span class="text-slate-400">UA:</span> ${escapeHtml(
                                  log.user_agent
                                )}</div>`
                              : ""
                          }
                        </div>
                      </details>
                    `
                        : ""
                    }
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      `
      }
    </div>
  `;

  // Wire filter pill buttons
  container.querySelectorAll("[data-act-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetFilter = btn.getAttribute("data-act-filter");
      _currentLogsFilter = targetFilter;
      renderListingActivitySection(container, _cachedListingLogs, _currentLogsFilter, listingId);
    });
  });

  // Wire refresh button
  const refreshBtn = container.querySelector("#refreshListingLogsBtn");
  const refreshIcon = container.querySelector("#refreshListingLogsIcon");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      if (refreshIcon) refreshIcon.classList.add("fa-spin");
      await loadListingActivityLogs(listingId, true);
    });
  }
}


