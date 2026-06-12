import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

const publicApiRoutes = [
  '/api/users/login',
  '/api/users/logout',
];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (publicApiRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('zooai_session')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.redirect(new URL('/', request.url));
  }

  const verifiedToken = await verifyToken(token);

  if (!verifiedToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/animals/:path*',
    '/production/:path*',
    '/health/:path*',
    '/feeding/:path*',
    '/growth/:path*',
    '/users/:path*',

    '/api/animals/:path*',
    '/api/users/:path*',
    '/api/health/:path*',
    '/api/feeding/:path*',
    '/api/growth/:path*',
    '/api/production/:path*',
    '/api/metrics/:path*',
  ],
};
