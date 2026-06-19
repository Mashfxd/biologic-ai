import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

function getIcaInterpretation(ica) {
  if (!ica || ica <= 0) {
    return 'Aún no hay datos suficientes para calcular el ICA.';
  }

  if (ica <= 3) {
    return 'ICA eficiente. El alimento se está convirtiendo adecuadamente en ganancia de peso.';
  }

  if (ica <= 5) {
    return 'ICA aceptable. Conviene monitorear la dieta y el crecimiento.';
  }

  return 'ICA elevado. Puede existir baja ganancia de peso o uso ineficiente del alimento.';
}

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

    // Alimentación total registrada en kg
    const feedingStats = await prisma.feedingLog.aggregate({
      _sum: {
        quantity: true,
      },
    });

    const totalFoodKg = Number(feedingStats._sum.quantity || 0);

    // Historial de crecimiento ordenado por animal y fecha
    const growthRecords = await prisma.growthLog.findMany({
      orderBy: [
        {
          animal_id: 'asc',
        },
        {
          date: 'asc',
        },
      ],
      select: {
        animal_id: true,
        weight: true,
        date: true,
      },
    });

    // Agrupar pesajes por animal para estimar ganancia de peso
    const growthByAnimal = new Map();

    for (const record of growthRecords) {
      if (!growthByAnimal.has(record.animal_id)) {
        growthByAnimal.set(record.animal_id, []);
      }

      growthByAnimal.get(record.animal_id).push(record);
    }

    let totalWeightGainKg = 0;
    let animalsWithValidGrowth = 0;

    for (const records of growthByAnimal.values()) {
      if (records.length < 2) continue;

      const firstRecord = records[0];
      const lastRecord = records[records.length - 1];
      const gain = Number(lastRecord.weight || 0) - Number(firstRecord.weight || 0);

      if (gain > 0) {
        totalWeightGainKg += gain;
        animalsWithValidGrowth += 1;
      }
    }

    const ica =
      totalFoodKg > 0 && totalWeightGainKg > 0
        ? totalFoodKg / totalWeightGainKg
        : 0;

    // Últimos registros de salud para alertas rápidas
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

        eficiencia: {
          alimentoTotalKg: totalFoodKg.toFixed(2),
          gananciaPesoTotalKg: totalWeightGainKg.toFixed(2),
          animalesConCrecimientoValido: animalsWithValidGrowth,
          indiceConversionAlimenticia: ica > 0 ? ica.toFixed(2) : '0.00',
          interpretacionICA: getIcaInterpretation(ica),
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
