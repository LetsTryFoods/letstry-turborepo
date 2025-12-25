import { create } from 'zustand';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { authService } from '@/lib/firebase/auth-service';
import { whatsAppOtpService } from '@/lib/whatsapp/whatsapp-otp-service';
import { setAuthTokens, logoutAction, setGuestModeAction, getCurrentUser } from '@/lib/auth/auth-actions';
import { verifyOtpAndLogin } from '@/lib/auth/client-auth';
import { graphqlClient } from '@/lib/graphql/client-factory';
import { LOGOUT_MUTATION } from '@/lib/queries/auth';
import type { AuthUser } from '@/types/auth.types';
import { OtpProvider } from '@/types/whatsapp.types';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  otpProvider: OtpProvider | null;

  initialize: () => Promise<void>;
  loginWithPhone: (phoneNumber: string) => Promise<any>;
  sendFirebaseOTP: (phoneNumber: string) => Promise<any>;
  verifyOTP: (confirmationResult: any, otp: string) => Promise<void>;
  verifyWhatsAppOTP: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  setGuestMode: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: true,
  error: null,
  isInitialized: false,
  otpProvider: null,

  initialize: async () => {
    if (get().isInitialized) return;

    try {
      set({ isLoading: true });
      const currentUser = await getCurrentUser();
      if (currentUser) {
        set({
          user: {
            uid: currentUser.uid,
            phoneNumber: currentUser.phoneNumber,
            idToken: '',
            isGuest: false,
          },
          isAuthenticated: true,
          isGuest: false,
        });
      }
      onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            const currentState = get();
            if (currentState.user?.uid !== firebaseUser.uid) {
              set({
                user: {
                  uid: firebaseUser.uid,
                  phoneNumber: firebaseUser.phoneNumber,
                  idToken: token,
                  isGuest: false,
                },
                isAuthenticated: true,
                isGuest: false,
              });
            }
          } catch (error) {
            console.error('Auth state change error:', error);
          }
        } else {
          // Only clear if we had a user before
          const currentState = get();
          if (currentState.user && !currentState.isGuest) {
            set({
              user: null,
              isAuthenticated: false,
            });
          }
        }
      });

      set({ isInitialized: true });
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithPhone: async (phoneNumber: string) => {
    try {
      set({ error: null, otpProvider: null });

      const whatsappResult = await whatsAppOtpService.sendOTP(phoneNumber);

      if (whatsappResult.success) {
        set({ otpProvider: OtpProvider.WhatsApp });
        return { provider: 'whatsapp', message: whatsappResult.message };
      }

      set({ otpProvider: OtpProvider.Firebase });
      const confirmationResult = await authService.sendOTP(phoneNumber, 'recaptcha-container');
      return { provider: 'firebase', confirmationResult };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send OTP';
      set({ error: errorMessage, otpProvider: null });
      throw error;
    }
  },

  sendFirebaseOTP: async (phoneNumber: string) => {
    try {
      set({ error: null, otpProvider: OtpProvider.Firebase });
      const confirmationResult = await authService.sendOTP(phoneNumber, 'recaptcha-container');
      return { provider: 'firebase', confirmationResult };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send OTP';
      set({ error: errorMessage, otpProvider: null });
      throw error;
    }
  },

  verifyOTP: async (confirmationResult: any, otp: string) => {
    try {
      set({ error: null, isLoading: true });

      const { idToken, user: firebaseUser } = await authService.verifyOTP(confirmationResult, otp);

      const userData = {
        phoneNumber: firebaseUser.phoneNumber || "",
        firebaseUid: firebaseUser.uid,
      };

      const result = await verifyOtpAndLogin(idToken, userData);

      if (!result.success || !result.token) {
        throw new Error(result.error || "Authentication failed");
      }

      set({
        user: {
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber || "",
          idToken: result.token,
          isGuest: false,
        },
        isAuthenticated: true,
        isGuest: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to verify OTP';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyWhatsAppOTP: async (phoneNumber: string, otp: string) => {
    try {
      set({ error: null, isLoading: true });

      const { verifyWhatsAppOtp } = await import('@/lib/queries/whatsapp');

      const result = await verifyWhatsAppOtp(phoneNumber, otp);

      if (!result.success || !result.token) {
        throw new Error(result.error || "Authentication failed");
      }

      set({
        user: {
          uid: phoneNumber,
          phoneNumber: phoneNumber,
          idToken: result.token,
          isGuest: false,
        },
        isAuthenticated: true,
        isGuest: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to verify WhatsApp OTP';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.signOut();

      // Call backend logout mutation to clear HttpOnly cookies
      try {
        await graphqlClient.request(LOGOUT_MUTATION);
      } catch (e) {
        console.error('Backend logout failed:', e);
        // Continue with client cleanup even if backend fails
      }

      // We don't call logoutAction() anymore as it tries to delete cookies manually
      // which fails for HttpOnly cookies set by backend.
      // await logoutAction(); 

      authService.clearRecaptcha();

      set({
        user: null,
        isAuthenticated: false,
        isGuest: false,
        error: null,
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setGuestMode: async () => {
    try {
      await setGuestModeAction();
      set({
        user: null,
        isAuthenticated: false,
        isGuest: true,
        error: null,
      });
    } catch (error) {
      console.error('Set guest mode error:', error);
    }
  },

  clearError: () => set({ error: null }),

  refreshToken: async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        const state = get();
        if (state.user) {
          set({
            user: {
              ...state.user,
              idToken: token,
            },
          });
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  },
}));
