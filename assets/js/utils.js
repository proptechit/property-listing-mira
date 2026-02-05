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
