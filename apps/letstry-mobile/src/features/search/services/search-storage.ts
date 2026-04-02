import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@letstry_recent_searches';
const MAX_RECENT = 10;

export const saveRecentSearch = async (searchTerm: string) => {
  if (!searchTerm.trim()) return;
  try {
    const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    let searches: string[] = stored ? JSON.parse(stored) : [];
    
    // Remove if already present and add to front
    searches = [searchTerm, ...searches.filter(term => term !== searchTerm)];
    
    // Keep only latest MAX_RECENT
    if (searches.length > MAX_RECENT) searches = searches.slice(0, MAX_RECENT);
    
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch (e) {
    console.error('Error saving recent search:', e);
  }
};

export const getRecentSearches = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const clearRecentSearches = async () => {
  await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
};
