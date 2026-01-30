let statusChart = null;
let typeChart = null;
let purposeChart = null;

// Load reports data and render charts
async function loadReports() {
  try {
    const response = await api("/?resource=reports");
    const data = response.data || {};

    renderStatusChart(data);
    renderTypeChart(data);
    renderPurposeChart(data);
  } catch (error) {
    console.error("Error loading reports:", error);
  }
}

/**
 * STATUS CHART
 * start, published, draft, pending approval
 */
function renderStatusChart(data) {
  const ctx = document.getElementById("statusChart");
  if (!ctx) return;

  const labels = ["Start", "Published", "Draft", "Pending Approval"];

  const values = [
    data.start_listings || 0,
    data.published_listings || 0,
    data.draft_listings || 0,
    data.pending_approval_listings || 0,
  ];

  if (statusChart) statusChart.destroy();

  statusChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(156, 163, 175, 0.8)",
            "rgba(234, 179, 8, 0.8)",
          ],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

/**
 * TYPE CHART
 * residential vs commercial
 */
function renderTypeChart(data) {
  const ctx = document.getElementById("typeChart");
  if (!ctx) return;

  const labels = ["Residential", "Commercial"];
  const values = [
    data.residential_listings || 0,
    data.commercial_listings || 0,
  ];

  if (typeChart) typeChart.destroy();

  typeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Listings",
          data: values,
          backgroundColor: "rgba(99, 102, 241, 0.8)",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}

/**
 * PURPOSE CHART
 * sale vs rent
 */
function renderPurposeChart(data) {
  const ctx = document.getElementById("purposeChart");
  if (!ctx) return;

  const labels = ["Sale", "Rent"];
  const values = [data.sale_listings || 0, data.rent_listings || 0];

  if (purposeChart) purposeChart.destroy();

  purposeChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "rgba(16, 185, 129, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}
