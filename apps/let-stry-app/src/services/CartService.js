
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * IMPORTANT: Use your public API domain in production.
 */
const API_BASE_URL = "https://apiv2.letstryfoods.com"; 
//const API_BASE_URL = "http://192.168.1.22:8000";   

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
    // Bubble up status + body so the caller can decide
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
    throw error;
  }
};

export const removeQtyFromCart = async (foodId, token) => {
  try {
    const authToken = token ?? (await getStoredAuthToken());
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
    throw error;
  }
};

export const getCartData = async (token) => {
  try {
    const authToken = token ?? (await getStoredAuthToken());
    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...buildAuthHeader(authToken),
      },
    });

    return await handleResponse(res);
  } catch (error) {
    console.error("[CartService] getCartData error:", error);
    throw error;
  }
};

export const getFreeGiftEligibility = async (cartTotal) => {
  try {
    const url = `${OFFERS_API_URL}/free-gift-eligibility?cartTotal=${encodeURIComponent(
      cartTotal ?? 0
    )}`;
    // Public endpoint—no auth header
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    return await handleResponse(res);
  } catch (error) {
    console.error("[CartService] freeGiftEligibility error:", error);
    return { eligibleGiftCount: 0, products: [] };
  }
};

// --- IMPORTANT: UPDATED TO THROW ERROR ON FAIL ---
export const addMultipleFoods = async (itemsObj, token) => {
  try {
    const authToken = token ?? (await getStoredAuthToken());
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
    throw err; // Throw so Context knows merge failed
  }
};

export const subtractMultipleFoods = async (itemsObj, token) => {
  try {
    const authToken = token ?? (await getStoredAuthToken());
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
    throw err;
  }
};

export const updateCart = async (itemsObj, token) => {
  try {
    const authToken = token ?? (await getStoredAuthToken());
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
    throw err;
  }
};