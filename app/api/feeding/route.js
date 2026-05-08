import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const records = await prisma.feedingLog.findMany({
      include: {
        animal: true // Trae los datos del animal relacionado para mostrar su nombre
      },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(records || []);
  } catch (error) {
    console.error("Error GET FeedingLog:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const record = await prisma.feedingLog.create({
      data: {
        animal_id: parseInt(body.animal_id),
        food_type: body.food_type,
        quantity: parseFloat(body.quantity),
        date: new Date(body.date)
      }
    });
    return NextResponse.json(record);
  } catch (error) {
    console.error("Error POST FeedingLog:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const record = await prisma.feedingLog.update({
      where: { id: parseInt(body.id) },
      data: {
        animal_id: parseInt(body.animal_id),
        food_type: body.food_type,
        quantity: parseFloat(body.quantity),
        date: new Date(body.date)
      }
    });
    return NextResponse.json(record);
  } catch (error) {
    console.error("Error PUT FeedingLog:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await prisma.feedingLog.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Eliminado" });
  } catch (error) {
    console.error("Error DELETE FeedingLog:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}