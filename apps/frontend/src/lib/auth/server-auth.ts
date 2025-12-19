import { cookies } from "next/headers";

export async function getServerAuth() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;
  const userDataCookie = cookieStore.get("user_data")?.value;
  const isGuest = cookieStore.get("guest")?.value === "true";

  if (isGuest) {
    return {
      isAuthenticated: false,
      isGuest: true,
      user: null,
    };
  }

  if (!authToken) {
    return {
      isAuthenticated: false,
      isGuest: false,
      user: null,
    };
  }

  let userData = null;
  if (userDataCookie) {
    try {
      userData = JSON.parse(userDataCookie);
    } catch (error) {
      console.error("Failed to parse user data:", error);
    }
  }

  return {
    isAuthenticated: true,
    isGuest: false,
    user: userData,
  };
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
}

export async function isAuthenticated() {
  const auth = await getServerAuth();
  return auth.isAuthenticated;
}
