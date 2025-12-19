import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routeConfig, isRouteMatch } from './lib/route-config';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
