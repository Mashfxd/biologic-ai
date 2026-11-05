import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metrics';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { analyzeProduction } from '@/lib/geminiService';

export async function POST(req) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const metrics = await getMetrics();
    const [animals, growthLogs, feedingLogs, healthLogs] =
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
      ]);

    const summary = {
      activePopulation: metrics.poblacionActiva,
      sickAnimals: metrics.animalesEnfermos,
      morbidityRate: Number(metrics.tasaMorbilidad),
      mortalityRate: Number(metrics.tasaMortalidad),
      avgCurrentWeight: Number(metrics.pesoPromedioActual),
      totalBirths: metrics.produccion.totalCrias,
      avgBirthsPerDelivery: Number(metrics.produccion.promedioCriasPorParto),
      ica: Number(metrics.eficiencia.indiceConversionAlimenticia),
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