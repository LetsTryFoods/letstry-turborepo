"use server";

import { cookies } from "next/headers";

const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

export async function setAuthCookie(token: string, maxAge: number = TOKEN_MAX_AGE) {
  const cookieStore = await cookies();
  const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  
  cookieStore.set("auth_token", token, {
    httpOnly: false, // Changed to false so client can read it for GraphQL headers
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Changed to lax for better cross-site behavior
    domain, // Add domain support
    maxAge,
    path: "/",
  });
}

export async function setRefreshCookie(refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function setUserDataCookie(data: { uid: string; phoneNumber: string }) {
  const cookieStore = await cookies();
  cookieStore.set("user_data", JSON.stringify(data), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function setGuestCookie() {
  const cookieStore = await cookies();
  cookieStore.set("guest", "true", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

export async function getRefreshCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("refresh_token")?.value;
}

export async function getUserDataCookie() {
  const cookieStore = await cookies();
  const data = cookieStore.get("user_data")?.value;
  return data ? JSON.parse(data) : null;
}

export async function isGuestMode() {
  const cookieStore = await cookies();
  return cookieStore.get("guest")?.value === "true";
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("user_data");
  cookieStore.delete("guest");
}
