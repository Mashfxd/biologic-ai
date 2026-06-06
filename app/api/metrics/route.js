import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Total de animales activos (excluyendo fallecidos o vendidos)
    const totalAnimals = await prisma.animal.count({
      where: {
        status: { in: ['HEALTHY', 'SICK'] }
      }
    });

    // 2. Animales en tratamiento (Enfermos)
    const sickAnimals = await prisma.animal.count({
      where: { status: 'SICK' }
    });

    // 3. Estadísticas de Producción (Promedios y Sumas usando _aggregate)
    const productionStats = await prisma.reproductionLog.aggregate({
      _sum: { bornAlive: true },
      _avg: { bornAlive: true, avgBirthWeight: true }
    });

    // 4. Últimos registros de salud para alertas rápidas
    const recentAlerts = await prisma.healthLog.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { animal: { select: { id: true, code: true, name: true, litterCode: true } } }
    });

    // 5. Construimos el JSON de respuesta con cálculos seguros
    return NextResponse.json({
      poblacionActiva: totalAnimals,
      animalesEnfermos: sickAnimals,
      tasaMortalidad: totalAnimals > 0 ? ((sickAnimals / totalAnimals) * 100).toFixed(1) : 0, // Ejemplo de KPI
      produccion: {
        totalCrias: productionStats._sum.bornAlive || 0,
        promedioCriasPorParto: (productionStats._avg.bornAlive || 0).toFixed(1),
        pesoPromedioNacimiento: (productionStats._avg.avgBirthWeight || 0).toFixed(2),
      },
      alertasRecientes: recentAlerts
    }, { status: 200 });

  } catch (error) {
    console.error("Error obteniendo métricas:", error);
    return NextResponse.json({ error: "Error interno cargando el Dashboard" }, { status: 500 });
  }
}