import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const animals = await prisma.animal.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(animals);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener animales' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    
    const newAnimal = await prisma.animal.create({
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed,
        birthDate: new Date(data.birthDate),
        gender: data.gender,
        status: data.status,
        purpose: data.purpose || 'Engorde',
        litterCode: data.litterCode || null,
        currentWeight: parseFloat(data.currentWeight)
      }
    });
    return NextResponse.json(newAnimal);
  } catch (error) {
    console.error("Error detallado en POST:", error);
    return NextResponse.json({ error: 'Error interno al crear el animal', details: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const data = await req.json();
    const updatedAnimal = await prisma.animal.update({
      where: { id: parseInt(data.id) },
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed,
        birthDate: new Date(data.birthDate),
        gender: data.gender,
        status: data.status,
        purpose: data.purpose || 'Engorde',
        litterCode: data.litterCode || null,
        currentWeight: parseFloat(data.currentWeight)
      }
    });
    return NextResponse.json(updatedAnimal);
  } catch (error) {
    console.error("Error en PUT:", error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await prisma.animal.delete({
      where: { id: parseInt(id) } 
    });
    return NextResponse.json({ message: 'Eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}