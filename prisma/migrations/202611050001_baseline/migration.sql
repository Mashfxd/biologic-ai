-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MACHO', 'HEMBRA');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('HEALTHY', 'SICK', 'SOLD', 'DECEASED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "status" "AnimalStatus" NOT NULL DEFAULT 'HEALTHY',
    "purpose" TEXT,
    "litterCode" TEXT,
    "readyForMating" BOOLEAN NOT NULL DEFAULT false,
    "currentWeight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthLog" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnostic" TEXT NOT NULL,
    "treatment" TEXT NOT NULL,

    CONSTRAINT "HealthLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthLog" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GrowthLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedingLog" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "food_type" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FeedingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReproductionLog" (
    "id" SERIAL NOT NULL,
    "poza" TEXT NOT NULL,
    "matingDate" TIMESTAMP(3),
    "birthDate" TIMESTAMP(3) NOT NULL,
    "bornAlive" INTEGER NOT NULL,
    "bornDead" INTEGER NOT NULL,
    "avgBirthWeight" DOUBLE PRECISION NOT NULL,
    "weaningDate" TIMESTAMP(3),
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motherId" INTEGER NOT NULL,
    "fatherId" INTEGER,

    CONSTRAINT "ReproductionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "HealthLog_animal_id_date_idx" ON "HealthLog"("animal_id", "date");

-- CreateIndex
CREATE INDEX "GrowthLog_animal_id_date_idx" ON "GrowthLog"("animal_id", "date");

-- CreateIndex
CREATE INDEX "FeedingLog_animal_id_date_idx" ON "FeedingLog"("animal_id", "date");

-- CreateIndex
CREATE INDEX "ReproductionLog_motherId_idx" ON "ReproductionLog"("motherId");

-- CreateIndex
CREATE INDEX "ReproductionLog_fatherId_idx" ON "ReproductionLog"("fatherId");

-- AddForeignKey
ALTER TABLE "HealthLog" ADD CONSTRAINT "HealthLog_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthLog" ADD CONSTRAINT "GrowthLog_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedingLog" ADD CONSTRAINT "FeedingLog_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReproductionLog" ADD CONSTRAINT "ReproductionLog_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReproductionLog" ADD CONSTRAINT "ReproductionLog_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
