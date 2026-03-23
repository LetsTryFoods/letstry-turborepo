// // //192.168.1.14:6000/api/giftboxes

// // const API_BASE_URL = "https://api.letstryfoods.com"




export const fetchHamperDetails = async (hamperId) => {
  try {
    // const response = await fetch(`http://192.168.1.14:8000/api/giftboxes/${hamperId}`);
    
    const response = await fetch(`https://api.letstryfoods.com/api/giftboxes/${hamperId}`);


    
    if (!response.ok) {
      throw new Error(`Network response was not ok. Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch hamper details for ID ${hamperId}:`, error);
    // Return null to indicate that the fetch failed, so the UI can handle it.
    return null;
  }
};