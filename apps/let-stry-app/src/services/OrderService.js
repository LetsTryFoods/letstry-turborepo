// import { API_BASE_URL } from '@env';
const API_BASE_URL = "https://apiv2.letstryfoods.com"
//const API_BASE_URL = "http://192.168.1.14:8000"
// Orders endpoints
const ORDERS_URL = `${API_BASE_URL}/api/orders`;

/**
 * Place a new order
 */
export async function placeOrder(orderData, idToken) {
  try {
    const headers = {
      "Authorization": `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${ORDERS_URL}/place`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in placeOrder:', error);
    throw error;
  }
}

/**
 * Fetch user's orders
 */
export async function fetchMyOrders(idToken) {
  try {
    const response = await fetch(`${ORDERS_URL}/my-orders`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${idToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Track order by order ID
 */
export async function trackOrder(orderId, idToken) {
  try {
    const response = await fetch(`${ORDERS_URL}/${orderId}/track`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error tracking order:', error);
    throw error;
  }
}




















