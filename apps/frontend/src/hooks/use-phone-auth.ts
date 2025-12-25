"use client";

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import type { ConfirmationResult } from 'firebase/auth';

interface UsePhoneAuthReturn {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
  otpSent: boolean;
  loading: boolean;
  error: string | null;
  otpProvider: string | null;
  sendOTP: () => Promise<void>;
  sendSMSOTP: () => Promise<void>;
  verifyOTP: () => Promise<void>;
  resetAuth: () => void;
}

export function usePhoneAuth(backendUrl: string): UsePhoneAuthReturn {
  const {
    loginWithPhone,
    sendFirebaseOTP,
    verifyOTP: verifyOTPStore,
    isLoading: authLoading,
    error: authError,
    clearError
  } = useAuthStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpProvider, setOtpProvider] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const error = localError || authError;

  useEffect(() => {
    if (authError) {
      setLocalError(authError);
    }
  }, [authError]);

  const sendOTP = useCallback(async () => {
    try {
      setLocalError(null);
      clearError();

      if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        throw new Error('Enter a valid 10-digit phone number');
      }

      setIsLoading(true);

      const result = await loginWithPhone(phoneNumber);

      if (result.provider === 'whatsapp') {
        setOtpProvider('whatsapp');
      } else {
        setOtpProvider('firebase');
        setConfirmationResult(result.confirmationResult);
      }

      setOtpSent(true);
    } catch (error: any) {
      setLocalError(error.message || 'Failed to send OTP');
      setOtpSent(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, loginWithPhone, clearError]);

  const sendSMSOTP = useCallback(async () => {
    try {
      setLocalError(null);
      clearError();

      if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        throw new Error('Enter a valid 10-digit phone number');
      }

      setIsLoading(true);

      const result = await sendFirebaseOTP(phoneNumber);
      setOtpProvider('firebase');
      setConfirmationResult(result.confirmationResult);
      setOtpSent(true);
    } catch (error: any) {
      setLocalError(error.message || 'Failed to send OTP');
      setOtpSent(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, sendFirebaseOTP, clearError]);

  const verifyOTP = useCallback(async () => {
    try {
      setLocalError(null);
      clearError();

      if (!otp || otp.length !== 6) {
        throw new Error('Enter a valid 6-digit OTP');
      }

      if (otpProvider === 'whatsapp') {
        const { verifyWhatsAppOTP } = useAuthStore.getState();
        await verifyWhatsAppOTP(phoneNumber, otp);
      } else {
        if (!confirmationResult) {
          throw new Error('Session expired. Please request a new OTP');
        }
        await verifyOTPStore(confirmationResult, otp);
      }
    } catch (error: any) {
      setLocalError(error.message || 'Failed to verify OTP');
      throw error;
    }
  }, [otp, otpProvider, phoneNumber, confirmationResult, verifyOTPStore, clearError]);

  const resetAuth = useCallback(() => {
    setPhoneNumber('');
    setOtp('');
    setOtpSent(false);
    setOtpProvider(null);
    setConfirmationResult(null);
    setLocalError(null);
    clearError();
  }, [clearError]);

  return {
    phoneNumber,
    setPhoneNumber,
    otp,
    setOtp,
    otpSent,
    loading: authLoading || isLoading,
    error,
    otpProvider,
    sendOTP,
    sendSMSOTP,
    verifyOTP,
    resetAuth,
  };
}
