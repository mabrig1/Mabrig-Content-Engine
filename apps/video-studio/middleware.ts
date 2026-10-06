import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/session';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (!session) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', path);
    return NextResponse.redirect(login);
  }

  if (path.startsWith('/studio') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/masterclass', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/masterclass/:path*', '/studio/:path*', '/account'],
};
