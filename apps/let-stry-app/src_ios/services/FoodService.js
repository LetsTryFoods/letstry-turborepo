// import { API_BASE_URL, SEARCH_BASE_URL } from '@env';
const API_BASE_URL = "https://apiv2.letstryfoods.com"
//http://192.168.1.14:5000/api/foods

const SEARCH_BASE_URL = "https://recsys.letstryfoods.com"
// Foods endpoints
const FOODS_URL = `${API_BASE_URL}/api/foods`;

// --- Fetch Food List ---
export const fetchFoodList = async () => {
  try {
    console.log("Fetching from:", FOODS_URL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(FOODS_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("API did not return an array:", data);
      return [];
    }

    console.log("Data fetched successfully:", data.length, "items");
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Request timed out");
      throw new Error("Request timed out. Please check your connection and try again.");
    }
    console.error("Network error:", error.message);
    throw error;
  }
};

// --- Fetch Food Details ---
export const fetchFoodDetails = async (id) => {
  try {
    const detailUrl = `${FOODS_URL}/${id}`;
    console.log("Fetching product details from:", detailUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(detailUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch food detail: ${response.status}`);
    }

    const data = await response.json();
    console.log("Product details fetched successfully:");
    return data;
  } catch (error) {
    console.error("Error fetching food details:", error);
    return null;
  }
};

// --- Search Foods ---
const SEARCH_URL = `${SEARCH_BASE_URL}/api/search`;
export const searchFoods = async (query) => {
  if (!query || typeof query !== "string" || query.trim() === "") {
    console.warn("Empty search query provided.");
    return [];
  }

  try {
    const searchUrl = `${SEARCH_URL}?q=${encodeURIComponent(query)}`;
    console.log("Searching foods from:", searchUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error("Search API did not return an array:", data);
      return [];
    }

    console.log("Search results:", data.length, "items");
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Search request timed out");
      throw new Error("Request timed out. Please check your connection and try again.");
    }
    console.error("Search network error:", error.message);
    throw error;
  }
};

// --- Autocomplete Functionality ---
const AUTOCOMPLETE_URL = `${SEARCH_BASE_URL}/api/autocomplete`;
export const fetchAutocompleteSuggestions = async (query) => {
  if (!query || query.trim().length < 2) return [];

  const autocompleteUrl = `${AUTOCOMPLETE_URL}?q=${encodeURIComponent(query)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      autocompleteUrl,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Autocomplete API error:", errorText);
      throw new Error(`Autocomplete failed: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Autocomplete API did not return an array:", data);
      return [];
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Autocomplete request timed out");
    } else {
      console.error("Autocomplete network error:", error.message);
    }
    return [];
  }
};

// --- Fetch New Launches ---
export const fetchNewLaunches = async () => {
  try {
    const response = await fetch(`${FOODS_URL}/new-launch`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching new launches:", error);
    return [];
  }
};

// ... aapka existing code

export const fetchCombos = async () => {
  try {
    const response = await fetch('https://api.letstryfoods.com/api/combos');
    if (!response.ok) {
      throw new Error('Failed to fetch combos');
    }
    const data = await response.json();
    return data; // Assuming the API returns an array of combos
  } catch (error) {
    console.error('Error fetching combos:', error);
    return []; // Return an empty array on error
  }
};






// // import { API_BASE_URL, SEARCH_BASE_URL } from '@env';
// //const API_BASE_URL = "https://api.letstryfoods.com";
// // Use your local IP for testing if needed
// const API_BASE_URL = "http://192.168.1.14:5000"; 
// const SEARCH_BASE_URL = "https://recsys.letstryfoods.com";

// // Foods endpoints
// const FOODS_URL = `${API_BASE_URL}/api/foods`;

// // --- Fetch Food List ---
// export const fetchFoodList = async () => {
//   try {
//     // 1. UPDATED: Changed the endpoint to '/cards'
//     const CARDS_URL = `${FOODS_URL}/cards`;
//     console.log("Fetching from:", CARDS_URL);

//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 15000);

//     const response = await fetch(CARDS_URL, { // 2. UPDATED: Using the new URL
//       method: "GET",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//       signal: controller.signal,
//     });

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();

//     // 3. UPDATED: The new API returns an object with a 'content' array.
//     // We now check for 'data.content' and return that.
//     if (!data || !Array.isArray(data.content)) {
//       console.error("API did not return a valid 'content' array:", data);
//       return [];
//     }

//     console.log("Data fetched successfully:", data.content.length, "items");
//     return data.content; // Return the array of products
//   } catch (error) {
//     if (error.name === "AbortError") {
//       console.error("Request timed out");
//       throw new Error("Request timed out. Please check your connection and try again.");
//     }
//     console.error("Network error:", error.message);
//     throw error;
//   }
// };


// // --- Fetch Food Details ---
// // This function might need updates if the single product endpoint also changed.
// // For now, it remains the same.
// export const fetchFoodDetails = async (id) => {
//   try {
//     const detailUrl = `${FOODS_URL}/${id}`;
//     console.log("Fetching product details from:", detailUrl);

//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 15000);

//     const response = await fetch(detailUrl, {
//       method: "GET",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//       signal: controller.signal,
//     });

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       throw new Error(`Failed to fetch food detail: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("Product details fetched successfully:");
//     return data;
//   } catch (error) {
//     console.error("Error fetching food details:", error);
//     return null;
//   }
// };

// // --- Search Foods ---
// const SEARCH_URL = `${SEARCH_BASE_URL}/api/search`;
// export const searchFoods = async (query) => {
//   if (!query || typeof query !== "string" || query.trim() === "") {
//     console.warn("Empty search query provided.");
//     return [];
//   }

//   try {
//     const searchUrl = `${SEARCH_URL}?q=${encodeURIComponent(query)}`;
//     console.log("Searching foods from:", searchUrl);

//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 15000);

//     const response = await fetch(searchUrl, {
//       method: "GET",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//       signal: controller.signal,
//     });

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       throw new Error(`Search failed: ${response.status}`);
//     }

//     const data = await response.json();
//     if (!Array.isArray(data)) {
//       console.error("Search API did not return an array:", data);
//       return [];
//     }

//     console.log("Search results:", data.length, "items");
//     return data;
//   } catch (error) {
//     if (error.name === "AbortError") {
//       console.error("Search request timed out");
//       throw new Error("Request timed out. Please check your connection and try again.");
//     }
//     console.error("Search network error:", error.message);
//     throw error;
//   }
// };

// // --- Autocomplete Functionality ---
// const AUTOCOMPLETE_URL = `${SEARCH_BASE_URL}/api/autocomplete`;
// export const fetchAutocompleteSuggestions = async (query) => {
//   if (!query || query.trim().length < 2) return [];

//   const autocompleteUrl = `${AUTOCOMPLETE_URL}?q=${encodeURIComponent(query)}`;

//   try {
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 15000);

//     const response = await fetch(
//       autocompleteUrl,
//       {
//         method: "GET",
//         headers: {
//           Accept: "application/json",
//         },
//         signal: controller.signal,
//       }
//     );

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Autocomplete API error:", errorText);
//       throw new Error(`Autocomplete failed: ${response.status}`);
//     }

//     const data = await response.json();

//     if (!Array.isArray(data)) {
//       console.error("Autocomplete API did not return an array:", data);
//       return [];
//     }

//     return data;
//   } catch (error) {
//     if (error.name === "AbortError") {
//       console.error("Autocomplete request timed out");
//     } else {
//       console.error("Autocomplete network error:", error.message);
//     }
//     return [];
//   }
// };

// // --- Fetch New Launches ---
// export const fetchNewLaunches = async () => {
//   try {
//     const response = await fetch(`${FOODS_URL}/new-launch`);
//     if (!response.ok) {
//       throw new Error(`API error: ${response.status}`);
//     }
//     const data = await response.json();
//     return Array.isArray(data) ? data : [];
//   } catch (error) {
//     console.error("Error fetching new launches:", error);
//     return [];
//   }
// };









// const API_BASE_URL = "https://api.letstryfoods.com";
// const SEARCH_BASE_URL = "https://recsys.letstryfoods.com";
// const FOODS_URL = `${API_BASE_URL}/api/foods`;

// // Generic retry wrapper
// const withRetry = async (fn, retries = 2, delay = 1000) => {
//   for (let i = 0; i <= retries; i++) {
//     try {
//       return await fn();
//     } catch (err) {
//       if (i === retries) throw err;
//       console.warn(`Retrying... attempt ${i + 1}`);
//       await new Promise((r) => setTimeout(r, delay));
//     }
//   }
// };

// // --- Fetch Food List ---
// export const fetchFoodList = async () => {
//   return await withRetry(async () => {
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 10000);

//     try {
//       const response = await fetch(FOODS_URL, {
//         method: "GET",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}`);
//       }

//       const data = await response.json();
//       if (!Array.isArray(data)) return [];
//       return data;
//     } catch (error) {
//       if (error.name === "AbortError") {
//         throw new Error("Request timed out");
//       }
//       throw new Error("Network error, please try again");
//     }
//   });
// };

// // --- Fetch Food Details ---
// export const fetchFoodDetails = async (id) => {
//   return await withRetry(async () => {
//     const detailUrl = `${FOODS_URL}/${id}`;
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 10000);

//     try {
//       const response = await fetch(detailUrl, {
//         method: "GET",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}`);
//       }

//       const data = await response.json();
//       return data;
//     } catch (error) {
//       if (error.name === "AbortError") {
//         throw new Error("Request timed out");
//       }
//       throw new Error("Network error, please try again");
//     }
//   });
// };

// // --- Search Foods ---
// const SEARCH_URL = `${SEARCH_BASE_URL}/api/search`;

// export const searchFoods = async (query) => {
//   if (!query?.trim()) return [];

//   return await withRetry(async () => {
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 10000);

//     try {
//       const response = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}`, {
//         method: "GET",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       if (!response.ok) throw new Error(`HTTP ${response.status}`);

//       const data = await response.json();
//       return Array.isArray(data) ? data : [];
//     } catch (error) {
//       if (error.name === "AbortError") {
//         throw new Error("Request timed out");
//       }
//       throw new Error("Network error, please try again");
//     }
//   });
// };
