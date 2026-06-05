import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const animalSchema = z.object({
  name: z.string().trim().min(1, 'El código o nombre es obligatorio'),
  species: z.string().trim().min(1, 'La especie es obligatoria'),
  breed: z.string().trim().min(1, 'La raza es obligatoria'),
  birthDate: z.coerce.date({
    message: 'La fecha de nacimiento no es válida',
  }),
  gender: z.enum(['HEMBRA', 'MACHO'], {
    message: 'El sexo debe ser HEMBRA o MACHO',
  }),
  status: z.enum(['HEALTHY', 'SICK', 'SOLD', 'DECEASED'], {
    message: 'El estado no es válido',
  }),
  purpose: z.string().trim().optional().default('Engorde'),
  litterCode: z.string().trim().optional().nullable(),
  currentWeight: z.coerce
    .number()
    .positive('El peso debe ser mayor a 0'),
});

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const animals = await prisma.animal.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(animals);
  } catch (error) {
    console.error('Error al obtener animales:', error);

    return NextResponse.json(
      { error: 'Error al obtener animales' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = animalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const newAnimal = await prisma.animal.create({
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed,
        birthDate: data.birthDate,
        gender: data.gender,
        status: data.status,
        purpose: data.purpose || 'Engorde',
        litterCode: data.litterCode || null,
        currentWeight: data.currentWeight,
      },
    });

    return NextResponse.json(newAnimal, { status: 201 });
  } catch (error) {
    console.error('Error detallado en POST:', error);

    return NextResponse.json(
      { error: 'Error interno al crear el animal' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const body = await req.json();
    const id = Number(body.id);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const parsed = animalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updatedAnimal = await prisma.animal.update({
      where: { id },
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed,
        birthDate: data.birthDate,
        gender: data.gender,
        status: data.status,
        purpose: data.purpose || 'Engorde',
        litterCode: data.litterCode || null,
        currentWeight: data.currentWeight,
      },
    });

    return NextResponse.json(updatedAnimal);
  } catch (error) {
    console.error('Error en PUT:', error);

    return NextResponse.json(
      { error: 'Error al actualizar animal' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const { response } = await requireAuth();
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

    await prisma.animal.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar animal:', error);

    return NextResponse.json(
      { error: 'Error al eliminar animal' },
      { status: 500 }
    );
  }
}