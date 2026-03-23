// // import { API_BASE_URL } from '@env';

// const API_BASE_URL = "https://api.letstryfoods.com"

// const CHARGES_ENDPOINT = "/api/charges";
// const API_URL = `${API_BASE_URL}${CHARGES_ENDPOINT}`;

// const getBillCharges = async () => {
//     try {
//         const response = await fetch(API_URL, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (!response.ok) {
//             const error = new Error(`HTTP Error: ${response.status} ${response.statusText}`);
//             error.status = response.status;
//             throw error;
//         }

//         const data = await response.json();
//         return data;

//     } catch (error) {
//         console.error("Failed to fetch bill charges:", error);
//         throw error;
//     }
// };

// export const chargesService = {
//     getBillCharges,
// };







// // services/ChargesService.js

// const API_BASE_URL = "https://api.letstryfoods.com";

// // ✅ MODIFICATION START: Updated function to call the new quote endpoint
// const getBillCharges = async (subtotal, state, pincode) => {
//   // Guard against making calls with invalid data
//   if (!subtotal || !state || !pincode) {
//     // Return a default object to prevent crashes
//     return {
//       delivery_charge: 0,
//       handling_charge: 0,
//       gst_total: 0,
//     };
//   }

//   const API_URL = `${API_BASE_URL}/api/charges/quote?subtotal=${subtotal}&state=${state}&pincode=${pincode}`;

//   try {
//     const response = await fetch(API_URL, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       const error = new Error(`HTTP Error: ${response.status} ${response.statusText}`);
//       error.status = response.status;
//       throw error;
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Failed to fetch bill charges quote:", error);
//     throw error;
//   }
// };
// // ✅ MODIFICATION END

// export const chargesService = {
//   getBillCharges,
// };














const API_BASE_URL = "https://api.letstryfoods.com";

// Function now accepts subtotal, state, and pincode
const getBillCharges = async (subtotal, state, pincode) => {
  // Use 0 as default for subtotal if null or undefined
  const safeSubtotal = subtotal || 0;
  
  // Only proceed if we have a subtotal greater than 0 and a valid state/pincode
  if (safeSubtotal <= 0 || !state || !pincode) {
    return {
      delivery_charge: 0,
      handling_charge: 0,
      gst_total: 0,
    };
  }

  // Construct the API URL with all required query parameters
  const API_URL = `${API_BASE_URL}/api/charges/quote?subtotal=${safeSubtotal}&state=${state}&pincode=${pincode}`;

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      error.status = response.status; 
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch bill charges quote:", error);
    // Return a safe default object on API failure to prevent context crash
    return { delivery_charge: 0, handling_charge: 0, gst_total: 0, error };
  }
};

export const chargesService = {
  getBillCharges,
};
