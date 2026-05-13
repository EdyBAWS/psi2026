/*
  Warnings:

  - The `status` column on the `Comanda` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StatusReparatie" AS ENUM ('IN_ASTEPTARE_DIAGNOZA', 'ASTEAPTA_APROBARE_CLIENT', 'IN_ASTEPTARE_PIESE', 'IN_LUCRU', 'FINALIZAT', 'FACTURAT', 'ANULAT');

-- DropForeignKey
ALTER TABLE "Incasare" DROP CONSTRAINT "Incasare_idClient_fkey";

-- DropIndex
DROP INDEX "Incasare_idClient_idx";

-- DropIndex
DROP INDEX "IncasareAlocare_idFactura_idx";

-- DropIndex
DROP INDEX "IncasareAlocare_idIncasare_idx";

-- DropIndex
DROP INDEX "Notificare_idComanda_idx";

-- DropIndex
DROP INDEX "Notificare_idFactura_idx";

-- AlterTable
ALTER TABLE "Asigurator" ADD COLUMN     "IBAN" TEXT,
ADD COLUMN     "adresa" TEXT,
ADD COLUMN     "emailDaune" TEXT,
ADD COLUMN     "nrRegCom" TEXT,
ADD COLUMN     "termenPlataZile" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "Comanda" ADD COLUMN     "idClient" INTEGER,
ADD COLUMN     "idVehicul" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusReparatie" NOT NULL DEFAULT 'IN_ASTEPTARE_DIAGNOZA';

-- AlterTable
ALTER TABLE "Factura" ADD COLUMN     "idAsigurator" INTEGER;

-- AlterTable
ALTER TABLE "FacturaItem" ADD COLUMN     "idKit" INTEGER;

-- AlterTable
ALTER TABLE "Incasare" ADD COLUMN     "idAsigurator" INTEGER,
ALTER COLUMN "idClient" DROP NOT NULL;

-- CreateTable
CREATE TABLE "KitPiese" (
    "idKit" SERIAL NOT NULL,
    "codKit" TEXT NOT NULL,
    "denumire" TEXT NOT NULL,
    "reducere" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KitPiese_pkey" PRIMARY KEY ("idKit")
);

-- CreateTable
CREATE TABLE "KitPiesaItem" (
    "idItem" SERIAL NOT NULL,
    "idKit" INTEGER NOT NULL,
    "idPiesa" INTEGER NOT NULL,
    "cantitate" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KitPiesaItem_pkey" PRIMARY KEY ("idItem")
);

-- CreateTable
CREATE TABLE "ComandaPozitie" (
    "idPozitie" SERIAL NOT NULL,
    "idComanda" INTEGER NOT NULL,
    "idArticol" INTEGER NOT NULL,
    "tipArticol" TEXT NOT NULL,
    "cantitate" INTEGER NOT NULL,
    "pretUnitar" DOUBLE PRECISION NOT NULL,
    "idKit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComandaPozitie_pkey" PRIMARY KEY ("idPozitie")
);

-- CreateIndex
CREATE UNIQUE INDEX "KitPiese_codKit_key" ON "KitPiese"("codKit");

-- AddForeignKey
ALTER TABLE "KitPiesaItem" ADD CONSTRAINT "KitPiesaItem_idKit_fkey" FOREIGN KEY ("idKit") REFERENCES "KitPiese"("idKit") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitPiesaItem" ADD CONSTRAINT "KitPiesaItem_idPiesa_fkey" FOREIGN KEY ("idPiesa") REFERENCES "Piesa"("idPiesa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_idClient_fkey" FOREIGN KEY ("idClient") REFERENCES "Client"("idClient") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_idVehicul_fkey" FOREIGN KEY ("idVehicul") REFERENCES "Vehicul"("idVehicul") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComandaPozitie" ADD CONSTRAINT "ComandaPozitie_idComanda_fkey" FOREIGN KEY ("idComanda") REFERENCES "Comanda"("idComanda") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComandaPozitie" ADD CONSTRAINT "ComandaPozitie_idKit_fkey" FOREIGN KEY ("idKit") REFERENCES "KitPiese"("idKit") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_idAsigurator_fkey" FOREIGN KEY ("idAsigurator") REFERENCES "Asigurator"("idAsigurator") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaItem" ADD CONSTRAINT "FacturaItem_idKit_fkey" FOREIGN KEY ("idKit") REFERENCES "KitPiese"("idKit") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incasare" ADD CONSTRAINT "Incasare_idClient_fkey" FOREIGN KEY ("idClient") REFERENCES "Client"("idClient") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incasare" ADD CONSTRAINT "Incasare_idAsigurator_fkey" FOREIGN KEY ("idAsigurator") REFERENCES "Asigurator"("idAsigurator") ON DELETE SET NULL ON UPDATE CASCADE;
