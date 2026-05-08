import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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
      // LOG CRÍTICO: Mira tu terminal de VS Code cuando te loguees.
      // Si aquí dice 'operator', el problema es 100% tu base de datos en Neon.
      console.log("LOGIN EXITOSO - ROL EN DB:", user.role);

      return NextResponse.json({ 
        id: user.id, 
        username: user.username, 
        role: user.role, // Enviamos el valor real de la DB
        email: user.email 
      });
    }
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}