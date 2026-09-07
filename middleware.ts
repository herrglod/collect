import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from './lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isCollectorRoute = pathname.startsWith('/collector');
  const isPartnerRoute = pathname.startsWith('/partner');

  if (!isAdminRoute && !isCollectorRoute && !isPartnerRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  function homeFor(role: string) {
    if (role === 'admin') return '/admin';
    if (role === 'gallery_partner') return '/partner';
    return '/collector';
  }

  if (isAdminRoute && session.role !== 'admin') {
    return NextResponse.redirect(new URL(homeFor(session.role), req.url));
  }
  if (isCollectorRoute && session.role !== 'collector' && session.role !== 'admin') {
    return NextResponse.redirect(new URL(homeFor(session.role), req.url));
  }
  if (isPartnerRoute && session.role !== 'gallery_partner' && session.role !== 'admin') {
    return NextResponse.redirect(new URL(homeFor(session.role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/collector/:path*', '/partner/:path*'],
};
