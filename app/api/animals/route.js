import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { animalSchema } from '@/lib/validations';

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

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'El animal que intentas actualizar no existe' },
        { status: 404 }
      );
    }

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

    const existingAnimal = await prisma.animal.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            partosComoMadre: true,
          },
        },
      },
    });

    if (!existingAnimal) {
      return NextResponse.json(
        { error: 'El animal no existe o ya fue eliminado' },
        { status: 404 }
      );
    }

    if (existingAnimal._count.partosComoMadre > 0) {
      return NextResponse.json(
        {
          error:
            'No se puede eliminar físicamente este animal porque registra partos como madre en el historial reproductivo. Cambia su estado a Vendido o Fallecido para conservar la trazabilidad.',
        },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.healthLog.deleteMany({ where: { animal_id: id } }),
      prisma.growthLog.deleteMany({ where: { animal_id: id } }),
      prisma.feedingLog.deleteMany({ where: { animal_id: id } }),
      prisma.reproductionLog.updateMany({
        where: { fatherId: id },
        data: { fatherId: null },
      }),
      prisma.animal.delete({ where: { id } }),
    ]);

    return NextResponse.json({
      message: 'Eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar animal:', error);

    if (error?.code === 'P2003') {
      return NextResponse.json(
        {
          error:
            'No se puede eliminar el animal porque tiene registros históricos asociados. Cambia su estado a Vendido o Fallecido.',
        },
        { status: 409 }
      );
    }

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'El animal ya no existe' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar animal' },
      { status: 500 }
    );
  }
}