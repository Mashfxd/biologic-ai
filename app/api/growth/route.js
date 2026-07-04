import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { growthLogSchema } from '@/lib/validations';
import { requireAuth } from '@/lib/auth';

async function syncAnimalCurrentWeight(tx, animalId) {
  const latestGrowth = await tx.growthLog.findFirst({
    where: {
      animal_id: animalId,
    },
    orderBy: [
      {
        date: 'desc',
      },
      {
        id: 'desc',
      },
    ],
    select: {
      weight: true,
    },
  });

  if (!latestGrowth) return;

  await tx.animal.update({
    where: {
      id: animalId,
    },
    data: {
      currentWeight: latestGrowth.weight,
    },
  });
}

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const records = await prisma.growthLog.findMany({
      include: {
        animal: true,
      },
      orderBy: {
        date: 'desc',
      },
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

    const record = await prisma.$transaction(async (tx) => {
      const createdRecord = await tx.growthLog.create({
        data: {
          animal_id: data.animal_id,
          weight: data.weight,
          date: data.date,
        },
        include: {
          animal: true,
        },
      });

      await syncAnimalCurrentWeight(tx, data.animal_id);

      return createdRecord;
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

    const record = await prisma.$transaction(async (tx) => {
      const previousRecord = await tx.growthLog.findUnique({
        where: {
          id,
        },
        select: {
          animal_id: true,
        },
      });

      const updatedRecord = await tx.growthLog.update({
        where: {
          id,
        },
        data: {
          animal_id: data.animal_id,
          weight: data.weight,
          date: data.date,
        },
        include: {
          animal: true,
        },
      });

      if (previousRecord?.animal_id && previousRecord.animal_id !== data.animal_id) {
        await syncAnimalCurrentWeight(tx, previousRecord.animal_id);
      }

      await syncAnimalCurrentWeight(tx, data.animal_id);

      return updatedRecord;
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

    await prisma.$transaction(async (tx) => {
      const record = await tx.growthLog.findUnique({
        where: {
          id,
        },
        select: {
          animal_id: true,
        },
      });

      await tx.growthLog.delete({
        where: {
          id,
        },
      });

      if (record?.animal_id) {
        await syncAnimalCurrentWeight(tx, record.animal_id);
      }
    });

    return NextResponse.json({
      message: 'Registro de crecimiento eliminado',
    });
  } catch (error) {
    console.error('Error DELETE GrowthLog:', error);

    return NextResponse.json(
      { error: 'Error al eliminar registro de crecimiento' },
      { status: 500 }
    );
  }
}
