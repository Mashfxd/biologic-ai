import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/auth';

const createUserSchema = z.object({
  username: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres'),
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['ADMIN', 'OPERATOR']).default('OPERATOR'),
});

const updateUserSchema = z.object({
  id: z.coerce.number().int().positive('ID inválido'),
  username: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres'),
  email: z.string().trim().email('Email inválido'),
  role: z.enum(['ADMIN', 'OPERATOR']),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
});

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);

    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { username, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario o email ya están registrados' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json(
      { message: 'Usuario creado con éxito' },
      { status: 201 }
    );
  } catch (error) {
    console.error('DETALLE DEL ERROR:', error);

    if (error.code === 'P1001') {
      return NextResponse.json(
        { error: 'No se pudo conectar a la base de datos' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    if (user.id === id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Usuario eliminado con éxito',
    });
  } catch (error) {
    console.error('Error al eliminar:', error);

    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { id, username, email, role, password } = parsed.data;

    const updateData = {
      username,
      email,
      role,
    };

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'Usuario actualizado',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error al actualizar:', error);

    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}