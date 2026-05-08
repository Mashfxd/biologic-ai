import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const records = await prisma.growthLog.findMany({
      include: { animal: true },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(records || []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newWeight = parseFloat(body.weight);
    const animalId = parseInt(body.animal_id);

    // 1. Guardar el registro en el historial de crecimiento
    const record = await prisma.growthLog.create({
      data: {
        animal_id: animalId,
        weight: newWeight,
        date: new Date(body.date)
      }
    });

    // 2. Actualizar el peso actual en la tabla principal del Animal
    await prisma.animal.update({
      where: { id: animalId },
      data: { currentWeight: newWeight }
    });

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const newWeight = parseFloat(body.weight);
    const animalId = parseInt(body.animal_id);

    const record = await prisma.growthLog.update({
      where: { id: parseInt(body.id) },
      data: {
        animal_id: animalId,
        weight: newWeight,
        date: new Date(body.date)
      }
    });

    // Sincronizar el peso corregido con el animal
    await prisma.animal.update({
      where: { id: animalId },
      data: { currentWeight: newWeight }
    });

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await prisma.growthLog.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Registro eliminado" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}