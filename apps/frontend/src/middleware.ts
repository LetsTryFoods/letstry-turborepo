import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routeConfig, isRouteMatch } from './lib/route-config';

const REDIRECTS_CACHE_DURATION = 5 * 60 * 1000;

let redirectsCache: { data: any[]; timestamp: number } | null = null;

async function fetchRedirects() {
  if (redirectsCache && Date.now() - redirectsCache.timestamp < REDIRECTS_CACHE_DURATION) {
    return redirectsCache.data;
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:5000/graphql';
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    console.error('Error fetching redirects:', error);
  }

  return [];
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const redirects = await fetchRedirects();
  
  const redirect = redirects.find((r: any) => {
    const storedPath = r.fromPath.split('?')[0];
    return storedPath === pathname;
  });

  if (redirect) {
    const url = request.nextUrl.clone();
    
    if (redirect.toPath.startsWith('http://') || redirect.toPath.startsWith('https://')) {
      return NextResponse.redirect(redirect.toPath, redirect.statusCode || 301);
    }
    
    url.pathname = redirect.toPath;
    return NextResponse.redirect(url, redirect.statusCode || 301);
  }

  const token = request.cookies.get('auth_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isProtectedRoute = isRouteMatch(pathname, routeConfig.protected);
  const isPublicRoute = isRouteMatch(pathname, routeConfig.public);

  if (isProtectedRoute && !token) {
    if (refreshToken) {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL;
        const response = await fetch(`${backendUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          const res = NextResponse.next();
          
          res.cookies.set('auth_token', data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          });

          if (data.refreshToken) {
            res.cookies.set('refresh_token', data.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 60 * 60 * 24 * 30,
              path: '/',
            });
          }

          return res;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute && token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|css|js)$).*)',
  ],
};
