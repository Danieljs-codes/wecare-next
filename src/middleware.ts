import { getSession } from '@lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow access to sign-in and sign-up routes
  if (pathname === '/sign-in' || pathname === '/sign-up') {
    return NextResponse.next();
  }

  const session = await getSession();

  // If no session, redirect to sign-in
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Check role-based access
  if (pathname.startsWith('/doctor')) {
    if (session.user.role !== 'doctor') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  } else if (pathname.startsWith('/patient')) {
    if (session.user.role !== 'patient') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // Allow access to authenticated routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
