import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const records = await prisma.healthLog.findMany({
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
    const record = await prisma.healthLog.create({
      data: {
        animal_id: parseInt(body.animal_id),
        diagnostic: body.diagnostic,
        treatment: body.treatment,
        date: new Date(body.date)
      }
    });
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const record = await prisma.healthLog.update({
      where: { id: parseInt(body.id) },
      data: {
        animal_id: parseInt(body.animal_id),
        diagnostic: body.diagnostic,
        treatment: body.treatment,
        date: new Date(body.date)
      }
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
    await prisma.healthLog.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Eliminado" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}