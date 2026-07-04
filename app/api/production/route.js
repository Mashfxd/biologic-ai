import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const productionSchema = z.object({
  poza: z.string().trim().min(1, 'La poza es obligatoria'),

  motherId: z.coerce
    .number()
    .int('El ID de la madre debe ser un número entero')
    .positive('La madre es obligatoria'),

  fatherId: z
    .union([
      z.coerce.number().int().positive(),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .optional(),

  matingDate: z
    .union([
      z.coerce.date(),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .optional(),

  birthDate: z.coerce.date({
    message: 'La fecha de parto no es válida',
  }),

  bornAlive: z.coerce
    .number()
    .int('Los nacidos vivos deben ser un número entero')
    .min(0, 'Los nacidos vivos no pueden ser negativos'),

  bornDead: z.coerce
    .number()
    .int('Los nacidos muertos deben ser un número entero')
    .min(0, 'Los nacidos muertos no pueden ser negativos')
    .default(0),

  avgBirthWeight: z.coerce
    .number()
    .positive('El peso promedio debe ser mayor a 0'),

  observations: z.string().trim().optional(),
});

const productionInclude = {
  mother: {
    select: {
      id: true,
      name: true,
      breed: true,
      gender: true,
      currentWeight: true,
    },
  },
  father: {
    select: {
      id: true,
      name: true,
      breed: true,
      gender: true,
      currentWeight: true,
    },
  },
};

function normalizeOptionalId(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

function normalizeOptionalDate(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  return value;
}

async function validateParents(motherId, fatherId) {
  const motherAnimal = await prisma.animal.findUnique({
    where: {
      id: motherId,
    },
  });

  if (!motherAnimal) {
    return {
      error: `La madre con ID #${motherId} no existe en el inventario.`,
      status: 404,
    };
  }

  if (motherAnimal.gender !== 'HEMBRA') {
    return {
      error: `El animal ${motherAnimal.name} está registrado como ${motherAnimal.gender}. Debe ser HEMBRA para registrar un parto.`,
      status: 400,
    };
  }

  if (motherAnimal.status === 'SOLD' || motherAnimal.status === 'DECEASED') {
    return {
      error: `La madre ${motherAnimal.name} no está activa en granja. Estado actual: ${motherAnimal.status}.`,
      status: 400,
    };
  }

  if (fatherId) {
    const fatherAnimal = await prisma.animal.findUnique({
      where: {
        id: fatherId,
      },
    });

    if (!fatherAnimal) {
      return {
        error: `El padre con ID #${fatherId} no existe en el inventario.`,
        status: 404,
      };
    }

    if (fatherAnimal.gender !== 'MACHO') {
      return {
        error: `El animal ${fatherAnimal.name} está registrado como ${fatherAnimal.gender}. Debe ser MACHO.`,
        status: 400,
      };
    }

    if (fatherAnimal.status === 'SOLD' || fatherAnimal.status === 'DECEASED') {
      return {
        error: `El padre ${fatherAnimal.name} no está activo en granja. Estado actual: ${fatherAnimal.status}.`,
        status: 400,
      };
    }
  }

  return null;
}

function buildProductionData(data, motherId, fatherId) {
  const calculatedWeaningDate = new Date(data.birthDate);
  calculatedWeaningDate.setDate(calculatedWeaningDate.getDate() + 14);

  return {
    poza: data.poza.toUpperCase(),
    motherId,
    fatherId,
    matingDate: normalizeOptionalDate(data.matingDate),
    birthDate: data.birthDate,
    bornAlive: data.bornAlive,
    bornDead: data.bornDead || 0,
    avgBirthWeight: data.avgBirthWeight,
    weaningDate: calculatedWeaningDate,
    observations: data.observations || null,
  };
}

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const logs = await prisma.reproductionLog.findMany({
      include: productionInclude,
      orderBy: {
        birthDate: 'desc',
      },
    });

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/production:', error);

    return NextResponse.json(
      { error: 'No se pudo cargar el historial de partos.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const body = await request.json();
    const parsed = productionSchema.safeParse(body);

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
    const parsedMotherId = Number(data.motherId);
    const parsedFatherId = normalizeOptionalId(data.fatherId);

    const parentValidation = await validateParents(parsedMotherId, parsedFatherId);

    if (parentValidation) {
      return NextResponse.json(
        { error: parentValidation.error },
        { status: parentValidation.status }
      );
    }

    const newProductionLog = await prisma.reproductionLog.create({
      data: buildProductionData(data, parsedMotherId, parsedFatherId),
      include: productionInclude,
    });

    return NextResponse.json(
      {
        message: 'Parto registrado con éxito.',
        data: newProductionLog,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error crítico en POST /api/production:', error);

    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el registro.' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const parsed = productionSchema.safeParse(body);

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
    const parsedMotherId = Number(data.motherId);
    const parsedFatherId = normalizeOptionalId(data.fatherId);

    const parentValidation = await validateParents(parsedMotherId, parsedFatherId);

    if (parentValidation) {
      return NextResponse.json(
        { error: parentValidation.error },
        { status: parentValidation.status }
      );
    }

    const updatedProductionLog = await prisma.reproductionLog.update({
      where: {
        id,
      },
      data: buildProductionData(data, parsedMotherId, parsedFatherId),
      include: productionInclude,
    });

    return NextResponse.json({
      message: 'Registro de producción actualizado.',
      data: updatedProductionLog,
    });
  } catch (error) {
    console.error('Error crítico en PUT /api/production:', error);

    return NextResponse.json(
      { error: 'Error interno del servidor al actualizar el registro.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    await prisma.reproductionLog.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: 'Registro de producción eliminado.',
    });
  } catch (error) {
    console.error('Error crítico en DELETE /api/production:', error);

    return NextResponse.json(
      { error: 'Error interno del servidor al eliminar el registro.' },
      { status: 500 }
    );
  }
}
