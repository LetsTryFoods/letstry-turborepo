"use server";

import {
  setAuthCookie,
  setRefreshCookie,
  setUserDataCookie,
  setGuestCookie,
  clearAuthCookies,
  getAuthCookie,
  getRefreshCookie,
  getUserDataCookie,
  isGuestMode,
} from "./cookie-manager";

type BackendAuthResponse = {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken?: string;
    uid: string;
    phoneNumber: string;
  };
  error?: string;
};

export async function setAuthTokens(
  backendToken: string,
  userData?: {
    phoneNumber: string;
    firebaseUid: string;
  }
): Promise<BackendAuthResponse> {
  try {
 

    return {
      success: true,
      data: {
        accessToken: backendToken,
        uid: userData?.firebaseUid || "",
        phoneNumber: userData?.phoneNumber || "",
      },
    };
  } catch (error: any) {
    console.error("Set auth tokens error:", error);
    return {
      success: false,
      error: error.message || "Failed to set authentication tokens",
    };
  }
}

export async function refreshAuthToken(): Promise<BackendAuthResponse> {
  try {
    const refreshToken = await getRefreshCookie();
    
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL;

    const response = await fetch(`${backendUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();

    // Cookies are now set by the backend via Set-Cookie headers
    // if (data.accessToken) {
    //   await setAuthCookie(data.accessToken);
    // }

    // if (data.refreshToken) {
    //   await setRefreshCookie(data.refreshToken);
    // }

    return {
      success: true,
      data: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        uid: data.uid,
        phoneNumber: data.phoneNumber,
      },
    };
  } catch (error: any) {
    // await clearAuthCookies();
    return {
      success: false,
      error: error.message || "Token refresh failed",
    };
  }
}

export async function logoutAction() {
  // Manual cookie deletion is removed as it's handled by the backend mutation
  // await clearAuthCookies();
  return { success: true };
}

export async function setGuestModeAction() {
  await setGuestCookie();
  return { success: true };
}

export async function getCurrentUser() {
  const token = await getAuthCookie();
  
  if (!token) {
    return null;
  }

  const userData = await getUserDataCookie();
  const guest = await isGuestMode();

  if (guest) {
    return null;
  }

  return userData;
}
