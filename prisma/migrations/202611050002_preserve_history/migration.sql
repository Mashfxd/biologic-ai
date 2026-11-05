BEGIN;

-- DropForeignKey
ALTER TABLE "HealthLog" DROP CONSTRAINT "HealthLog_animal_id_fkey";

-- DropForeignKey
ALTER TABLE "GrowthLog" DROP CONSTRAINT "GrowthLog_animal_id_fkey";

-- DropForeignKey
ALTER TABLE "FeedingLog" DROP CONSTRAINT "FeedingLog_animal_id_fkey";

-- DropForeignKey
ALTER TABLE "ReproductionLog" DROP CONSTRAINT "ReproductionLog_fatherId_fkey";

-- AddForeignKey
ALTER TABLE "HealthLog" ADD CONSTRAINT "HealthLog_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthLog" ADD CONSTRAINT "GrowthLog_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedingLog" ADD CONSTRAINT "FeedingLog_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReproductionLog" ADD CONSTRAINT "ReproductionLog_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
