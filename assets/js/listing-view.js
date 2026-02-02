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

function formatPrice(price) {
  const n = Number(price || 0);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function prettyLabel(v) {
  return String(v ?? "")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
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

function buildDetailRow(label, value) {
  const v =
    value !== undefined && value !== null && String(value).trim() !== "";
  return `
    <div class="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-b-0">
      <div class="text-md font-semibold text-slate-500">${escapeHtml(label)}</div>
      <div class="text-md font-bold text-slate-800 text-right">${v ? escapeHtml(String(value)) : "-"}</div>
    </div>
  `;
}

function buildDetailRowHtml(label, html) {
  const has = html !== undefined && html !== null && String(html).trim() !== "";
  return `
    <div class="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-b-0">
      <div class="text-md font-semibold text-slate-500">${escapeHtml(label)}</div>
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
  const owner = listing?.listing_owner
    ? typeof listing.listing_owner === "object"
      ? listing.listing_owner.name
      : listing.listing_owner
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
            <div class="text-lg font-bold text-slate-800">Description</div>
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
            ${buildDetailRow("Type", prettyLabel(propertyType))}
            ${buildDetailRow("Bedrooms", listing?.bedrooms)}
            ${buildDetailRow("Bathrooms", listing?.bathrooms)}
            ${buildDetailRow("Size", size)}
            ${buildDetailRow("Location", location)}
            ${buildDetailRow("Agent", agent)}
            ${buildDetailRow("Owner", owner)}
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div class="text-lg font-bold text-slate-800 mb-4">More details</div>
          <div class="space-y-0">
            ${buildDetailRow("Emirate", listing?.emirate ? prettyLabel(listing.emirate) : "")}
            ${buildDetailRow("Unit number", listing?.unit_number)}
            ${buildDetailRow("Floor", listing?.floor_number)}
            ${buildDetailRow("Parking slots", listing?.parking_slots)}
            ${buildDetailRow("Total floors", listing?.total_floors)}
            ${buildDetailRow("Elevators", listing?.elevators)}
            ${buildDetailRow("Advertisement no.", listing?.advertisement_number)}
            ${buildDetailRow("Compliance", listing?.compliance_type ? prettyLabel(listing.compliance_type) : "")}
            ${buildDetailRow("License date", listing?.license_date)}
            ${
              listing?.brochure_url
                ? buildDetailRowHtml(
                    "Brochure",
                    `<a class="text-blue-600 hover:text-blue-700 font-bold" target="_blank" href="${escapeHtml(
                      listing.brochure_url,
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
        <div class="text-lg font-bold text-slate-800">Gallery</div>
        <div class="text-md text-slate-500 font-semibold">${images.length} image${
          images.length === 1 ? "" : "s"
        }</div>
      </div>

      ${
        otherImages.length
          ? `
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          ${otherImages
            .map(
              (url) => `
            <button type="button" class="group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:ring-2 hover:ring-blue-500 transition" data-thumb="${escapeHtml(
              url,
            )}">
              <img src="${escapeHtml(
                url,
              )}" class="w-full h-24 object-cover group-hover:scale-[1.02] transition" alt="Listing image">
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
      `/?resource=listings&id=${encodeURIComponent(id)}`,
    );

    // Hide edit button for non-admin
    const editBtn = qs("#editListingBtn");
    if (editBtn && typeof IS_ADMIN !== "undefined" && IS_ADMIN === false) {
      editBtn.classList.add("hidden");
    }

    renderListingDetails(container, listing);
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
