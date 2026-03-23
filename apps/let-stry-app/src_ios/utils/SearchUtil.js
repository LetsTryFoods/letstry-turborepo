import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@MyApp_recent_searches';
const MAX_RECENT = 5;

export const saveRecentSearch = async (searchTerm) => {
  try {
    const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    let searches = stored ? JSON.parse(stored) : [];
    // Remove if already present
    searches = searches.filter(term => term !== searchTerm);
    // Add to front
    searches.unshift(searchTerm);
    // Keep only latest MAX_RECENT
    if (searches.length > MAX_RECENT) searches = searches.slice(0, MAX_RECENT);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch (e) {
    // handle error
  }
};

export const getRecentSearches = async () => {
  try {
    const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};
