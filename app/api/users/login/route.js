import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/jwt';
import { loginSchema } from '@/lib/validations';

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de inicio de sesión inválidos' },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    // Agregamos select para obligar a Prisma a traer el rol fresco
    let user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        email: true,
      },
    });

    // Bootstrap automático si la tabla de usuarios está completamente vacía
    if (!user) {
      const totalUsers = await prisma.user.count();
      if (totalUsers === 0) {
        const [adminPassword, operatorPassword] = await Promise.all([
          bcrypt.hash('admin123', 10),
          bcrypt.hash('operador123', 10),
        ]);

        await prisma.user.createMany({
          data: [
            {
              username: 'admin',
              email: 'admin@biologic.ai',
              password: adminPassword,
              role: 'ADMIN',
            },
            {
              username: 'operador',
              email: 'operador@biologic.ai',
              password: operatorPassword,
              role: 'OPERATOR',
            },
          ],
          skipDuplicates: true,
        });

        user = await prisma.user.findUnique({
          where: { username },
          select: {
            id: true,
            username: true,
            password: true,
            role: true,
            email: true,
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      // 1. Crear el Token seguro con los datos del usuario (NO INCLUIR PASSWORD AQUÍ)
      const token = await createToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });

      // 2. Preparamos la respuesta que enviaremos al navegador
      const response = NextResponse.json(
        {
          success: true,
          // Seguimos enviando esto para que la pantalla pueda mostrar el nombre de usuario
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
          },
        },
        { status: 200 }
      );

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

    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error en Login API:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error interno al procesar el inicio de sesión' },
      { status: 500 }
    );
  }
}