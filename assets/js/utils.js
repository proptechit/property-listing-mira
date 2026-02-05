const COMPANY_DESCRIPTION_BLOCK = `

About MIRA Real Estate:

MIRA Real Estate is a premium brokerage in Dubai, accredited by top developers and offering over 400+ high-end projects. Our experienced team specializes in luxury real estate, investment advisory, and exclusive property sales, delivering record-breaking transactions and tailored client experiences.
`;

// Character counter
document.addEventListener("DOMContentLoaded", () => {
  const setupCounter = (input, countEl, remainingEl, max) => {
    const update = () => {
      const length = input.value.length;
      countEl.textContent = length;
      remainingEl.textContent = max - length;
    };

    update();
    input.addEventListener("input", update);
  };

  // Title
  const titleInput = document.getElementById("titleInput");
  setupCounter(
    titleInput,
    document.getElementById("titleCount"),
    document.getElementById("titleRemaining"),
    50,
  );

  // Description
  const descriptionInput = document.getElementById("descriptionInput");
  setupCounter(
    descriptionInput,
    document.getElementById("descriptionCount"),
    document.getElementById("descriptionRemaining"),
    2000,
  );
});

// Append company info
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("appendCompanyInfoBtn");
  const descriptionInput = document.getElementById("descriptionInput");

  if (!btn || !descriptionInput) return;

  btn.addEventListener("click", () => {
    const currentText = descriptionInput.value.trim();

    // Prevent duplicate insert
    if (currentText.includes("Company Name:")) {
      alert("Company details are already added.");
      return;
    }

    const newText = currentText
      ? currentText + COMPANY_DESCRIPTION_BLOCK
      : COMPANY_DESCRIPTION_BLOCK.trim();

    if (newText.length > 2000) {
      alert("Adding company details exceeds the 2000 character limit.");
      return;
    }

    descriptionInput.value = newText;

    // Trigger counter update
    descriptionInput.dispatchEvent(new Event("input", { bubbles: true }));

    // Optional: scroll to bottom
    descriptionInput.scrollTop = descriptionInput.scrollHeight;
  });
});

// Hide permit section for non-admin
document.addEventListener("DOMContentLoaded", () => {
  const isAdmin = atob(localStorage.getItem("is_admin") || "0") === "1";

  if (isAdmin) return;

  // Hide permit section
  const permitSection = document.getElementById("permitSection");
  if (permitSection) {
    permitSection.classList.add("hidden");
  }

  // Make permit fields non-mandatory
  const permitFields = ["permitType", "advertisement_number", "license_date"];

  permitFields.forEach((nameOrId) => {
    const field =
      document.getElementById(nameOrId) ||
      document.querySelector(`[name="${nameOrId}"]`);

    if (!field) return;

    field.removeAttribute("required");
    field.disabled = true;
  });
});

// Hide edit page for non-admin
document.addEventListener("DOMContentLoaded", async () => {
  const isAdmin = atob(localStorage.getItem("is_admin") || "0") === "1";

  // 🚫 Non-admin: show not authorised page
  if (!isAdmin) {
    const root = document.getElementById("editPageRoot");

    if (root) {
      root.innerHTML = `
        <div class="max-w-xl mx-auto mt-20 bg-white border border-red-200 rounded-2xl shadow-sm p-8 text-center">
          <div class="text-5xl text-red-500 mb-4">
            <i class="fa-solid fa-ban"></i>
          </div>

          <h1 class="text-xl font-bold text-slate-800 mb-2">
            Not authorised
          </h1>

          <p class="text-md text-slate-500 mb-6">
            You do not have permission to view this page.
          </p>

          <a href="?page=listings&action=list"
             class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                    bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <i class="fa-solid fa-arrow-left"></i>
            Back to Listings
          </a>
        </div>
      `;
    }

    return; // ⛔ stop all edit logic
  }

  // ✅ Admin only logic below
  if (typeof loadFormOptions === "function") {
    await loadFormOptions();
  }

  if (typeof loadListingForEdit === "function") {
    await loadListingForEdit(listingId);
  }

  if (typeof setupEditForm === "function") {
    setupEditForm(listingId);
  }
});
