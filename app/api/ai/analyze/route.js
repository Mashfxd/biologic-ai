import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { analyzeProduction } from '@/lib/geminiService';

export async function POST(req) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    let clientMetrics = null;
    try {
      const body = await req.json();
      clientMetrics = body?.metrics || null;
    } catch {
      // Body opcional
    }

    const [animals, growthLogs, feedingLogs, healthLogs, totalCount, deceasedCount, productionAgg] =
      await Promise.all([
        prisma.animal.findMany({
          take: 15,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            gender: true,
            status: true,
            currentWeight: true,
            purpose: true,
          },
        }),
        prisma.growthLog.findMany({
          take: 20,
          orderBy: { date: 'desc' },
          select: {
            animal_id: true,
            weight: true,
            date: true,
          },
        }),
        prisma.feedingLog.findMany({
          take: 20,
          orderBy: { date: 'desc' },
          select: {
            animal_id: true,
            food_type: true,
            quantity: true,
            date: true,
          },
        }),
        prisma.healthLog.findMany({
          take: 10,
          orderBy: { date: 'desc' },
          select: {
            animal_id: true,
            diagnostic: true,
            treatment: true,
            date: true,
          },
        }),
        prisma.animal.count(),
        prisma.animal.count({ where: { status: 'DECEASED' } }),
        prisma.reproductionLog.aggregate({
          _sum: { bornAlive: true },
          _avg: { bornAlive: true },
        }),
      ]);

    const activeAnimals = animals.filter(
      (a) => a.status === 'HEALTHY' || a.status === 'SICK'
    );
    const sickAnimalsCount = animals.filter((a) => a.status === 'SICK').length;

    const summary = {
      activePopulation:
        Number(clientMetrics?.poblacionActiva) || activeAnimals.length,
      sickAnimals:
        Number(clientMetrics?.animalesEnfermos) || sickAnimalsCount,
      morbidityRate: Number(clientMetrics?.tasaMorbilidad || 0),
      mortalityRate:
        Number(clientMetrics?.tasaMortalidad) ||
        (totalCount > 0 ? Number(((deceasedCount / totalCount) * 100).toFixed(1)) : 0),
      avgCurrentWeight: Number(clientMetrics?.pesoPromedioActual || 0),
      totalBirths:
        Number(clientMetrics?.produccion?.totalCrias) ||
        Number(productionAgg._sum.bornAlive || 0),
      avgBirthsPerDelivery:
        Number(clientMetrics?.produccion?.promedioCriasPorParto) ||
        Number((productionAgg._avg.bornAlive || 0).toFixed(1)),
      ica: Number(clientMetrics?.eficiencia?.indiceConversionAlimenticia || 0),
    };

    const result = await analyzeProduction({
      animals,
      growthLogs,
      feedingLogs,
      healthLogs,
      summary,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en /api/ai/analyze:', error);
    return NextResponse.json(
      { error: 'No se pudo generar el análisis zootécnico en este momento.' },
      { status: 500 }
    );
  }
}