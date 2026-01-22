import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, analytics } from './config';
import { logEvent, setUserId as setAnalyticsUserId } from 'firebase/analytics';
import { rateLimiter } from '../auth/rate-limiter';
import { retryWithBackoff } from '../utils/retry';
import type { AuthUser, BackendLoginResponse, AuthErrorCode } from '@/types/auth.types';

class AuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private recaptchaWidgetId: number | null = null;

  initializeRecaptcha(containerId: string): RecaptchaVerifier {
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch (error) {
        console.error('Error clearing recaptcha:', error);
      }
    }

    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
      },
      'expired-callback': () => {
        this.clearRecaptcha();
      },
    });

    return this.recaptchaVerifier;
  }

  clearRecaptcha(): void {
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch (error) {
        console.error('Error clearing recaptcha:', error);
      }
      this.recaptchaVerifier = null;
      this.recaptchaWidgetId = null;
    }
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  async sendOTP(phoneNumber: string, containerId: string): Promise<ConfirmationResult> {
    try {
      if (!this.validatePhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      const rateCheck = rateLimiter.check(phoneNumber, 3, 300000);
      
      if (!rateCheck.allowed) {
        throw new Error(`Too many attempts. Please try again in ${rateCheck.retryAfter} seconds`);
      }

      const appVerifier = this.recaptchaVerifier || this.initializeRecaptcha(containerId);
      const formattedNumber = `+91${phoneNumber}`;
      
      const confirmationResult = await retryWithBackoff(
        () => signInWithPhoneNumber(auth, formattedNumber, appVerifier),
        { maxRetries: 2, baseDelay: 1000 }
      );
      
      if (analytics) {
        logEvent(analytics, 'otp_sent', { 
          phone: formattedNumber,
          remaining_attempts: rateCheck.remaining 
        });
      }

      return confirmationResult;
    } catch (error: any) {
      console.error('Send OTP error:', error);
      this.clearRecaptcha();
      
      if (analytics) {
        logEvent(analytics, 'otp_failed', { 
          error_code: error.code,
          error_message: error.message 
        });
      }
      
      throw this.handleAuthError(error);
    }
  }

  async verifyOTP(confirmationResult: ConfirmationResult, otp: string): Promise<{ idToken: string; user: any }> {
    try {
      if (!otp || otp.length !== 6) {
        throw new Error('Invalid OTP format');
      }

      const result = await retryWithBackoff(
        () => confirmationResult.confirm(otp),
        { maxRetries: 2, baseDelay: 500 }
      );

      const idToken = await result.user.getIdToken();

      if (analytics) {
        logEvent(analytics, 'otp_verified', { 
          method: 'phone',
          platform: 'web' 
        });
      }

      return {
        idToken,
        user: {
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber,
        },
      };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      
      if (analytics) {
        logEvent(analytics, 'otp_verification_failed', { 
          error_code: error.code 
        });
      }
      
      throw this.handleAuthError(error);
    }
  }

  async loginToBackend(idToken: string, backendUrl: string): Promise<BackendLoginResponse> {
    try {
      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ idToken }),
          });

          if (!res.ok) {
            throw new Error(`Backend login failed: ${res.statusText}`);
          }

          return res;
        },
        { maxRetries: 3, baseDelay: 1000 }
      );

      const data = await response.json();
      
      if (analytics && data.uid) {
        setAnalyticsUserId(analytics, data.uid);
        logEvent(analytics, 'login', { 
          method: 'phone',
          platform: 'web' 
        });
      }

      return data;
    } catch (error: any) {
      console.error('Backend login error:', error);
      throw new Error('Failed to authenticate with backend');
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      this.clearRecaptcha();
      
      if (analytics) {
        logEvent(analytics, 'logout', { platform: 'web' });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  private handleAuthError(error: any): Error {
    const errorMessages: Record<string, string> = {
      'auth/invalid-phone-number': 'Invalid phone number format',
      'auth/too-many-requests': 'Too many requests. Please try again later',
      'auth/invalid-verification-code': 'Invalid OTP code',
      'auth/code-expired': 'OTP has expired. Please request a new one',
      'auth/session-expired': 'Session expired. Please try again',
      'auth/network-request-failed': 'Network error. Please check your connection',
    };

    const message = errorMessages[error.code] || error.message || 'Authentication failed';
    return new Error(message);
  }
}

export const authService = new AuthService();
