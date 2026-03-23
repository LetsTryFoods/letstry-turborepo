// services/RangeService.js
// import { API_BASE_URL } from '@env';
const API_BASE_URL = "https://api.letstryfoods.com";
//const API_BASE_URL = "http://192.168.1.14:5000"

export const fetchRangeProducts = async (rangeName) => {
  try {
    const url = `${API_BASE_URL}/api/foods/range?name=${encodeURIComponent(rangeName)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch range "${rangeName}": ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(item => ({
      ...item,
      id: item.id != null ? String(item.id) : Math.random().toString(),
      imageUrl: item.imageUrl != null ? String(item.imageUrl) : "",
      // add any other field-normalization here
    }));
  } catch (err) {
    console.error(`Error in fetchRangeProducts("${rangeName}")`, err);
    throw err;
  }
};