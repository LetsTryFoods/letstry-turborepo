"use client";

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePhoneAuth } from '@/hooks/use-phone-auth';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'react-hot-toast';
import OtpInput from 'react-otp-input';
import { useQueryClient } from '@tanstack/react-query';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendUrl: string;
  onSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, backendUrl, onSuccess }: LoginModalProps) {
  const queryClient = useQueryClient();
  const { setGuestMode } = useAuth();
  const {
    phoneNumber,
    setPhoneNumber,
    otp,
    setOtp,
    otpSent,
    loading,
    error,
    otpProvider,
    sendOTP,
    sendSMSOTP,
    verifyOTP,
    resetAuth,
  } = usePhoneAuth(backendUrl);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetAuth();
    }
  }, [isOpen, resetAuth]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(digits);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendOTP();
      toast.success('OTP sent successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyOTP();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Login successful!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify OTP');
    }
  };

  const handleSendSMS = async () => {
    try {
      await sendSMSOTP();
      toast.success('OTP sent via SMS');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send SMS OTP');
    }
  };

  const handleSkipLogin = () => {
    setGuestMode();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div id="recaptcha-container" />
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40">
        <div className="relative w-[92%] sm:w-[380px] md:w-[420px] rounded-[20px] bg-white px-6 pt-9 pb-6 shadow-xl">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex justify-center items-center z-20 rounded-[20px]">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-teal-700 rounded-full animate-spin" />
            </div>
          )}

          <button
            onClick={handleSkipLogin}
            disabled={loading}
            aria-label="Close"
            className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>

          <div className="flex justify-center mb-6">
            <div className="bg-[#F5C518] rounded-full w-20 h-20 flex items-center justify-center">
              <span className="font-agbalumo text-[#1A2332] text-lg font-bold">Let's Try</span>
            </div>
          </div>

          {!otpSent ? (
            <>
              <h2 className="text-[32px] leading-tight font-bold text-black mb-2">Sign in</h2>
              <p className="text-[15px] text-gray-700 mb-6">
                Enter your phone number to continue
              </p>

              <form onSubmit={handleSendOTP}>
                <div className="flex items-stretch">
                  <span className="rounded-l-[12px] border border-r-0 border-gray-300 px-3 py-3 text-[14px] font-semibold text-black bg-white">
                    +91
                  </span>
                  <span className="w-px bg-gray-300" />
                  <Input
                    type="tel"
                    inputMode="numeric"
                    className="flex-1 rounded-l-none border-l-0 text-base py-6 px-4 focus:ring-0 focus-visible:ring-0"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    required
                    maxLength={10}
                  />
                </div>

                {error && !otpSent && (
                  <p className="text-red-600 mt-2 text-sm">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading || phoneNumber.length !== 10}
                  className="mt-6 w-full py-6 rounded-[12px] bg-[#0C5273] text-white font-semibold hover:bg-[#0C5273]/80 transition disabled:opacity-60"
                >
                  {loading ? 'Processing…' : 'Continue'}
                </Button>

                <button
                  type="button"
                  onClick={handleSendSMS}
                  disabled={loading || phoneNumber.length !== 10}
                  className="mt-3 w-full text-sm text-[#0C5273] hover:underline disabled:opacity-60"
                >
                  Get message on SMS instead
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-[28px] leading-tight font-bold text-black mb-1">
                Enter OTP Code
              </h2>
              <p className="text-[15px] text-gray-700 mb-2">
                {otpProvider === 'whatsapp'
                  ? "We've sent an OTP to your WhatsApp"
                  : "We've sent an OTP to your device"}
              </p>
              {otpProvider === 'whatsapp' && (
                <p className="text-[13px] text-teal-700 mb-4 font-medium">
                  Check your WhatsApp messages
                </p>
              )}

              <form onSubmit={handleVerifyOTP}>
                <div className="flex justify-center mb-4">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderSeparator={<span className="w-2" />}
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="!w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-teal-600 focus:outline-none"
                        disabled={loading}
                      />
                    )}
                    shouldAutoFocus
                  />
                </div>

                {error && otpSent && (
                  <p className="text-red-600 mb-3 text-sm text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-6 rounded-[12px] bg-teal-700 text-white font-semibold hover:bg-teal-800 transition disabled:opacity-60"
                >
                  {loading ? 'Verifying…' : 'Verify Code'}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    resetAuth();
                  }}
                  disabled={loading}
                  className="mt-4 w-full text-sm text-teal-700 hover:underline disabled:opacity-60"
                >
                  Change phone number
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
