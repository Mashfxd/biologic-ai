import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { feedingLogSchema } from '@/lib/validations';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const records = await prisma.feedingLog.findMany({
      include: {
        animal: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(records || []);
  } catch (error) {
    console.error('Error GET FeedingLog:', error);

    return NextResponse.json(
      { error: 'Error al obtener registros de alimentación' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = feedingLogSchema.safeParse(body);

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

    const record = await prisma.feedingLog.create({
      data: {
        animal_id: data.animal_id,
        food_type: data.food_type,
        quantity: data.quantity,
        date: data.date,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error POST FeedingLog:', error);

    return NextResponse.json(
      { error: 'Error al crear registro de alimentación' },
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

    const parsed = feedingLogSchema.safeParse(body);

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

    const record = await prisma.feedingLog.update({
      where: { id },
      data: {
        animal_id: data.animal_id,
        food_type: data.food_type,
        quantity: data.quantity,
        date: data.date,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error PUT FeedingLog:', error);

    return NextResponse.json(
      { error: 'Error al actualizar registro de alimentación' },
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

    await prisma.feedingLog.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Eliminado' });
  } catch (error) {
    console.error('Error DELETE FeedingLog:', error);

    return NextResponse.json(
      { error: 'Error al eliminar registro de alimentación' },
      { status: 500 }
    );
  }
}