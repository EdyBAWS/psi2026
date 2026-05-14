/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Angajat` table. All the data in the column will be lost.
  - Added the required column `descriere` to the `ComandaPozitie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipAngajat" ADD VALUE 'Inspector';
ALTER TYPE "TipAngajat" ADD VALUE 'Contabil';

-- AlterTable
ALTER TABLE "Angajat" DROP COLUMN "updatedAt",
ADD COLUMN     "esteInspector" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "ComandaPozitie" ADD COLUMN     "codArticol" TEXT,
ADD COLUMN     "cotaTva" DOUBLE PRECISION NOT NULL DEFAULT 19,
ADD COLUMN     "descriere" TEXT NOT NULL,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "observatii" TEXT,
ADD COLUMN     "unitateMasura" TEXT,
ALTER COLUMN "idArticol" DROP NOT NULL,
ALTER COLUMN "cantitate" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "DosarDauna" ADD COLUMN     "idInspector" INTEGER;

-- AlterTable
ALTER TABLE "Factura" ADD COLUMN     "discountProcent" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "_ComandaMecanic" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ComandaMecanic_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ComandaMecanic_B_index" ON "_ComandaMecanic"("B");

-- AddForeignKey
ALTER TABLE "DosarDauna" ADD CONSTRAINT "DosarDauna_idInspector_fkey" FOREIGN KEY ("idInspector") REFERENCES "Angajat"("idAngajat") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComandaMecanic" ADD CONSTRAINT "_ComandaMecanic_A_fkey" FOREIGN KEY ("A") REFERENCES "Angajat"("idAngajat") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComandaMecanic" ADD CONSTRAINT "_ComandaMecanic_B_fkey" FOREIGN KEY ("B") REFERENCES "Comanda"("idComanda") ON DELETE CASCADE ON UPDATE CASCADE;
