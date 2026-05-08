export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ¡Esta función es vital para que no de error 405!
export async function GET() {
  try {
    const animals = await prisma.animal.findMany({
      orderBy: { id: 'desc' }
    });
    return NextResponse.json(animals || []);
  } catch (error) {
    console.error("Error en GET /api/animals:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    const animal = await prisma.animal.create({
      data: {
        name: body.name,
        species: body.species,
        breed: body.breed,
        birthDate: new Date(body.birthDate),
        gender: body.gender,
        currentWeight: parseFloat(body.currentWeight),
        status: body.status || 'healthy'
      }
    });
    
    return NextResponse.json(animal);
  } catch (error) {
    console.error("Error en POST /api/animals:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- FUNCIONES DE ACTUALIZACIÓN Y BORRADO ---

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    await prisma.animal.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Animal eliminado con éxito" });
  } catch (error) {
    console.error("Error en DELETE /api/animals:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, name, species, breed, birthDate, gender, currentWeight, status } = body;

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const updatedAnimal = await prisma.animal.update({
      where: { id: parseInt(id) },
      data: {
        name,
        species,
        breed,
        birthDate: new Date(birthDate),
        gender,
        currentWeight: parseFloat(currentWeight),
        status: status || 'healthy'
      }
    });

    return NextResponse.json(updatedAnimal);
  } catch (error) {
    console.error("Error en PUT /api/animals:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}