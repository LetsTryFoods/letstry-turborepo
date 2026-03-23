// // import { API_BASE_URL } from '@env';
// const API_BASE_URL = "https://api.letstryfoods.com"

// export const fetchActiveEvents = async () => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/events/active`);
    
//     if (!response.ok) {
//       throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
//     }
    
//     const eventsJson = await response.json();
    
//     return {
//       backgroundImageUrl: String(eventsJson.backgroundImageUrl || ""),
//       events: (eventsJson.events || []).map(event => ({
//         ...event,
//         name: String(event.name || "Unnamed Event"),
//         imageUrl: String(event.imageUrl || ""),
//         products: (event.products || []).map(product => ({
//           ...product,
//           id: String(product.id || Math.random().toString()),
//           imageUrl: String(product.imageUrl || "")
//         }))
//       }))
//     };
    
//   } catch (err) {
//     console.error("Error fetching active events:", err);
//     throw err;
//   }
// };









import crashlytics from '@react-native-firebase/crashlytics';

export const fetchActiveEvents = async () => {
  // Define the URL right inside the function to be 100% safe.
  const API_BASE_URL = "https://api.letstryfoods.com";

  try {
    const response = await fetch(`${API_BASE_URL}/api/events/active`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
    }
    
    const eventsJson = await response.json();
    
    // This includes the fix for your colors from before
    return {
      backgroundImageUrl: String(eventsJson.backgroundImageUrl || ""),
      textColor: String(eventsJson.textColor || "#000000"),
      headerColor: String(eventsJson.headerColor || "#FFFFFF"),
      events: (eventsJson.events || []).map(event => ({
        ...event,
        name: String(event.name || "Unnamed Event"),
        imageUrl: String(event.imageUrl || ""),
        products: (event.products || []).map(product => ({
          ...product,
          id: String(product.id || Math.random().toString()),
          imageUrl: String(product.imageUrl || "")
        }))
      }))
    };
    
  } catch (err) {
    // Log the error and then re-throw it so react-query knows the fetch failed.
    console.error("Error fetching active events:", err);
    crashlytics().recordError(err);
    throw err;
  }
};