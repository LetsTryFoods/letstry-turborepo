// import { SEARCH_BASE_URL } from '@env';
const SEARCH_BASE_URL = "https://recsys.letstryfoods.com"
const BASE_URL = `${SEARCH_BASE_URL}/api/recommendations`;

export async function fetchFBTRecommendations(cartItems) {
  try {
    const body = { cart_items: cartItems };

    const response = await fetch(`${BASE_URL}/fbt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching FBT recommendations:", error);
    return [];
  }
}

export async function fetchSimilarProducts(eanCode) {
  try {
    const url = `${BASE_URL}/similarproducts/${eanCode}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return [];
  }
}

export async function fetchBestsellers() {
  try {
    const url = `${BASE_URL}/bestsellers`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("bestseller:", data);
    return data || [];
  } catch (error) {
    console.error("Error fetching bestsellers:", error);
    return [];
  }
}
