import { sendWhatsAppOtp } from '@/lib/queries/whatsapp';
import { rateLimiter } from '@/lib/auth/rate-limiter';
import type { WhatsAppOtpResponse } from '@/types/whatsapp.types';

class WhatsAppOtpService {
  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  async sendOTP(phoneNumber: string): Promise<WhatsAppOtpResponse> {
    try {
      if (!this.validatePhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      const rateCheck = rateLimiter.check(phoneNumber, 3, 300000);
      
      if (!rateCheck.allowed) {
        throw new Error(`Too many attempts. Please try again in ${rateCheck.retryAfter} seconds`);
      }

      const result = await sendWhatsAppOtp(phoneNumber);

      return {
        success: result.success,
        message: result.message,
        provider: result.success ? 'whatsapp' : 'unavailable',
      };
    } catch (error: any) {
      console.error('WhatsApp OTP service error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to send OTP',
        provider: 'unavailable',
      };
    }
  }
}

export const whatsAppOtpService = new WhatsAppOtpService();
