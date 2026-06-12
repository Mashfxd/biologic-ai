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

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const logs = await prisma.reproductionLog.findMany({
      include: {
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
      },
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

    const motherAnimal = await prisma.animal.findUnique({
      where: {
        id: parsedMotherId,
      },
    });

    if (!motherAnimal) {
      return NextResponse.json(
        {
          error: `La madre con ID #${parsedMotherId} no existe en el inventario.`,
        },
        { status: 404 }
      );
    }

    if (motherAnimal.gender !== 'HEMBRA') {
      return NextResponse.json(
        {
          error: `El animal ${motherAnimal.name} está registrado como ${motherAnimal.gender}. Debe ser HEMBRA para registrar un parto.`,
        },
        { status: 400 }
      );
    }

    if (motherAnimal.status === 'SOLD' || motherAnimal.status === 'DECEASED') {
      return NextResponse.json(
        {
          error: `La madre ${motherAnimal.name} no está activa en granja. Estado actual: ${motherAnimal.status}.`,
        },
        { status: 400 }
      );
    }

    if (parsedFatherId) {
      const fatherAnimal = await prisma.animal.findUnique({
        where: {
          id: parsedFatherId,
        },
      });

      if (!fatherAnimal) {
        return NextResponse.json(
          {
            error: `El padre con ID #${parsedFatherId} no existe en el inventario.`,
          },
          { status: 404 }
        );
      }

      if (fatherAnimal.gender !== 'MACHO') {
        return NextResponse.json(
          {
            error: `El animal ${fatherAnimal.name} está registrado como ${fatherAnimal.gender}. Debe ser MACHO.`,
          },
          { status: 400 }
        );
      }

      if (fatherAnimal.status === 'SOLD' || fatherAnimal.status === 'DECEASED') {
        return NextResponse.json(
          {
            error: `El padre ${fatherAnimal.name} no está activo en granja. Estado actual: ${fatherAnimal.status}.`,
          },
          { status: 400 }
        );
      }
    }

    const calculatedWeaningDate = new Date(data.birthDate);
    calculatedWeaningDate.setDate(calculatedWeaningDate.getDate() + 14);

    const newProductionLog = await prisma.reproductionLog.create({
      data: {
        poza: data.poza.toUpperCase(),
        motherId: parsedMotherId,
        fatherId: parsedFatherId,
        matingDate: normalizeOptionalDate(data.matingDate),
        birthDate: data.birthDate,
        bornAlive: data.bornAlive,
        bornDead: data.bornDead || 0,
        avgBirthWeight: data.avgBirthWeight,
        weaningDate: calculatedWeaningDate,
        observations: data.observations || null,
      },
      include: {
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
      },
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