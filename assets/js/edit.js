// ============================================================================
// EDIT FORM LOGIC
// ============================================================================

/**
 * Load listing data and pre-fill the edit form
 */
function getExistingImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return (
    image.urlMachine ||
    image.url ||
    image.downloadUrl ||
    image.previewUrl ||
    image.href ||
    ""
  );
}

function getExistingImageFileId(image) {
  if (!image || typeof image !== "object") return null;

  const candidates = [
    image.existingFileId,
    image.existing_file_id,
    image.fileId,
    image.file_id,
    image.value,
    image.id,
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;

    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }

    const value = String(candidate).trim();
    if (!value) continue;
    if (/^\d+$/.test(value)) return Number(value);
  }

  return null;
}

function getExistingDocumentFileId(doc) {
  if (!doc || typeof doc !== "object") return null;

  const candidates = [
    doc.existingFileId,
    doc.existing_file_id,
    doc.fileId,
    doc.file_id,
    doc.value,
    doc.id,
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;

    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }

    const value = String(candidate).trim();
    if (!value) continue;
    if (/^\d+$/.test(value)) return Number(value);
  }

  return null;
}

async function loadListingForEdit(listingId) {
  try {
    const response = await api("/?resource=listings&id=" + listingId, {
      method: "GET",
    });

    if (!response) {
      throw new Error("Failed to load listing");
    }

    const listing = response;

    // Pre-fill text inputs
    const fieldsToFill = [
      "title",
      "price",
      "bedrooms",
      "bathrooms",
      "size",
      "floor_number",
      "unit_number",
      "plot_number",
      "plot_size",
      "advertisement_number",
      "reference",
      "cheques",
      "mortgage_years",
    ];

    fieldsToFill.forEach((field) => {
      const input = document.querySelector(`[name="${field}"]`);
      if (input && listing[field] !== undefined && listing[field] !== null) {
        input.value = listing[field];
      }
    });

    // Handle description (could be description_en)
    const descriptionInput = document.querySelector('[name="description_en"]');
    if (descriptionInput) {
      const description = listing.description || listing.description_en || "";
      if (description) descriptionInput.value = description;
    }

    // Pre-fill date inputs
    if (listing.license_date) {
      const dateInput = document.querySelector('[name="license_date"]');
      if (dateInput) {
        dateInput.value = listing.license_date.split("T")[0];
      }
    }

    // Pre-fill video inputs
    if (listing.video) {
      const videoInput = document.querySelector('[name="video"]');
      if (videoInput) videoInput.value = listing.video;
    }

    if (listing.video_360) {
      const video360Input = document.querySelector('[name="video_360"]');
      if (video360Input) video360Input.value = listing.video_360;
    }

    // Pre-select dropdowns for agents, owners, locations
    if (listing.listing_agent) {
      const agentSelect = document.getElementById("agentSelect");
      if (agentSelect) {
        const agentId = listing.listing_agent?.id || listing.listing_agent;
        agentSelect.value = agentId;
      }
    }

    if (listing.listing_owner) {
      const ownerSelect = document.getElementById("ownerSelect");
      if (ownerSelect) {
        const ownerId = listing.listing_owner?.id || listing.listing_owner;
        ownerSelect.value = ownerId;
      }
    }

    if (listing.photoshoot_required) {
      const photoshootRequiredSelect =
        document.getElementById("photoshootRequired");
      if (photoshootRequiredSelect) {
        const required = listing.photoshoot_required;
        photoshootRequiredSelect.value = required;
      }
    }

    if (listing.pocket_listing) {
      const pocketListingSelect = document.getElementById("pocketListing");
      if (pocketListingSelect) {
        const required = listing.pocket_listing;
        pocketListingSelect.value = required;
      }
    }

    const portalsSelect = document.getElementById("portals");
    if (
      portalsSelect &&
      listing.portals !== undefined &&
      listing.portals !== null
    ) {
      const selectedPortals = Array.isArray(listing.portals)
        ? listing.portals
        : String(listing.portals)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);

      Array.from(portalsSelect.options).forEach((option) => {
        option.selected = selectedPortals.includes(option.value);
      });
    }

    if (listing.location_id) {
      const locationSelect = document.getElementById("locationSelect");
      if (locationSelect) {
        locationSelect.value = listing.location_id;
      }
    } else if (listing.location) {
      console.log("Location data:", listing.location);
      // If location is returned as object with name property
      const locationId = listing.location?.id || listing.location;
      const locationName = listing.location?.name || listing.location;
      if (locationId) {
        const locationSelect = document.getElementById("locationSelect");
        console.log("Location select:", locationSelect);
        if (locationSelect) {
          locationSelect.value = locationId;
        }
        setLocationSelection(
          {
            id: locationId,
            name: locationName,
          },
          "pf",
        );
      }
    }

    if (listing.bayut_location_id) {
      const bayutLocationSelect = document.getElementById(
        "bayutLocationSelect",
      );
      if (bayutLocationSelect) {
        bayutLocationSelect.value = listing.bayut_location_id;
      }
    } else if (listing.bayut_location) {
      console.log("Bayut location data:", listing.bayut_location);
      // If location is returned as object with name property
      const locationId =
        listing.bayut_location?.id || listing.bayut_location || "";
      const locationName =
        listing.bayut_location?.name || listing.bayut_location || "";
      if (locationId) {
        const bayutLocationSelect = document.getElementById(
          "bayutLocationSelect",
        );
        console.log("Bayut location select:", bayutLocationSelect);
        if (bayutLocationSelect) {
          bayutLocationSelect.value = locationId;
        }
        setLocationSelection(
          {
            id: locationId,
            name: locationName,
          },
          "bayut",
        );
      }
    }

    // Pre-select icon menu buttons (custom dropdowns)
    const iconSelects = [
      { id: "propertyCategory", field: "category" },
      { id: "propertyType", field: "property_type_pf" },
      { id: "furnishingType", field: "furnishing_type" },
      { id: "finishingType", field: "finishing_type" },
      { id: "projectStatus", field: "project_status" },
      { id: "permitType", field: "compliance_type" },
      { id: "amountType", field: "price_type" },
      { id: "paymentMethod", field: "payment_methods" },
      { id: "uaeEmirate", field: "emirate" },
      { id: "purposeType", field: "purpose" },
    ];

    const valueLabels = {
      category: {
        residential: { label: "Residential", icon: "fa-solid fa-house" },
        commercial: { label: "Commercial", icon: "fa-solid fa-building" },
      },
      property_type_pf: {
        apartment: { label: "Apartment", icon: "fa-solid fa-building" },
        bungalow: { label: "Bungalow", icon: "fa-solid fa-house" },
        "bulk-rent-unit": {
          label: "Bulk Rent Unit",
          icon: "fa-solid fa-layer-group",
        },
        "bulk-sale-unit": {
          label: "Bulk Sale Unit",
          icon: "fa-solid fa-layer-group",
        },
        "business-center": {
          label: "Business Center",
          icon: "fa-solid fa-city",
        },
        cabin: { label: "Cabin", icon: "fa-solid fa-house-tree" },
        cafeteria: { label: "Cafeteria", icon: "fa-solid fa-mug-hot" },
        chalet: { label: "Chalet", icon: "fa-solid fa-house-snowflake" },
        clinic: { label: "Clinic", icon: "fa-solid fa-house-medical" },
        "co-working-space": {
          label: "Co-working Space",
          icon: "fa-solid fa-people-group",
        },
        compound: {
          label: "Compound",
          icon: "fa-solid fa-building-circle-check",
        },
        duplex: { label: "Duplex", icon: "fa-solid fa-building" },
        factory: { label: "Factory", icon: "fa-solid fa-industry" },
        farm: { label: "Farm", icon: "fa-solid fa-tractor" },
        "full-floor": { label: "Full Floor", icon: "fa-solid fa-layer-group" },
        "half-floor": { label: "Half Floor", icon: "fa-solid fa-layer-group" },
        "hotel-apartment": {
          label: "Hotel Apartment",
          icon: "fa-solid fa-hotel",
        },
        ivilla: {
          label: "Independent Villa",
          icon: "fa-solid fa-house-chimney",
        },
        land: { label: "Land", icon: "fa-solid fa-mountain-sun" },
        "labor-camp": { label: "Labor Camp", icon: "fa-solid fa-people-roof" },
        "medical-facility": {
          label: "Medical Facility",
          icon: "fa-solid fa-hospital",
        },
        "office-space": {
          label: "Office Space",
          icon: "fa-solid fa-briefcase",
        },
        palace: { label: "Palace", icon: "fa-solid fa-crown" },
        penthouse: { label: "Penthouse", icon: "fa-solid fa-building-user" },
        "rest-house": { label: "Rest House", icon: "fa-solid fa-bed" },
        restaurant: { label: "Restaurant", icon: "fa-solid fa-utensils" },
        retail: { label: "Retail", icon: "fa-solid fa-bag-shopping" },
        roof: { label: "Roof", icon: "fa-solid fa-house-circle-check" },
        "show-room": { label: "Showroom", icon: "fa-solid fa-store-large" },
        shop: { label: "Shop", icon: "fa-solid fa-store" },
        "staff-accommodation": {
          label: "Staff Accommodation",
          icon: "fa-solid fa-house-user",
        },
        townhouse: { label: "Townhouse", icon: "fa-solid fa-house" },
        "twin-house": { label: "Twin House", icon: "fa-solid fa-house" },
        villa: { label: "Villa", icon: "fa-solid fa-house-chimney" },
        warehouse: { label: "Warehouse", icon: "fa-solid fa-warehouse" },
        "whole-building": {
          label: "Whole Building",
          icon: "fa-solid fa-building",
        },
      },

      purpose: {
        "For Sale": { label: "Buy", icon: "fa-solid fa-bag-shopping" },
        "For Rent": { label: "Rent", icon: "fa-solid fa-hand-holding-dollar" },
      },

      furnishing_type: {
        furnished: { label: "Furnished", icon: "fa-solid fa-couch" },
        "semi-furnished": {
          label: "Semi-Furnished",
          icon: "fa-solid fa-chair",
        },
        unfurnished: { label: "Unfurnished", icon: "fa-regular fa-square" },
      },

      finishing_type: {
        "fully-finished": {
          label: "Fully Finished",
          icon: "fa-solid fa-circle-check",
        },
        "semi-furnished": { label: "Semi-Finished", icon: "fa-solid fa-couch" },
        unfinished: { label: "Unfinished", icon: "fa-solid fa-hammer" },
      },

      compliance_type: {
        rera: { label: "RERA (Dubai)", icon: "fa-solid fa-building-shield" },
        dtcm: { label: "DTCM (Dubai)", icon: "fa-solid fa-building-columns" },
        adrec: { label: "ABREC (Abu Dhabi)", icon: "fa-solid fa-landmark" },
      },

      project_status: {
        completed: { label: "Completed", icon: "fa-solid fa-circle-check" },
        completed_primary: {
          label: "Completed Primary",
          icon: "fa-solid fa-circle-check",
        },
        off_plan: { label: "Off-plan", icon: "fa-solid fa-diagram-project" },
        off_plan_primary: {
          label: "Off-plan Primary",
          icon: "fa-solid fa-diagram-project",
        },
      },

      price_type: {
        yearly: { label: "Yearly", icon: "fa-solid fa-key" },
        monthly: { label: "Monthly", icon: "fa-solid fa-key" },
        weekly: { label: "Weekly", icon: "fa-solid fa-key" },
        daily: { label: "Daily", icon: "fa-solid fa-key" },
        sale: { label: "Sale", icon: "fa-solid fa-handshake" },
      },

      payment_methods: {
        cash: { label: "Cash", icon: "fa-solid fa-money-bill" },
        installments: { label: "Installments", icon: "fa-solid fa-receipt" },
      },

      emirate: {
        dubai: { label: "Dubai", icon: "fa-solid fa-city" },
        abu_dhabi: { label: "Abu Dhabi", icon: "fa-solid fa-landmark" },
        northern_emirates: {
          label: "Northern Emirates",
          icon: "fa-solid fa-landmark",
        },
      },
    };

    iconSelects.forEach(({ id, field }) => {
      if (listing[field]) {
        const hidden = document.getElementById(id);
        const label = document.getElementById(id + "Label");

        if (hidden) hidden.value = listing[field];

        if (label) {
          const option = valueLabels[field]?.[listing[field]];

          if (option) {
            label.innerHTML = `<i class="${option.icon} mr-2"></i> ${option.label}`;
          } else {
            label.textContent = listing[field];
          }

          label.classList.remove("text-slate-400");
          label.classList.add("text-slate-800");
        }
      }
    });

    // Pre-fill amenities checkboxes
    // Support PropertyFinder / Bayut amenities fields
    const amenitiesList =
      listing.amenities_pf ||
      listing.amenities_bayut ||
      listing.amenities ||
      [];
    if (Array.isArray(amenitiesList)) {
      amenitiesList.forEach((amenity) => {
        const checkbox = document.querySelector(
          `input[name="amenities_pf[]"][value="${amenity}"]`,
        );
        if (checkbox) checkbox.checked = true;
      });
    }

    // Pre-fill image gallery
    if (listing.images && Array.isArray(listing.images)) {
      imageGallery = listing.images
        .map((img, index) => {
          const src = getExistingImageUrl(img);
          if (!src) return null;
          const existingFileId = getExistingImageFileId(img);
          return {
            id: `existing-${index}`,
            src,
            name: img?.name || `Image ${index + 1}`,
            ...(existingFileId !== null ? { existingFileId } : {}),
          };
        })
        .filter(Boolean);
      renderImageGallery();
      updateImagesInput();
    }

    const documentFields =
      typeof documentFieldConfig === "object" && documentFieldConfig !== null
        ? Object.keys(documentFieldConfig)
        : [];

    documentFields.forEach((fieldName) => {
      const documentValue = listing[fieldName];
      if (!documentValue) return;

      const existingFileId = getExistingDocumentFileId(documentValue);
      const previewData =
        typeof documentValue === "object" && documentValue !== null
          ? {
              ...documentValue,
              ...(existingFileId !== null ? { existingFileId } : {}),
            }
          : documentValue;

      if (typeof renderDocumentPreview === "function") {
        renderDocumentPreview(fieldName, previewData);
      }
    });

    // Trigger character counters after prefilling (TITLE + DESCRIPTION)
    const titleInput = document.getElementById("titleInput");

    if (titleInput) {
      titleInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    if (descriptionInput) {
      descriptionInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  } catch (error) {
    console.error("Error loading listing:", error);
    alert("Error loading listing: " + (error.message || "Unknown error"));
  }
}

/**
 * Setup the edit form with all necessary event listeners and initializations
 */
function setupEditForm(listingId) {
  const form = document.getElementById("editListingForm");
  if (!form) return;

  // Setup all the custom dropdowns and location search
  setupCreatePageUI();

  setupLocationSearch("pf");
  setupLocationSearch("bayut");

  initializeImageManagement();
  initializeDocumentManagement();
  attachFormSubmissionHandler(listingId);
}
