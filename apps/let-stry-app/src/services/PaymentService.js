// import { API_BASE_URL } from '@env';
const API_BASE_URL='https://apiv2.letstryfoods.com'
const PAYMENT_API_URL = `${API_BASE_URL}/api/zaakpay`;

/**
 * Makes a card payment by sending card data to the payment API.
 * @param {object} cardData - The card details for the payment.
 * @returns {Promise<object>} The response from the payment API.
 */
export async function makeCardPayment(cardData) {
  try {
    const response = await fetch(`${PAYMENT_API_URL}/card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in makeCardPayment:', error);
    throw error;
  }
}

/**
 * Initiates a UPI payment by sending UPI data to the payment API.
 * @param {object} upiData - The UPI details for the payment (e.g., { orderId, amount, email, vpa }).
 * @param {string} idToken - Authorization token.
 * @returns {Promise<object>} The response from the payment API.
 */
export async function makeUpiPayment(upiData, idToken) {
  try {
    const response = await fetch(`${PAYMENT_API_URL}/upi-collect`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(upiData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in makeUpiPayment:', error);
    throw error;
  }
}

/**
 * Initiates a UPI Intent payment to generate payment links for UPI apps.
 * @param {object} intentData - The data for the UPI Intent request (e.g., { orderId, amount, email }).
 * @param {string} idToken - Authorization token.
 * @returns {Promise<object>} The response from the payment API, containing payment URLs.
 */
export async function initiateUpiIntent(intentData, idToken) {
  try {
    const response = await fetch(`${PAYMENT_API_URL}/upi-intent`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(intentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in initiateUpiIntent:', error);
    throw error;
  }
}

/**
 * Checks the status of a UPI transaction.
 * @param {string} orderId - The order ID of the transaction to check.
 * @param {string} idToken - Authorization token.
 * @returns {Promise<object>} The status response from the payment API.
 */
export async function checkUpiStatus(orderId, idToken) {
  try {
    const response = await fetch(`${PAYMENT_API_URL}/status?orderId=${orderId}`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in checkUpiStatus:', error);
    throw error;
  }
}
