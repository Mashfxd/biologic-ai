import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth'; // <-- Importamos nuestro generador de tokens

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    // Agregamos select para obligar a Prisma a traer el rol fresco
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        email: true
      }
    });

    if (!user) return NextResponse.json({ error: 'Usuario no existe' }, { status: 401 });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      console.log("LOGIN EXITOSO - ROL EN DB:", user.role);

      // 1. Crear el Token seguro con los datos del usuario (NO INCLUIR PASSWORD AQUÍ)
      const token = await createToken({ 
        id: user.id, 
        username: user.username, 
        role: user.role 
      });

      // 2. Preparamos la respuesta que enviaremos al navegador
      const response = NextResponse.json({ 
        success: true,
        // Seguimos enviando esto para que la pantalla pueda mostrar el nombre de usuario
        user: {
          id: user.id, 
          username: user.username, 
          role: user.role, 
          email: user.email 
        }
      }, { status: 200 });

      // 3. ¡EL ESCUDO!: Inyectamos el Token como una Cookie HttpOnly
      response.cookies.set({
        name: 'zooai_session',
        value: token,
        httpOnly: true, // Invisible para ataques XSS (JavaScript no puede leerla)
        secure: process.env.NODE_ENV === 'production', // En Vercel exigirá HTTPS
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // La sesión expira en 8 horas exactas
      });

      return response;
    }
    
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  } catch (error) {
    console.error("Error en Login API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}