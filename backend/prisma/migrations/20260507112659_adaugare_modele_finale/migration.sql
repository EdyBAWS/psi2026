-- AlterTable
ALTER TABLE "Factura" ADD COLUMN     "idComanda" INTEGER;

-- CreateTable
CREATE TABLE "Vehicul" (
    "idVehicul" SERIAL NOT NULL,
    "numarInmatriculare" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "vin" TEXT,
    "status" "StatusGeneral" NOT NULL DEFAULT 'Activ',
    "idClient" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicul_pkey" PRIMARY KEY ("idVehicul")
);

-- CreateTable
CREATE TABLE "DosarDauna" (
    "idDosar" SERIAL NOT NULL,
    "numarDosar" TEXT NOT NULL,
    "dataDeschidere" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusGeneral" NOT NULL DEFAULT 'Activ',
    "idClient" INTEGER NOT NULL,
    "idVehicul" INTEGER NOT NULL,
    "idAsigurator" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DosarDauna_pkey" PRIMARY KEY ("idDosar")
);

-- CreateTable
CREATE TABLE "Comanda" (
    "idComanda" SERIAL NOT NULL,
    "numarComanda" TEXT NOT NULL,
    "dataPreconizata" TIMESTAMP(3),
    "status" "StatusGeneral" NOT NULL DEFAULT 'Activ',
    "idDosar" INTEGER,
    "idAngajat" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comanda_pkey" PRIMARY KEY ("idComanda")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicul_numarInmatriculare_key" ON "Vehicul"("numarInmatriculare");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicul_vin_key" ON "Vehicul"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "DosarDauna_numarDosar_key" ON "DosarDauna"("numarDosar");

-- CreateIndex
CREATE UNIQUE INDEX "Comanda_numarComanda_key" ON "Comanda"("numarComanda");

-- AddForeignKey
ALTER TABLE "Vehicul" ADD CONSTRAINT "Vehicul_idClient_fkey" FOREIGN KEY ("idClient") REFERENCES "Client"("idClient") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DosarDauna" ADD CONSTRAINT "DosarDauna_idClient_fkey" FOREIGN KEY ("idClient") REFERENCES "Client"("idClient") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DosarDauna" ADD CONSTRAINT "DosarDauna_idVehicul_fkey" FOREIGN KEY ("idVehicul") REFERENCES "Vehicul"("idVehicul") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DosarDauna" ADD CONSTRAINT "DosarDauna_idAsigurator_fkey" FOREIGN KEY ("idAsigurator") REFERENCES "Asigurator"("idAsigurator") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_idDosar_fkey" FOREIGN KEY ("idDosar") REFERENCES "DosarDauna"("idDosar") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_idAngajat_fkey" FOREIGN KEY ("idAngajat") REFERENCES "Angajat"("idAngajat") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_idComanda_fkey" FOREIGN KEY ("idComanda") REFERENCES "Comanda"("idComanda") ON DELETE SET NULL ON UPDATE CASCADE;
