import prisma from '@/lib/prisma';
import { calculateEfficiency } from '@/lib/feed-efficiency.mjs';

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

export async function getMetrics() {
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

  // Peso promedio actual de animales vivos en granja, expresado en gramos
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

  // Historial de crecimiento ordenado por animal y fecha.
  // Los pesos se registran en gramos para coincidir con Inventario y alertas de empadre.
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
      id: true,
      animal_id: true,
      weight: true,
      date: true,
    },
  });

  const feedingRecords = await prisma.feedingLog.findMany({
    select: { animal_id: true, date: true, quantity: true },
  });
  const efficiency = calculateEfficiency(growthRecords, feedingRecords);
  const totalFoodKg = efficiency.food;
  const totalWeightGainGrams = efficiency.gain;
  const totalWeightGainKg = efficiency.gain / 1000;
  const animalsWithValidGrowth = efficiency.count;
  const ica = efficiency.ica;

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

  return {
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
      gananciaPesoTotalGramos: totalWeightGainGrams.toFixed(2),
      animalesConCrecimientoValido: animalsWithValidGrowth,
      indiceConversionAlimenticia: ica === null ? null : ica.toFixed(2),
      interpretacionICA: getIcaInterpretation(ica),
    },

    alertasRecientes: recentAlerts,
  };
}
