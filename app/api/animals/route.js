import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

function validateAnimalData(data) {
  const requiredFields = [
    'name',
    'species',
    'breed',
    'birthDate',
    'gender',
    'status',
    'currentWeight',
  ];

  for (const field of requiredFields) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ''
    ) {
      return `El campo ${field} es obligatorio`;
    }
  }

  const weight = Number(data.currentWeight);

  if (Number.isNaN(weight) || weight <= 0) {
    return 'El peso debe ser un número mayor a 0';
  }

  const birthDate = new Date(data.birthDate);

  if (Number.isNaN(birthDate.getTime())) {
    return 'La fecha de nacimiento no es válida';
  }

  if (!['Hembra', 'Macho'].includes(data.gender)) {
    return 'El sexo debe ser Hembra o Macho';
  }

  return null;
}

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
    const data = await req.json();

    const validationError = validateAnimalData(data);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const newAnimal = await prisma.animal.create({
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed,
        birthDate: new Date(data.birthDate),
        gender: data.gender,
        status: data.status,
        purpose: data.purpose || 'Engorde',
        litterCode: data.litterCode || null,
        currentWeight: Number(data.currentWeight),
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
    const data = await req.json();
    const id = Number(data.id);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const validationError = validateAnimalData(data);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const updatedAnimal = await prisma.animal.update({
      where: { id },
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed,
        birthDate: new Date(data.birthDate),
        gender: data.gender,
        status: data.status,
        purpose: data.purpose || 'Engorde',
        litterCode: data.litterCode || null,
        currentWeight: Number(data.currentWeight),
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