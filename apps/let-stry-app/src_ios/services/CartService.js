// // import { API_BASE_URL } from '@env';

// const API_BASE_URL = "http://192.168.1.14:8000"

// //const API_BASE_URL = "https://api.letstryfoods.com"
// const API_URL = `${API_BASE_URL}/api/cart`;
// const OFFERS_API_URL = `${API_BASE_URL}/api/offers`;

// // Helper function to handle API responses
// const handleResponse = async (response) => {
//   const text = await response.text();
//   if (!text) {
//     return {};
//   }
//   try {
//     return JSON.parse(text);
//   } catch (error) {
//     console.error("Error parsing JSON:", error);
//     return {};
//   }
// };

// export const addToCart = async (foodId, token) => {
//   try {
//     console.log(`Adding to cart: ${foodId} with token`);
//     const res = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ foodId }),
//     });
//     return await handleResponse(res);
//   } catch (error) {
//     console.error("Error adding to cart:", error);
//     return {};
//   }
// };

// export const removeQtyFromCart = async (foodId, token) => {
//   try {
//     console.log(`Removing from cart: ${foodId} with token`);
//     const res = await fetch(`${API_URL}/subtract`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ foodId }),
//     });
//     return await handleResponse(res);
//   } catch (error) {
//     console.error("Error removing from cart:", error);
//     return {};
//   }
// };

// export const getCartData = async (token) => {
//   try {
//     console.log("Fetching cart data with token");
//     const res = await fetch(API_URL, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     const data = await handleResponse(res);
//     console.log("Cart data received:", data);
//     return data;
//   } catch (error) {
//     console.error("Error fetching cart data:", error);
//     return {};
//   }
// };

// export const getFreeGiftEligibility = async (cartTotal) => {
//   try {
//     console.log(`Checking free gift eligibility for cart total: ${cartTotal}`);
//     const res = await fetch(`${OFFERS_API_URL}/free-gift-eligibility?cartTotal=${cartTotal}`);
//     const data = await handleResponse(res);
//     console.log("Free gift eligibility data:", data);
//     return data;
//   } catch (error) {
//     console.error("Error checking free gift eligibility:", error);
//     return { eligibleGiftCount: 0, products: [] };
//   }
// };

// export const addMultipleFoods = async (itemsObj, token) => {
//   try {
//     console.log("Adding multiple foods to cart:", itemsObj);
//     const res = await fetch(`${API_URL}/add-multiple-foods`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ items: itemsObj }),
//     });
//     return await handleResponse(res);
//   } catch (err) {
//     console.error("Error in addMultipleFoods", err);
//     return {};
//   }
// };

// export const subtractMultipleFoods = async (itemsObj, token) => {
//   try {
//     console.log("Subtracting multiple foods from cart:", itemsObj);
//     const res = await fetch(`${API_URL}/subtract-multiple-foods`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ items: itemsObj }),
//     });
//     return await handleResponse(res);
//   } catch (err) {
//     console.error("Error in subtractMultipleFoods", err);
//     return {};
//   }
// };

// export const updateCart = async (itemsObj, token) => {
//   try {
//     console.log(`updating items in cart: ${itemsObj} with token`);
//     const res = await fetch(`${API_URL}/updateCart`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ items: itemsObj }),
//     });
//     return await handleResponse(res);
//   } catch (err) {
//     console.error("Error in updateCart", err);
//     return {};
//   }
// };








// src/services/CartService.js

import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * IMPORTANT: Use your public API domain in production.
 * If you temporarily point to a LAN server for local testing,
 * remember that physical devices can't hit http://localhost.
 */
 const API_BASE_URL = "https://api.letstryfoods.com"; // ← use this for device/production
//const API_BASE_URL = "http://192.168.1.22:8000";    // ← only for LAN testing

const API_URL = `${API_BASE_URL}/api/cart`;
const OFFERS_API_URL = `${API_BASE_URL}/api/offers`;

/** Utility: convert fetch Response to JSON safely */
const handleResponse = async (res) => {
  const text = await res.text();
  let json = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("[CartService] JSON parse error:", e, "raw:", text.slice(0, 200));
    }
  }
  if (!res.ok) {
    // bubble up status + body so the caller can decide
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
};

/** Utility: ensure we always use the BACKEND JWT saved after login */
const buildAuthHeader = (token) => {
  const t = token && String(token).trim();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

/** Optional helper: read AUTH_TOKEN from storage if caller doesn't pass it */
const getStoredAuthToken = async () => {
  try {
    return await AsyncStorage.getItem("AUTH_TOKEN");
  } catch {
    return null;
  }
};

/* ========================= CART APIs ========================= */

export const addToCart = async (foodId, token) => {
  try {
    const authToken = token ?? (await getStoredAuthToken());
    console.log(`[CartService] addToCart: ${foodId} (token present: ${!!authToken})`);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...buildAuthHeader(authToken),
      },
      body: JSON.stringify({ foodId }),
    });

    return await handleResponse(res);
  } catch (error) {
    console.error("[CartService] addToCart error:", error);
    return {};
  }
};

export const removeQtyFromCart = async (foodId, token) => {
  try {
    const authToken = token ?? (await getStoredAuthToken());
    console.log(`[CartService] removeQtyFromCart: ${foodId} (token present: ${!!authToken})`);

    const res = await fetch(`${API_URL}/subtract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...buildAuthHeader(authToken),
      },
      body: JSON.stringify({ foodId }),
    });

    return await handleResponse(res);
  } catch (error) {
    console.error("[CartService] removeQtyFromCart error:", error);
    return {};
  }
};

export const getCartData = async (token) => {
  try {
    const authToken = token ?? (await getStoredAuthToken());
    console.log(`[CartService] getCartData (token present: ${!!authToken})`);

    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...buildAuthHeader(authToken),
      },
    });

    const data = await handleResponse(res);
    console.log("[CartService] getCartData ->", data);
    return data;
  } catch (error) {
    console.error("[CartService] getCartData error:", error);
    return {};
  }
};

export const getFreeGiftEligibility = async (cartTotal) => {
  try {
    const url = `${OFFERS_API_URL}/free-gift-eligibility?cartTotal=${encodeURIComponent(
      cartTotal ?? 0
    )}`;
    console.log(`[CartService] free-gift-eligibility -> ${url}`);

    // Public endpoint—no auth header
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const data = await handleResponse(res);
    console.log("[CartService] freeGiftEligibility ->", data);
    return data;
  } catch (error) {
    console.error("[CartService] freeGiftEligibility error:", error);
    return { eligibleGiftCount: 0, products: [] };
  }
};

export const addMultipleFoods = async (itemsObj, token) => {
  try {
    const authToken = token ?? (await getStoredAuthToken());
    console.log("[CartService] addMultipleFoods items:", itemsObj);

    const res = await fetch(`${API_URL}/add-multiple-foods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...buildAuthHeader(authToken),
      },
      body: JSON.stringify({ items: itemsObj }),
    });

    return await handleResponse(res);
  } catch (err) {
    console.error("[CartService] addMultipleFoods error:", err);
    return {};
  }
};

export const subtractMultipleFoods = async (itemsObj, token) => {
  try {
    const authToken = token ?? (await getStoredAuthToken());
    console.log("[CartService] subtractMultipleFoods items:", itemsObj);

    const res = await fetch(`${API_URL}/subtract-multiple-foods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...buildAuthHeader(authToken),
      },
      body: JSON.stringify({ items: itemsObj }),
    });

    return await handleResponse(res);
  } catch (err) {
    console.error("[CartService] subtractMultipleFoods error:", err);
    return {};
  }
};

export const updateCart = async (itemsObj, token) => {
  try {
    const authToken = token ?? (await getStoredAuthToken());
    console.log("[CartService] updateCart items:", itemsObj);

    const res = await fetch(`${API_URL}/updateCart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...buildAuthHeader(authToken),
      },
      body: JSON.stringify({ items: itemsObj }),
    });

    return await handleResponse(res);
  } catch (err) {
    console.error("[CartService] updateCart error:", err);
    return {};
  }
};