import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { healthLogSchema } from '@/lib/validations';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const records = await prisma.healthLog.findMany({
      include: {
        animal: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(records || []);
  } catch (error) {
    console.error('Error GET HealthLog:', error);

    return NextResponse.json(
      { error: 'Error al obtener registros de salud' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = healthLogSchema.safeParse(body);

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

    const record = await prisma.healthLog.create({
      data: {
        animal_id: data.animal_id,
        diagnostic: data.diagnostic,
        treatment: data.treatment,
        date: data.date,
      },
      include: {
        animal: true,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error POST HealthLog:', error);

    return NextResponse.json(
      { error: 'Error al crear registro de salud' },
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

    const parsed = healthLogSchema.safeParse(body);

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

    const record = await prisma.healthLog.update({
      where: {
        id,
      },
      data: {
        animal_id: data.animal_id,
        diagnostic: data.diagnostic,
        treatment: data.treatment,
        date: data.date,
      },
      include: {
        animal: true,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error PUT HealthLog:', error);

    return NextResponse.json(
      { error: 'Error al actualizar registro de salud' },
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

    await prisma.healthLog.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: 'Registro de salud eliminado',
    });
  } catch (error) {
    console.error('Error DELETE HealthLog:', error);

    return NextResponse.json(
      { error: 'Error al eliminar registro de salud' },
      { status: 500 }
    );
  }
}