let statusChart = null;
let locationChart = null;
let priceChart = null;

// Load reports data and render charts
async function loadReports() {
  try {
    const data = await api('/reports/listings-count');
    
    // Render status chart
    renderStatusChart(data.status || {});
    
    // Render location chart
    renderLocationChart(data.locations || {});
    
    // Render price distribution chart
    renderPriceChart(data.price_ranges || []);
  } catch (error) {
    console.error("Error loading reports:", error);
    
    // Try to load from listings if reports endpoint doesn't exist
    try {
      const listings = await api('/listings');
      const processedData = processListingsData(listings);
      renderStatusChart(processedData.status);
      renderLocationChart(processedData.locations);
      renderPriceChart(processedData.price_ranges);
    } catch (err) {
      console.error("Error loading listings for reports:", err);
    }
  }
}

// Process listings data for charts
function processListingsData(listings) {
  const status = {};
  const locations = {};
  const prices = [];

  listings.forEach(listing => {
    // Count by status
    const stat = listing.status || 'unknown';
    status[stat] = (status[stat] || 0) + 1;

    // Count by location
    const locName = listing.location?.name || 'Unknown';
    locations[locName] = (locations[locName] || 0) + 1;

    // Collect prices
    if (listing.price) {
      prices.push(parseFloat(listing.price));
    }
  });

  // Create price ranges
  const price_ranges = createPriceRanges(prices);

  return { status, locations, price_ranges };
}

// Create price ranges for chart
function createPriceRanges(prices) {
  if (prices.length === 0) return [];

  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const range = max - min;
  const bucketSize = Math.max(range / 5, 10000); // At least 5 buckets

  const ranges = [];
  for (let i = 0; i < 5; i++) {
    const start = min + (i * bucketSize);
    const end = start + bucketSize;
    const count = prices.filter(p => p >= start && (i === 4 ? p <= end : p < end)).length;
    
    ranges.push({
      label: `$${formatNumber(start)} - $${formatNumber(end)}`,
      count: count
    });
  }

  return ranges;
}

// Render status chart
function renderStatusChart(statusData) {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;

  const labels = Object.keys(statusData);
  const data = Object.values(statusData);
  const colors = {
    'available': 'rgba(34, 197, 94, 0.8)',
    'sold': 'rgba(239, 68, 68, 0.8)',
    'pending': 'rgba(234, 179, 8, 0.8)',
    'unknown': 'rgba(156, 163, 175, 0.8)'
  };

  if (statusChart) {
    statusChart.destroy();
  }

  statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: labels.map(label => colors[label] || colors['unknown']),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Render location chart
function renderLocationChart(locationData) {
  const ctx = document.getElementById('locationChart');
  if (!ctx) return;

  const labels = Object.keys(locationData);
  const data = Object.values(locationData);

  if (locationChart) {
    locationChart.destroy();
  }

  locationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Listings',
        data: data,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// Render price distribution chart
function renderPriceChart(priceRanges) {
  const ctx = document.getElementById('priceChart');
  if (!ctx) return;

  const labels = priceRanges.map(r => r.label);
  const data = priceRanges.map(r => r.count);

  if (priceChart) {
    priceChart.destroy();
  }

  priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Listings',
        data: data,
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  });
}

// Helper function to format numbers
function formatNumber(num) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(num);
}