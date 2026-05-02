import { Platform } from 'react-native';

const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const SDUI_BASE_URL = process.env.EXPO_PUBLIC_SDUI_URL || `http://${LOCALHOST}:4000`;

export class SDUIService {
  static async getScreenConfig(screenId: string) {
    try {
      const response = await fetch(`${SDUI_BASE_URL}/sdui/screen/${screenId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch SDUI config for ${screenId}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[SDUIService] Error fetching screen config:', error);
      return null;
    }
  }

  static async getNavigationConfig() {
    try {
      const response = await fetch(`${SDUI_BASE_URL}/sdui/navigation`);
      if (!response.ok) {
        throw new Error('Failed to fetch SDUI navigation config');
      }
      return await response.json();
    } catch (error) {
      console.error('[SDUIService] Error fetching navigation config:', error);
      return null;
    }
  }
}
