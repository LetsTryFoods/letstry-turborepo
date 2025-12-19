import type { User as FirebaseUser } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  phoneNumber: string | null;
  idToken: string;
  isGuest: boolean;
  name?: string;
  email?: string;
}

export interface ApiResponse<T> {
  message: string;
  error_status: boolean;
  status: number;
  data: T;
}

export interface BackendLoginResponse {
  uid: string;
  phoneNumber?: string;
  email?: string;
  createdAt?: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
}

export interface OtpState {
  sent: boolean;
  phoneNumber: string;
  confirmationResult: any | null;
}

export enum AuthErrorCode {
  INVALID_PHONE = 'INVALID_PHONE',
  INVALID_OTP = 'INVALID_OTP',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  RECAPTCHA_ERROR = 'RECAPTCHA_ERROR',
  BACKEND_ERROR = 'BACKEND_ERROR',
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export type { FirebaseUser };
