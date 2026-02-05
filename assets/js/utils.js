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
