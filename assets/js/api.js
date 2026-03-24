let API_BASE;

if (ENV === "production") {
  API_BASE = "https://crm.mira-international.com/pub/property-listing/api";
} else {
  API_BASE = "http://localhost:3000/api";
}

async function api(url, options = {}) {
  const config = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  config.headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Convert body to JSON if it's an object
  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(API_BASE + url, config);
    const rawText = await res.text();
    let parsed;

    if (rawText) {
      try {
        parsed = JSON.parse(rawText);
      } catch (parseError) {
        parsed = null;
      }
    }

    if (!res.ok) {
      const error =
        parsed ||
        ({
          message:
            `HTTP ${res.status} ${res.statusText}` +
            (rawText ? `: ${rawText.slice(0, 500)}` : ""),
        });
      throw error;
    }

    if (!rawText) return null;

    if (parsed !== null) {
      return parsed;
    }

    throw new Error(
      `Invalid JSON response from API: ${rawText.slice(0, 500)}`,
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
