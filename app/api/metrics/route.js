import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    // Animales vivos en granja: sanos + enfermos
    const activeAnimals = await prisma.animal.count({
      where: {
        status: { in: ['HEALTHY', 'SICK'] },
      },
    });

    // Total histórico registrado: sanos, enfermos, vendidos y fallecidos
    const totalRegisteredAnimals = await prisma.animal.count();

    // Animales actualmente enfermos
    const sickAnimals = await prisma.animal.count({
      where: {
        status: 'SICK',
      },
    });

    // Animales fallecidos
    const deceasedAnimals = await prisma.animal.count({
      where: {
        status: 'DECEASED',
      },
    });

    // Peso promedio actual de animales vivos en granja
    const weightStats = await prisma.animal.aggregate({
      where: {
        status: { in: ['HEALTHY', 'SICK'] },
      },
      _avg: {
        currentWeight: true,
      },
    });

    // Estadísticas de producción reproductiva
    const productionStats = await prisma.reproductionLog.aggregate({
      _sum: {
        bornAlive: true,
      },
      _avg: {
        bornAlive: true,
        avgBirthWeight: true,
      },
    });

    // Últimos registros de salud
    const recentAlerts = await prisma.healthLog.findMany({
      take: 5,
      orderBy: {
        date: 'desc',
      },
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            litterCode: true,
          },
        },
      },
    });

    // Mortalidad = fallecidos / total histórico registrado
    const mortalityRate =
      totalRegisteredAnimals > 0
        ? ((deceasedAnimals / totalRegisteredAnimals) * 100).toFixed(1)
        : '0.0';

    // Morbilidad = enfermos / animales vivos en granja
    const morbidityRate =
      activeAnimals > 0
        ? ((sickAnimals / activeAnimals) * 100).toFixed(1)
        : '0.0';

    return NextResponse.json(
      {
        poblacionActiva: activeAnimals,
        totalAnimalesRegistrados: totalRegisteredAnimals,

        animalesEnfermos: sickAnimals,
        animalesFallecidos: deceasedAnimals,

        tasaMortalidad: mortalityRate,
        tasaMorbilidad: morbidityRate,

        pesoPromedioActual: Number(weightStats._avg.currentWeight || 0).toFixed(2),

        produccion: {
          totalCrias: productionStats._sum.bornAlive || 0,
          promedioCriasPorParto: (productionStats._avg.bornAlive || 0).toFixed(1),
          pesoPromedioNacimiento: (productionStats._avg.avgBirthWeight || 0).toFixed(2),
        },

        alertasRecientes: recentAlerts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error obteniendo métricas:', error);

    return NextResponse.json(
      { error: 'Error interno cargando el Dashboard' },
      { status: 500 }
    );
  }
}