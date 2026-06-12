import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { growthLogSchema } from '@/lib/validations';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const records = await prisma.growthLog.findMany({
      include: {
        animal: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(records || []);
  } catch (error) {
    console.error('Error GET GrowthLog:', error);

    return NextResponse.json(
      { error: 'Error al obtener registros de crecimiento' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = growthLogSchema.safeParse(body);

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

    const record = await prisma.growthLog.create({
      data: {
        animal_id: data.animal_id,
        weight: data.weight,
        date: data.date,
      },
    });

    await prisma.animal.update({
      where: { id: data.animal_id },
      data: {
        currentWeight: data.weight,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error POST GrowthLog:', error);

    return NextResponse.json(
      { error: 'Error al crear registro de crecimiento' },
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

    const parsed = growthLogSchema.safeParse(body);

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

    const record = await prisma.growthLog.update({
      where: { id },
      data: {
        animal_id: data.animal_id,
        weight: data.weight,
        date: data.date,
      },
    });

    await prisma.animal.update({
      where: {
        id: data.animal_id,
      },
      data: {
        currentWeight: data.weight,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error PUT GrowthLog:', error);

    return NextResponse.json(
      { error: 'Error al actualizar registro de crecimiento' },
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

    await prisma.growthLog.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Registro eliminado' });
  } catch (error) {
    console.error('Error DELETE GrowthLog:', error);

    return NextResponse.json(
      { error: 'Error al eliminar registro de crecimiento' },
      { status: 500 }
    );
  }
}