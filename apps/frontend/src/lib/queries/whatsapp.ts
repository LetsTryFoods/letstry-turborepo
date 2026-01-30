import { graphqlClient } from '@/lib/graphql/client-factory';
import { StorageService } from '@/lib/storage/storage-service';

const SEND_OTP_MUTATION = `
  mutation SendOtp($phoneNumber: String!) {
    sendOtp(phoneNumber: $phoneNumber)
  }
`;

const VERIFY_WHATSAPP_OTP_MUTATION = `
  mutation VerifyWhatsAppOtp($phoneNumber: String!, $otp: String!, $input: CreateUserInput) {
    verifyWhatsAppOtp(phoneNumber: $phoneNumber, otp: $otp, input: $input)
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

type CreateUserInput = {
    phoneNumber: string;
    firebaseUid?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    marketingSmsOptIn?: boolean;
    signupSource?: Record<string, any>;
    lastIp?: string;
};

export async function verifyWhatsAppOtp(
    phoneNumber: string,
    otp: string,
    userInput?: Partial<CreateUserInput>
): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
        const input: CreateUserInput | undefined = userInput
            ? {
                phoneNumber: userInput.phoneNumber || phoneNumber,
                firstName: userInput.firstName,
                lastName: userInput.lastName,
                email: userInput.email,
                marketingSmsOptIn: userInput.marketingSmsOptIn,
                signupSource: userInput.signupSource,
                lastIp: userInput.lastIp,
            }
            : undefined;

        const data = await graphqlClient.request(
            VERIFY_WHATSAPP_OTP_MUTATION,
            {
                phoneNumber,
                otp,
                input,
            }
        ) as { verifyWhatsAppOtp: string };

        StorageService.removeStorageItem('guestId');
        StorageService.removeStorageItem('guestDbId');
        StorageService.removeStorageItem('sessionId');
        StorageService.removeStorageItem('lastActiveUpdate');

        return {
            success: true,
            token: data.verifyWhatsAppOtp,
        };
    } catch (error: any) {
        console.error('WhatsApp OTP verification error:', error);
        return {
            success: false,
            error: error.response?.errors?.[0]?.message || error.message || 'Failed to verify WhatsApp OTP',
        };
    }
}
