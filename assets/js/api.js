const API_BASE =
  "https://crm.mira-international.com/local/property-listing/api";

async function api(url, options = {}) {
  const config = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  // Convert body to JSON if it's an object
  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(API_BASE + url, config);

    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ message: "An error occurred" }));
      throw error;
    }

    return res.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
