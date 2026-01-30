"use client";

import { graphqlClient } from "@/lib/graphql/client-factory";
import { StorageService } from "@/lib/storage/storage-service";

type CreateUserInput = {
  phoneNumber: string;
  firebaseUid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  marketingSmsOptIn?: boolean;
  signupSource?: Record<string, any>;
  lastIp?: string;
};

const VERIFY_OTP_AND_LOGIN_MUTATION = `
  mutation VerifyOtpAndLogin($idToken: String!, $input: CreateUserInput) {
    verifyOtpAndLogin(idToken: $idToken, input: $input)
  }
`;

export async function verifyOtpAndLogin(
  idToken: string,
  userInput?: Partial<CreateUserInput>
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const input: CreateUserInput | undefined = userInput
      ? {
        phoneNumber: userInput.phoneNumber || "",
        firebaseUid: userInput.firebaseUid || "",
        firstName: userInput.firstName,
        lastName: userInput.lastName,
        email: userInput.email,
        marketingSmsOptIn: userInput.marketingSmsOptIn,
        signupSource: userInput.signupSource,
        lastIp: userInput.lastIp,
      }
      : undefined;

    const data = await graphqlClient.request(
      VERIFY_OTP_AND_LOGIN_MUTATION,
      {
        idToken,
        input,
      }
    ) as { verifyOtpAndLogin: string };

    StorageService.removeStorageItem('guestId');
    StorageService.removeStorageItem('guestDbId');
    StorageService.removeStorageItem('sessionId');
    StorageService.removeStorageItem('lastActiveUpdate');

    return {
      success: true,
      token: data.verifyOtpAndLogin,
    };
  } catch (error: any) {
    console.error("GraphQL verifyOtpAndLogin error:", error);
    return {
      success: false,
      error: error.response?.errors?.[0]?.message || error.message || "Failed to verify OTP with backend",
    };
  }
}
