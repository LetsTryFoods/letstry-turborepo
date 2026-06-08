import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routeConfig, isRouteMatch } from "./lib/route-config";

const REDIRECTS_CACHE_DURATION = 5 * 60 * 1000;

let redirectsCache: { data: any[]; timestamp: number } | null = null;

async function fetchRedirects() {
  if (
    redirectsCache &&
    Date.now() - redirectsCache.timestamp < REDIRECTS_CACHE_DURATION
  ) {
    return redirectsCache.data;
  }

  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5000/graphql";
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetAllActiveRedirects {
            allActiveRedirects {
              fromPath
              toPath
              statusCode
            }
          }
        `,
      }),
    });

    if (response.ok) {
      const { data } = await response.json();
      const redirects = data?.allActiveRedirects || [];
      redirectsCache = { data: redirects, timestamp: Date.now() };
      return redirects;
    }
  } catch (error) {
    console.error("Error fetching redirects:", error);
  }

  return [];
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // URL hygiene — runs BEFORE the redirect-table lookup so we never end up
  // with two URLs serving the same content (the #1 cause of "duplicate
  // without canonical" issues in Search Console).
  //
  //   1. Strip a trailing slash from non-root paths (/bhujia/ -> /bhujia).
  //   2. Lowercase the path (/Bhujia -> /bhujia).
  //   3. Strip utm_*/gclid/fbclid/mc_* tracking params from canonical URLs
  //      so they don't fragment indexing. They're preserved in the dataLayer
  //      because page_location is captured at click time before the redirect.
  //
  // NOTE: www ↔ apex normalization is intentionally NOT done here.
  // Vercel handles letstryfoods.com → www.letstryfoods.com at the CDN edge
  // before requests reach Next.js. Duplicating it here would create a
  // redirect loop (middleware strips www, Vercel adds it back, repeat).
  // ---------------------------------------------------------------------------
  const url = request.nextUrl.clone();
  let needsRedirect = false;

  // Trailing slash (root '/' is intentionally exempt)
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "");
    needsRedirect = true;
  }

  // Lowercase path (exempting /track/ routes since order IDs and AWBs are case-sensitive)
  if (
    url.pathname !== url.pathname.toLowerCase() &&
    !url.pathname.toLowerCase().startsWith("/track/")
  ) {
    url.pathname = url.pathname.toLowerCase();
    needsRedirect = true;
  }

  // Strip tracking params
  const TRACKING_PARAMS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_id",
    "gclid",
    "fbclid",
    "mc_eid",
    "mc_cid",
    "msclkid",
    "_ga",
  ];
  let strippedAny = false;
  TRACKING_PARAMS.forEach((p) => {
    if (url.searchParams.has(p)) {
      url.searchParams.delete(p);
      strippedAny = true;
    }
  });
  if (strippedAny) needsRedirect = true;

  if (needsRedirect) {
    return NextResponse.redirect(url, 301);
  }

  const redirects = await fetchRedirects();

  const redirect = redirects.find((r: any) => {
    const storedPath = r.fromPath.split("?")[0];
    return storedPath === pathname;
  });

  if (redirect) {
    if (
      redirect.toPath.startsWith("http://") ||
      redirect.toPath.startsWith("https://")
    ) {
      return NextResponse.redirect(redirect.toPath, redirect.statusCode || 301);
    }

    // Use a fresh clone here (not the outer `url`) so any URL hygiene
    // mutations applied above don't leak into the table-redirect target.
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirect.toPath;
    return NextResponse.redirect(redirectUrl, redirect.statusCode || 301);
  }

  const token = request.cookies.get("auth_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const isProtectedRoute = isRouteMatch(pathname, routeConfig.protected);
  const isPublicRoute = isRouteMatch(pathname, routeConfig.public);

  if (isProtectedRoute && !token) {
    if (refreshToken) {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL;
        const response = await fetch(`${backendUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          const res = NextResponse.next();

          res.cookies.set("auth_token", data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          });

          if (data.refreshToken) {
            res.cookies.set("refresh_token", data.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              maxAge: 60 * 60 * 24 * 30,
              path: "/",
            });
          }

          return res;
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute && token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|css|js)$).*)",
  ],
};
