import AsyncStorage from "@react-native-async-storage/async-storage";

const SELECTED_ADDRESS_KEY = "selectedAddress";

export async function saveSelectedAddressToStorage(address) {
  try {
    await AsyncStorage.setItem(SELECTED_ADDRESS_KEY, JSON.stringify(address));
  } catch (e) {
    console.error("Error saving selected address:", e);
  }
}

export async function getSelectedAddressFromStorage() {
  try {
    const value = await AsyncStorage.getItem(SELECTED_ADDRESS_KEY);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error("Error loading selected address:", e);
    return null;
  }
}
