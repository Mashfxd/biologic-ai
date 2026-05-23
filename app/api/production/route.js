import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// 1. OBTENER HISTORIAL DE PARTOS (GET)
// ==========================================
export async function GET() {
  try {
    const logs = await prisma.reproductionLog.findMany({
      include: {
        mother: {
          select: { code: true, raza: true, currentWeight: true }
        },
        father: {
          select: { code: true }
        }
      },
      orderBy: { birthDate: 'desc' } // Los partos más recientes primero
    });
    
    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error("❌ Error en GET /api/production:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el historial de partos desde Neon." }, 
      { status: 500 }
    );
  }
}

// ==========================================
// 2. REGISTRAR UN NUEVO PARTO (POST)
// ==========================================
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      poza, motherId, fatherId, matingDate, 
      birthDate, bornAlive, bornDead, avgBirthWeight, observations 
    } = body;

    // --- VALIDACIÓN 1: Campos obligatorios ---
    if (!poza || !motherId || !birthDate || bornAlive === undefined || !avgBirthWeight) {
      return NextResponse.json(
        { error: "Por favor, completa todos los campos obligatorios (*)." }, 
        { status: 400 }
      );
    }

    const parsedMotherId = parseInt(motherId);
    const parsedFatherId = fatherId ? parseInt(fatherId) : null;

    // --- VALIDACIÓN 2: Verificar la existencia y sexo de la Madre ---
    const motherAnimal = await prisma.animal.findUnique({
      where: { id: parsedMotherId }
    });

    if (!motherAnimal) {
      return NextResponse.json(
        { error: `La madre con ID #${motherId} no existe en el inventario.` }, 
        { status: 404 }
      );
    }

    if (motherAnimal.gender.toLowerCase() !== 'hembra') {
      return NextResponse.json(
        { error: `El animal #${motherId} está registrado como ${motherAnimal.gender}. Debe ser Hembra para registrar un parto.` }, 
        { status: 400 }
      );
    }

    // --- VALIDACIÓN 3: Verificar el Padre (si fue ingresado) ---
    if (parsedFatherId) {
      const fatherAnimal = await prisma.animal.findUnique({
        where: { id: parsedFatherId }
      });

      if (!fatherAnimal) {
        return NextResponse.json(
          { error: `El padre con ID #${fatherId} no existe en el inventario.` }, 
          { status: 404 }
        );
      }

      if (fatherAnimal.gender.toLowerCase() !== 'macho') {
        return NextResponse.json(
          { error: `El animal #${fatherId} está registrado como ${fatherAnimal.gender}. Debe ser Macho.` }, 
          { status: 400 }
        );
      }
    }

    // --- REGLA ZOOTÉCNICA AUTOMATIZADA: Calcular Fecha de Destete ---
    // En la producción de cuyes, el destete óptimo se programa a los 14 días del parto.
    const dateOfBirth = new Date(birthDate);
    const calculatedWeaningDate = new Date(dateOfBirth);
    calculatedWeaningDate.setDate(dateOfBirth.getDate() + 14);

    // --- INSERCIÓN EN NEON ---
    const newProductionLog = await prisma.reproductionLog.create({
      data: {
        poza: poza.toUpperCase(),
        motherId: parsedMotherId,
        fatherId: parsedFatherId,
        matingDate: matingDate ? new Date(matingDate) : null,
        birthDate: dateOfBirth,
        bornAlive: parseInt(bornAlive),
        bornDead: parseInt(bornDead || 0),
        avgBirthWeight: parseFloat(avgBirthWeight),
        weaningDate: calculatedWeaningDate,
        observations: observations || null,
      },
      include: {
        mother: true,
        father: true
      }
    });

    return NextResponse.json(
      { message: "Parto registrado con éxito.", data: newProductionLog }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Error crítico en POST /api/production:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el registro." }, 
      { status: 500 }
    );
  }
}