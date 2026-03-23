const API_BASE_URL = '';

const getProfile = async (token) => {
  const response = await fetch("https://api.letstryfoods.com/api/profile", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Profile request failed: ${response.status} ${message}`);
  }

  return response.json();
};


const updateProfile = async (profileData, token) => {
  const response = await fetch("https://api.letstryfoods.com/api/profile", {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Profile update failed: ${response.status} ${message}`);
  }

  return response.json();
};

export const ProfileService = {
  getProfile,
  updateProfile,
};
