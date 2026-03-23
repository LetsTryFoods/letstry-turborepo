// import { API_BASE_URL } from '@env';


 const API_BASE_URL = "https://api.letstryfoods.com"
//const API_BASE_URL = "http://192.168.1.14:8000"

const BASE_URL = `${API_BASE_URL}/api/address`;

// Always pass idToken as an argument!
export async function fetchAddress(idToken) {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch addresses: ${response.status}`);
  }
  const data = await response.json();
  console.log("Fetch Address API response:", data);
  return data;
}

export async function addAddress(idToken, address) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(address),
  });
  const text = await response.text();
  console.log("Add Address API response text:", text);
  if (!response.ok) {
    throw new Error(`Failed to add address: ${response.status}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function deleteAddress(idToken, addressId) {
  const response = await fetch(`${BASE_URL}/${addressId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });
  const text = await response.text();
  console.log("Delete Address API response text:", text);
  if (!response.ok) {
    throw new Error(`Failed to delete address: ${response.status} - ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
