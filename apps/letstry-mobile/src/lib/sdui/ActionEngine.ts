import { Linking } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export type ActionType = 'NAVIGATE' | 'API_CALL' | 'OPEN_URL' | 'SHOW_TOAST';

export interface SDUIAction {
  type: ActionType;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: any;
  headers?: Record<string, string>;
  destination?: string;
  url?: string;
  message?: string;
  onSuccess?: SDUIAction;
  onError?: SDUIAction;
}

export class ActionEngine {
  static async execute(action?: SDUIAction, contextData?: any) {
    if (!action) return;

    try {
      switch (action.type) {
        case 'NAVIGATE':
          if (action.destination) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(action.destination as any);
          }
          break;

        case 'OPEN_URL':
          if (action.url) {
            const supported = await Linking.canOpenURL(action.url);
            if (supported) {
              await Linking.openURL(action.url);
            } else {
              console.warn(`[ActionEngine] Cannot open URL: ${action.url}`);
            }
          }
          break;

        case 'API_CALL':
          if (action.endpoint) {
            // Note: In Phase 3, we will inject form data into the payload here
            const options: RequestInit = {
              method: action.method || 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...action.headers,
              },
            };

            if (action.payload && action.method !== 'GET') {
              options.body = JSON.stringify(action.payload);
            }

            const response = await fetch(action.endpoint, options);

            if (!response.ok) throw new Error('API_CALL failed');

            if (action.onSuccess) {
              await this.execute(action.onSuccess, contextData);
            }
          }
          break;

        case 'SHOW_TOAST':
          if (action.message) {
            // Placeholder for Toast system
            console.log(`[TOAST] ${action.message}`);
          }
          break;

        default:
          console.warn(`[ActionEngine] Unknown action type: ${(action as any).type}`);
      }
    } catch (error) {
      console.error('[ActionEngine] Execution Error:', error);
      if (action.onError) {
        await this.execute(action.onError, contextData);
      }
    }
  }
}
