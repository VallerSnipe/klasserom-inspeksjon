-- CreateEnum
CREATE TYPE "Status" AS ENUM ('OK', 'IKKE_OK');

-- CreateTable
CREATE TABLE "Classroom" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspector" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Inspector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" SERIAL NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classroomId" INTEGER NOT NULL,
    "inspectorId" INTEGER NOT NULL,
    "projectorStatus" "Status" NOT NULL,
    "dustFilterStatus" "Status" NOT NULL,
    "speakerStatus" "Status" NOT NULL,
    "hdmiStatus" "Status" NOT NULL,
    "chargerStatus" "Status" NOT NULL,
    "projectorComment" TEXT,
    "lampHours" TEXT,
    "lampLifeRemaining" TEXT,
    "speakerComment" TEXT,
    "hdmiComment" TEXT,
    "chargerComment" TEXT,
    "generalComment" TEXT,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_name_key" ON "Classroom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Inspector_name_key" ON "Inspector"("name");

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "Inspector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
