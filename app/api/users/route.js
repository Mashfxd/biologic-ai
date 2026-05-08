import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, email, password, role } = body;

    // 1. Validar que no falten datos
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // 2. Revisar si el usuario o email ya existen
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });

    if (existingUser) {
      return NextResponse.json({ error: "El usuario o email ya están registrados" }, { status: 400 });
    }

    // 3. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear usuario
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword, role: role || 'operator' }
    });

    return NextResponse.json({ message: "Usuario creado con éxito" });
  } catch (error) {
    console.error("DETALLE DEL ERROR:", error);
    // Si el error es P1001, enviamos un mensaje específico
    if (error.code === 'P1001') {
      return NextResponse.json({ error: "No se pudo conectar a la base de datos (Timeout)" }, { status: 503 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
// --- FUNCIONES DE ACTUALIZACIÓN Y BORRADO ---

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, username, email, role, password } = body;

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    // Preparamos los datos básicos a actualizar
    const updateData = { username, email, role };

    // Solo actualizamos la contraseña si el administrador escribió una nueva
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: { id: true, username: true, role: true } // Devolvemos datos seguros
    });

    return NextResponse.json({ message: "Usuario actualizado", user: updatedUser });
  } catch (error) {
    console.error("Error al actualizar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}