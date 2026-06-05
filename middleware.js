import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request) {
  // 1. Intentar obtener la cookie de la sesión
  const token = request.cookies.get('zooai_session')?.value;

  // 2. Si no hay token, patear al usuario a la pantalla de login
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. Si hay token, verificar que sea válido y no haya sido alterado
  const verifiedToken = await verifyToken(token);
  if (!verifiedToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. Si todo está bien, dejarlo pasar al sistema
  return NextResponse.next();
}

// Configurar qué rutas protegerá este guardia
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/animals/:path*', 
    '/production/:path*', 
    '/health/:path*',
    '/feeding/:path*',
    '/growth/:path*'
  ],
};