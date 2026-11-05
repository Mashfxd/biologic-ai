export async function syncAnimalCurrentWeight(tx, animalId) {
  const latestGrowth = await tx.growthLog.findFirst({
    where: {
      animal_id: animalId,
    },
    orderBy: [
      {
        date: 'desc',
      },
      {
        id: 'desc',
      },
    ],
    select: {
      weight: true,
    },
  });

  if (!latestGrowth) throw new Error('LAST_WEIGHT');

  await tx.animal.update({
    where: {
      id: animalId,
    },
    data: {
      currentWeight: latestGrowth.weight,
    },
  });
}

