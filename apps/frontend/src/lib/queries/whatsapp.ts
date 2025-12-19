import { graphqlClient } from '@/lib/graphql/client-factory';

const SEND_OTP_MUTATION = `
  mutation SendOtp($phoneNumber: String!) {
    sendOtp(phoneNumber: $phoneNumber)
  }
`;

export async function sendWhatsAppOtp(
  phoneNumber: string
): Promise<{ success: boolean; message: string }> {
  try {
    const data = await graphqlClient.request(SEND_OTP_MUTATION, {
      phoneNumber,
    }) as { sendOtp: string };

    const message = data.sendOtp;
    const isAvailable = !message.toLowerCase().includes('not available');

    return {
      success: isAvailable,
      message,
    };
  } catch (error: any) {
    console.error('WhatsApp OTP error:', error);
    return {
      success: false,
      message: error.response?.errors?.[0]?.message || error.message || 'Failed to send WhatsApp OTP',
    };
  }
}
