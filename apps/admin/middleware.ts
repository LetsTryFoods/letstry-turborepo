import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getValidTokenServer } from '@/lib/auth/token-service-server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')

  if (isApiRoute) {
    return NextResponse.next()
  }

  const validToken = getValidTokenServer(token)

  if (!validToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (validToken && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}