import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { healthLogSchema } from '@/lib/validations'; // <-- Importamos Zod

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Zod revisa los datos antes de hacer nada
    const validation = healthLogSchema.safeParse(body);

    // 2. Si falla, devolvemos un error 400 (Bad Request) con el motivo exacto
    if (!validation.success) {
      // Extraemos el primer mensaje de error para mostrarlo en pantalla
      return NextResponse.json(
  {
    error: 'Datos inválidos',
    details: validation.error.flatten().fieldErrors,
  },
  { status: 400 }
);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // 3. Si pasa la validación, validation.data contiene los datos limpios y tipados
    const cleanData = validation.data;

    const record = await prisma.healthLog.create({
      data: {
        animal_id: cleanData.animal_id,
        diagnostic: cleanData.diagnostic,
        treatment: cleanData.treatment,
        date: cleanData.date // Zod ya lo convirtió a formato Date
      }
    });

    return NextResponse.json(record, { status: 201 });

  } catch (error) {
    console.error("Error en Health API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}