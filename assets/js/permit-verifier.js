/**
 * Property Permit Verification Module (Property Finder Atlas / DLD RERA)
 * With Multi-Record Selection & Comprehensive Form Auto-Fill
 */

(function () {
  let currentRecords = [];
  let activeRecordIndex = 0;

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function copyText(text, btnEl) {
    if (!text && text !== 0) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(String(text));
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = String(text);
        textarea.style.position = "fixed";
        textarea.style.left = "-999999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }

      if (btnEl) {
        const originalHtml = btnEl.innerHTML;
        btnEl.innerHTML = '<i class="fa-solid fa-check text-emerald-600"></i> <span class="text-xs text-emerald-600 font-bold">Copied</span>';
        setTimeout(() => {
          btnEl.innerHTML = originalHtml;
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  }

  function formatPrice(val) {
    if (val === null || val === undefined || val === "") return "-";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  /**
   * Comprehensive Form Auto-Fill
   */
  function autoFillPermitFields(item, recordIndex = 0) {
    if (!item) return;

    const prop = item.property || {};
    const filledItems = [];

    // 1. Price (AED)
    const priceInput = document.querySelector('[name="price"]');
    if (priceInput && prop.value !== undefined && prop.value !== null && prop.value !== "") {
      priceInput.value = prop.value;
      priceInput.dispatchEvent(new Event("input", { bubbles: true }));
      priceInput.dispatchEvent(new Event("change", { bubbles: true }));
      filledItems.push(`Price (AED ${formatPrice(prop.value)})`);
    }

    // 2. Size (Convert sq.m to sq.ft: sqm * 10.7639)
    const sizeInput = document.querySelector('[name="size"]');
    if (sizeInput && prop.size !== undefined && prop.size !== null && prop.size !== "") {
      const parsedSqm = parseFloat(prop.size);
      if (!isNaN(parsedSqm) && parsedSqm > 0) {
        const sqft = (parsedSqm * 10.7639).toFixed(2);
        sizeInput.value = sqft;
        sizeInput.dispatchEvent(new Event("input", { bubbles: true }));
        sizeInput.dispatchEvent(new Event("change", { bubbles: true }));
        filledItems.push(`Size (${sqft} sqft)`);
      }
    }

    // 3. Bedrooms / Rooms Count
    const bedroomsSelect = document.querySelector('[name="bedrooms"]');
    if (bedroomsSelect && prop.roomsCount !== undefined && prop.roomsCount !== null && prop.roomsCount !== "") {
      const rCountStr = String(prop.roomsCount).toLowerCase().trim();
      const targetVal = (rCountStr === "studio" || rCountStr === "0") ? "0" : rCountStr;
      bedroomsSelect.value = targetVal;
      bedroomsSelect.dispatchEvent(new Event("change", { bubbles: true }));
      filledItems.push(`Bedrooms (${targetVal === "0" ? "Studio" : targetVal})`);
    }

    // 4. Unit Number
    const unitInput = document.querySelector('[name="unit_number"]');
    if (unitInput && prop.unitNumber !== undefined && prop.unitNumber !== null) {
      const uNum = String(prop.unitNumber).trim();
      if (uNum !== "" && uNum !== "0") {
        unitInput.value = uNum;
        unitInput.dispatchEvent(new Event("input", { bubbles: true }));
        unitInput.dispatchEvent(new Event("change", { bubbles: true }));
        filledItems.push(`Unit Number (${uNum})`);
      }
    }

    // 5. Purpose (Rent / Sale) & Price Type
    const pType = String(prop.permitType || "").toLowerCase().trim();
    const purposeInput = document.getElementById("purposeType") || document.querySelector('[name="purpose"]');
    const purposeLabel = document.getElementById("purposeTypeLabel");
    const amountTypeInput = document.getElementById("amountType") || document.querySelector('[name="price_type"]');
    const amountTypeLabel = document.getElementById("amountTypeLabel");

    if (pType === "sell" || pType === "sale" || pType === "for sale") {
      if (purposeInput) {
        purposeInput.value = "For Sale";
        if (purposeLabel) {
          purposeLabel.innerHTML = `
            <span class="inline-flex items-center gap-2">
              <i class="fa-solid fa-bag-shopping text-slate-500"></i>
              <span class="text-slate-800">Buy</span>
            </span>
          `;
          purposeLabel.classList.remove("text-slate-400");
        }
        purposeInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (amountTypeInput) {
        amountTypeInput.value = "sale";
        if (amountTypeLabel) {
          amountTypeLabel.innerHTML = `
            <span class="inline-flex items-center gap-2">
              <i class="fa-solid fa-handshake text-slate-500"></i>
              <span class="text-slate-800">Sale</span>
            </span>
          `;
          amountTypeLabel.classList.remove("text-slate-400");
        }
        amountTypeInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
      filledItems.push("Purpose (Buy / Sale)");
    } else if (pType === "rent" || pType === "for rent") {
      if (purposeInput) {
        purposeInput.value = "For Rent";
        if (purposeLabel) {
          purposeLabel.innerHTML = `
            <span class="inline-flex items-center gap-2">
              <i class="fa-solid fa-hand-holding-dollar text-slate-500"></i>
              <span class="text-slate-800">Rent</span>
            </span>
          `;
          purposeLabel.classList.remove("text-slate-400");
        }
        purposeInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (amountTypeInput && (!amountTypeInput.value || amountTypeInput.value === "sale")) {
        amountTypeInput.value = "yearly";
        if (amountTypeLabel) {
          amountTypeLabel.innerHTML = `
            <span class="inline-flex items-center gap-2">
              <i class="fa-solid fa-key text-slate-500"></i>
              <span class="text-slate-800">Yearly</span>
            </span>
          `;
          amountTypeLabel.classList.remove("text-slate-400");
        }
        amountTypeInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
      filledItems.push("Purpose (Rent)");
    }

    // 6. Permit Dates & Type
    const startedAt = item.startedAt ? item.startedAt.split("T")[0] : "";
    const expiresAt = item.expiresAt ? item.expiresAt.split("T")[0] : "";

    const issueInput = document.querySelector('[name="permit_issue_date"]');
    if (issueInput && startedAt) {
      issueInput.value = startedAt;
      issueInput.dispatchEvent(new Event("input", { bubbles: true }));
      issueInput.dispatchEvent(new Event("change", { bubbles: true }));
      filledItems.push(`Issue Date (${startedAt})`);
    }

    const expiryInput = document.querySelector('[name="permit_expiry_date"]');
    if (expiryInput && expiresAt) {
      expiryInput.value = expiresAt;
      expiryInput.dispatchEvent(new Event("input", { bubbles: true }));
      expiryInput.dispatchEvent(new Event("change", { bubbles: true }));
      filledItems.push(`Expiry Date (${expiresAt})`);
    }

    const permitTypeInput = document.getElementById("permitType") || document.querySelector('[name="compliance_type"]');
    const permitTypeLabel = document.getElementById("permitTypeLabel");
    if (permitTypeInput) {
      permitTypeInput.value = "rera";
      if (permitTypeLabel) {
        permitTypeLabel.innerHTML = `
          <span class="inline-flex items-center gap-2">
            <i class="fa-solid fa-building-shield text-slate-500"></i>
            <span class="text-slate-800">RERA (Dubai)</span>
          </span>
        `;
        permitTypeLabel.classList.remove("text-slate-400");
      }
      permitTypeInput.dispatchEvent(new Event("change", { bubbles: true }));
      filledItems.push("RERA Permit Type");
    }

    // Show Auto-Fill Feedback Banner inside Result Card
    showAutoFillFeedback(recordIndex, filledItems);

    if (typeof refreshCollapsibleHeights === "function") {
      refreshCollapsibleHeights();
    }
  }

  function showAutoFillFeedback(recordIndex, filledItems) {
    const feedbackEl = document.getElementById("permitAutoFillFeedback");
    if (!feedbackEl) return;

    const recordLabel = currentRecords.length > 1 ? `Record #${recordIndex + 1}` : "Permit Data";
    const itemsSummary = filledItems.length > 0 ? filledItems.join(", ") : "All matching fields";

    feedbackEl.innerHTML = `
      <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-2 text-emerald-900 text-xs animate-fadeIn">
        <div class="flex items-start gap-2">
          <i class="fa-solid fa-circle-check text-emerald-600 text-sm mt-0.5 shrink-0"></i>
          <div>
            <span class="font-bold">Form successfully updated with ${escapeHtml(recordLabel)}!</span>
            <div class="text-emerald-700 mt-0.5">Auto-filled: ${escapeHtml(itemsSummary)}</div>
          </div>
        </div>
        <button type="button" class="text-emerald-500 hover:text-emerald-800 p-1 cursor-pointer" onclick="this.parentElement.remove()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
    feedbackEl.classList.remove("hidden");
  }

  function renderFieldCard({ label, value, rawValue, icon, note = "" }) {
    const displayVal = value !== null && value !== undefined && value !== "" ? String(value) : "-";
    const copyVal = rawValue !== undefined && rawValue !== null && rawValue !== "" ? String(rawValue) : displayVal;
    const canCopy = copyVal !== "-";

    return `
      <div class="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs hover:border-slate-300 transition group flex flex-col justify-between">
        <div class="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
          <span class="flex items-center gap-1.5 truncate">
            <i class="${escapeHtml(icon)} text-slate-400"></i>
            ${escapeHtml(label)}
          </span>
          ${canCopy ? `
            <button type="button" class="copy-btn opacity-60 hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer" data-copy="${escapeHtml(copyVal)}" title="Copy value">
              <i class="fa-regular fa-copy text-xs"></i>
            </button>
          ` : ""}
        </div>
        <div class="text-sm font-bold text-slate-800 break-words flex items-center justify-between">
          <span>${escapeHtml(displayVal)}</span>
        </div>
        ${note ? `<div class="text-[11px] text-slate-400 mt-1 font-normal">${escapeHtml(note)}</div>` : ""}
      </div>
    `;
  }

  /**
   * Render Multi-Record Selector Cards
   */
  function renderRecordSelector(records, activeIdx) {
    if (!records || records.length <= 1) return "";

    const cardsHtml = records.map((rec, idx) => {
      const isActive = idx === activeIdx;
      const rProp = rec.property || {};
      const rStarted = rec.startedAt ? rec.startedAt.split("T")[0] : "-";
      const rExpires = rec.expiresAt ? rec.expiresAt.split("T")[0] : "-";
      const rPurpose = rProp.permitType || "Permit";
      const rLocation = rProp.locationName || "";
      const rPrice = rProp.value ? `AED ${formatPrice(rProp.value)}` : "";

      return `
        <div class="record-select-card cursor-pointer rounded-xl p-3 border transition-all duration-200 ${
          isActive
            ? "bg-white border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm"
            : "bg-slate-100/80 border-slate-200 hover:bg-white hover:border-slate-300"
        }" data-record-index="${idx}">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold ${
              isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
            }">
              <i class="fa-solid ${isActive ? "fa-circle-check text-emerald-600" : "fa-file-lines text-slate-400"}"></i>
              Record #${idx + 1}
            </span>
            <button type="button" class="record-card-autofill-btn px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold shadow-2xs transition cursor-pointer" data-autofill-index="${idx}" title="Auto-fill form with this record">
              <i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Auto-Fill
            </button>
          </div>

          <div class="text-xs font-semibold text-slate-800 truncate">
            ${escapeHtml(rPurpose)}${rLocation ? ` • <span class="text-slate-600 font-normal">${escapeHtml(rLocation)}</span>` : ""}
          </div>

          <div class="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>📅 ${escapeHtml(rStarted)} → ${escapeHtml(rExpires)}</span>
            ${rPrice ? `<span class="font-bold text-slate-700">${escapeHtml(rPrice)}</span>` : ""}
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <i class="fa-solid fa-layer-group text-slate-400"></i>
            Found ${records.length} Permit Records — Select a record to preview or auto-fill:
          </span>
          <span class="text-xs text-slate-400 font-medium">Click card to switch preview</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(records.length, 3)} gap-2.5">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  /**
   * Main Render Function
   */
  function renderVerificationResult(container, data) {
    if (!container) return;

    const records = Array.isArray(data?.data) ? data.data : (data?.data ? [data.data] : []);
    if (!records.length) {
      renderErrorResult(container, "No permit records returned for this permit number.");
      return;
    }

    currentRecords = records;
    if (activeRecordIndex >= records.length) {
      activeRecordIndex = 0;
    }

    const item = records[activeRecordIndex];
    const prop = item.property || {};
    const proj = item.project || {};

    const permitNo = item.permitNumber || "";
    const statusId = item.permitStatusId !== undefined ? item.permitStatusId : "-";
    const startedAt = item.startedAt ? item.startedAt.split("T")[0] : "";
    const expiresAt = item.expiresAt ? item.expiresAt.split("T")[0] : "";
    const validationUrl = item.validationURL || "";

    const permitType = prop.permitType || "";
    const listingType = prop.listingType || prop.listing_type || "";
    const locationName = prop.locationName || "";
    const roomsCount = prop.roomsCount !== undefined && prop.roomsCount !== null ? String(prop.roomsCount) : "";
    const sizeSqm = prop.size !== undefined && prop.size !== null && prop.size !== "" ? Number(prop.size) : null;
    const sizeSqft = sizeSqm ? (sizeSqm * 10.7639).toFixed(2) : null;
    const unitNumber = prop.unitNumber !== undefined && prop.unitNumber !== null ? String(prop.unitNumber) : "";
    const valuePrice = prop.value !== undefined && prop.value !== null ? formatPrice(prop.value) : "";

    const projName = proj.name || "";
    const projNumber = proj.number || "";
    const devName = proj.developerName || "";

    const autoFillBtnText = records.length > 1
      ? `Auto-Fill with Record #${activeRecordIndex + 1}`
      : "Auto-Fill Form";

    container.innerHTML = `
      <div class="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <!-- Top Status Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              <i class="fa-solid fa-circle-check text-emerald-600"></i>
              DLD / RERA Verified
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-full">
              <i class="fa-solid fa-hashtag text-slate-400"></i> Status ID: ${escapeHtml(String(statusId))}
            </span>
            ${records.length > 1 ? `
              <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-full">
                <i class="fa-solid fa-layer-group text-blue-500"></i> Record ${activeRecordIndex + 1} of ${records.length}
              </span>
            ` : ""}
          </div>

          <div class="flex flex-wrap items-center gap-2">
            ${validationUrl ? `
              <a href="${escapeHtml(validationUrl)}" target="_blank" rel="noopener noreferrer"
                 class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition shadow-2xs">
                <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                <span>Official DLD Page</span>
              </a>
            ` : ""}
            <button type="button" id="autoFillPermitBtn"
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              <span>${escapeHtml(autoFillBtnText)}</span>
            </button>
            <button type="button" id="closePermitResultBtn"
                    class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition cursor-pointer" title="Dismiss">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Multi-Record Selector (if > 1 records) -->
        ${renderRecordSelector(records, activeRecordIndex)}

        <!-- Auto-Fill Feedback Slot -->
        <div id="permitAutoFillFeedback" class="hidden"></div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          ${renderFieldCard({
            label: "DLD Permit No.",
            value: permitNo,
            rawValue: permitNo,
            icon: "fa-solid fa-hashtag",
          })}

          ${renderFieldCard({
            label: "Listed Value / Price",
            value: valuePrice ? `AED ${valuePrice}` : "-",
            rawValue: prop.value !== undefined && prop.value !== null ? String(prop.value) : "",
            icon: "fa-solid fa-coins",
            note: prop.value ? "Auto-fills Price field" : "",
          })}

          ${renderFieldCard({
            label: "Size",
            value: sizeSqm ? `${sizeSqm} sq.m` : "-",
            rawValue: sizeSqft ? `${sizeSqft}` : (sizeSqm ? String(sizeSqm) : ""),
            icon: "fa-solid fa-ruler-combined",
            note: sizeSqft ? `≈ ${sizeSqft} sq.ft (Auto-fills in sq.ft)` : "",
          })}

          ${renderFieldCard({
            label: "Rooms / Bedrooms",
            value: roomsCount !== "" ? (roomsCount === "0" ? "Studio" : `${roomsCount} Bed`) : "-",
            rawValue: roomsCount,
            icon: "fa-solid fa-bed",
          })}

          ${renderFieldCard({
            label: "Issue Date (Started)",
            value: startedAt,
            rawValue: startedAt,
            icon: "fa-regular fa-calendar-check",
          })}

          ${renderFieldCard({
            label: "Expiry Date",
            value: expiresAt,
            rawValue: expiresAt,
            icon: "fa-regular fa-calendar-xmark",
          })}

          ${renderFieldCard({
            label: "Permit Purpose",
            value: permitType,
            rawValue: permitType,
            icon: "fa-solid fa-tag",
            note: permitType ? "Auto-fills Purpose & Price Type" : "",
          })}

          ${renderFieldCard({
            label: "Unit Number",
            value: unitNumber,
            rawValue: unitNumber,
            icon: "fa-solid fa-door-closed",
          })}

          ${renderFieldCard({
            label: "Property Type",
            value: listingType,
            rawValue: listingType,
            icon: "fa-solid fa-house",
          })}

          ${renderFieldCard({
            label: "Location",
            value: locationName,
            rawValue: locationName,
            icon: "fa-solid fa-location-dot",
          })}

          ${projName || projNumber ? renderFieldCard({
            label: "Project",
            value: projName || projNumber,
            rawValue: projName || projNumber,
            icon: "fa-solid fa-building",
            note: projNumber && projName ? `No: ${projNumber}` : "",
          }) : ""}

          ${devName ? renderFieldCard({
            label: "Developer",
            value: devName,
            rawValue: devName,
            icon: "fa-solid fa-helmet-safety",
          }) : ""}
        </div>

        ${validationUrl ? `
          <div class="pt-2 text-xs text-slate-500 flex items-center justify-between">
            <span class="truncate">Validation URL: <a href="${escapeHtml(validationUrl)}" target="_blank" class="text-blue-600 hover:underline">${escapeHtml(validationUrl)}</a></span>
            <button type="button" class="copy-btn shrink-0 text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1 ml-2 p-1 rounded hover:bg-slate-100" data-copy="${escapeHtml(validationUrl)}">
              <i class="fa-regular fa-copy"></i> Copy Link
            </button>
          </div>
        ` : ""}
      </div>
    `;

    container.classList.remove("hidden");

    // Bind main auto-fill button
    const autoFillBtn = container.querySelector("#autoFillPermitBtn");
    if (autoFillBtn) {
      autoFillBtn.addEventListener("click", () => {
        autoFillPermitFields(currentRecords[activeRecordIndex], activeRecordIndex);
      });
    }

    // Bind individual record card clicks & card autofill buttons
    container.querySelectorAll(".record-select-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const target = e.target.closest(".record-card-autofill-btn");
        if (target) {
          const autoIdx = parseInt(target.getAttribute("data-autofill-index"), 10);
          activeRecordIndex = autoIdx;
          renderVerificationResult(container, { data: currentRecords });
          autoFillPermitFields(currentRecords[autoIdx], autoIdx);
          return;
        }

        const idx = parseInt(card.getAttribute("data-record-index"), 10);
        if (!isNaN(idx) && idx !== activeRecordIndex) {
          activeRecordIndex = idx;
          renderVerificationResult(container, { data: currentRecords });
        }
      });
    });

    // Bind close button
    const closeBtn = container.querySelector("#closePermitResultBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        container.classList.add("hidden");
        container.innerHTML = "";
        currentRecords = [];
        activeRecordIndex = 0;
        if (typeof refreshCollapsibleHeights === "function") {
          refreshCollapsibleHeights();
        }
      });
    }

    // Bind all copy buttons
    container.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const copyVal = btn.getAttribute("data-copy");
        copyText(copyVal, btn);
      });
    });

    if (typeof refreshCollapsibleHeights === "function") {
      refreshCollapsibleHeights();
    }
  }

  function renderErrorResult(container, errorMessage) {
    if (!container) return;

    container.innerHTML = `
      <div class="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-rose-800">
        <div class="flex items-start gap-3">
          <i class="fa-solid fa-circle-exclamation text-rose-500 text-lg mt-0.5 shrink-0"></i>
          <div>
            <div class="font-bold text-sm">Permit Verification Failed</div>
            <div class="text-xs text-rose-600 mt-1">${escapeHtml(errorMessage || "Invalid permit number or not found in DLD/RERA records.")}</div>
          </div>
        </div>
        <button type="button" class="text-rose-400 hover:text-rose-600 p-1 cursor-pointer" onclick="this.closest('#permitVerificationResult').classList.add('hidden')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;

    container.classList.remove("hidden");

    if (typeof refreshCollapsibleHeights === "function") {
      refreshCollapsibleHeights();
    }
  }

  function initPermitVerifier() {
    const verifyBtn = document.getElementById("verifyPermitBtn");
    const permitInput = document.querySelector('[name="advertisement_number"]');
    const resultContainer = document.getElementById("permitVerificationResult");

    if (!verifyBtn || !permitInput) return;

    async function handleVerify() {
      const permitNumber = (permitInput.value || "").trim();

      if (!permitNumber) {
        permitInput.focus();
        permitInput.classList.add("ring-2", "ring-rose-500");
        setTimeout(() => {
          permitInput.classList.remove("ring-2", "ring-rose-500");
        }, 2000);

        if (resultContainer) {
          renderErrorResult(resultContainer, "Please enter a permit number to verify.");
        }
        return;
      }

      // Reset state
      activeRecordIndex = 0;
      currentRecords = [];

      // Set Loading State
      const originalBtnHtml = verifyBtn.innerHTML;
      verifyBtn.disabled = true;
      verifyBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Verifying...</span>';

      try {
        const response = await api(`/?resource=verify-permit&permit_number=${encodeURIComponent(permitNumber)}&permitType=rera`);

        if (response && response.status === "success" && response.data) {
          renderVerificationResult(resultContainer, response);
        } else if (response && response.error) {
          renderErrorResult(resultContainer, response.error);
        } else {
          renderErrorResult(resultContainer, "Unexpected response from verification service.");
        }
      } catch (err) {
        console.error("Permit verification error:", err);
        const errMsg = err?.error || err?.message || "Verification request failed. Please check the permit number.";
        renderErrorResult(resultContainer, errMsg);
      } finally {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = originalBtnHtml;
      }
    }

    verifyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleVerify();
    });

    permitInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleVerify();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initPermitVerifier);
  window.initPermitVerifier = initPermitVerifier;
})();
