// ============================================================================
// EDIT FORM LOGIC
// ============================================================================

/**
 * Load listing data and pre-fill the edit form
 */
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
        dateInput.value = listing.license_date;
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

    if (listing.location_id) {
      const locationSelect = document.getElementById("locationSelect");
      if (locationSelect) {
        locationSelect.value = listing.location_id;
      }
    } else if (listing.location) {
      // If location is returned as object with name property
      const locationId = listing.location?.id || listing.location;
      const locationName = listing.location?.name || listing.location;
      if (locationId) {
        const locationSelect = document.getElementById("locationSelect");
        if (locationSelect) {
          locationSelect.value = locationId;
        }
        setLocationSelection({
          id: locationId,
          name: locationName,
        });
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

    iconSelects.forEach(({ id, field }) => {
      if (listing[field]) {
        const hidden = document.getElementById(id);
        const label = document.getElementById(id + "Label");
        if (hidden) hidden.value = listing[field];
        if (label) {
          label.textContent = listing[field];
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
      imageGallery = listing.images.map((img, index) => ({
        id: `existing-${index}`,
        src: img,
        name: `Image ${index + 1}`,
      }));
      renderImageGallery();
      updateImagesInput();
    }

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
  setupLocationSearch();
  initializeImageManagement();
  attachFormSubmissionHandler(listingId);
}
