-- CreateEnum
CREATE TYPE "StatusGeneral" AS ENUM ('Activ', 'Inactiv');

-- CreateEnum
CREATE TYPE "TipClient" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "TipAngajat" AS ENUM ('Manager', 'Mecanic', 'Receptioner');

-- CreateEnum
CREATE TYPE "TipPiesa" AS ENUM ('NOUA', 'SH');

-- CreateEnum
CREATE TYPE "StatusFactura" AS ENUM ('Emisa', 'Platita', 'Anulata');

-- CreateTable
CREATE TABLE "Client" (
    "idClient" SERIAL NOT NULL,
    "tipClient" "TipClient" NOT NULL,
    "status" "StatusGeneral" NOT NULL DEFAULT 'Activ',
    "nume" TEXT NOT NULL,
    "prenume" TEXT,
    "telefon" TEXT NOT NULL,
    "email" TEXT,
    "adresa" TEXT NOT NULL,
    "soldDebitor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "CNP" TEXT,
    "serieCI" TEXT,
    "CUI" TEXT,
    "IBAN" TEXT,
    "nrRegCom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("idClient")
);

-- CreateTable
CREATE TABLE "Angajat" (
    "idAngajat" SERIAL NOT NULL,
    "status" "StatusGeneral" NOT NULL DEFAULT 'Activ',
    "nume" TEXT NOT NULL,
    "prenume" TEXT NOT NULL,
    "CNP" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT,
    "tipAngajat" "TipAngajat" NOT NULL,
    "specializare" TEXT,
    "costOrar" DOUBLE PRECISION,
    "departament" TEXT,
    "sporConducere" DOUBLE PRECISION,
    "nrBirou" TEXT,
    "tura" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Angajat_pkey" PRIMARY KEY ("idAngajat")
);

-- CreateTable
CREATE TABLE "Asigurator" (
    "idAsigurator" SERIAL NOT NULL,
    "status" "StatusGeneral" NOT NULL DEFAULT 'Activ',
    "denumire" TEXT NOT NULL,
    "CUI" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asigurator_pkey" PRIMARY KEY ("idAsigurator")
);

-- CreateTable
CREATE TABLE "Piesa" (
    "idPiesa" SERIAL NOT NULL,
    "codPiesa" TEXT NOT NULL,
    "denumire" TEXT NOT NULL,
    "producator" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "pretBaza" DOUBLE PRECISION NOT NULL,
    "stoc" INTEGER NOT NULL DEFAULT 0,
    "tip" "TipPiesa" NOT NULL,
    "luniGarantie" INTEGER,
    "gradUzura" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Piesa_pkey" PRIMARY KEY ("idPiesa")
);

-- CreateTable
CREATE TABLE "Manopera" (
    "idManopera" SERIAL NOT NULL,
    "codManopera" TEXT NOT NULL,
    "denumire" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "durataStd" DOUBLE PRECISION NOT NULL,
    "pretOra" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manopera_pkey" PRIMARY KEY ("idManopera")
);

-- CreateTable
CREATE TABLE "Factura" (
    "idFactura" SERIAL NOT NULL,
    "serie" TEXT NOT NULL DEFAULT 'SN',
    "numar" INTEGER NOT NULL,
    "dataEmiterii" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scadenta" TIMESTAMP(3) NOT NULL,
    "status" "StatusFactura" NOT NULL DEFAULT 'Emisa',
    "idClient" INTEGER NOT NULL,
    "totalFaraTVA" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tva" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalGeneral" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("idFactura")
);

-- CreateTable
CREATE TABLE "FacturaItem" (
    "idItem" SERIAL NOT NULL,
    "idFactura" INTEGER NOT NULL,
    "descriere" TEXT NOT NULL,
    "cantitate" INTEGER NOT NULL,
    "pretUnitar" DOUBLE PRECISION NOT NULL,
    "cotaTva" DOUBLE PRECISION NOT NULL DEFAULT 19,
    "idPiesa" INTEGER,
    "idManopera" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacturaItem_pkey" PRIMARY KEY ("idItem")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_CNP_key" ON "Client"("CNP");

-- CreateIndex
CREATE UNIQUE INDEX "Client_CUI_key" ON "Client"("CUI");

-- CreateIndex
CREATE UNIQUE INDEX "Angajat_CNP_key" ON "Angajat"("CNP");

-- CreateIndex
CREATE UNIQUE INDEX "Asigurator_CUI_key" ON "Asigurator"("CUI");

-- CreateIndex
CREATE UNIQUE INDEX "Piesa_codPiesa_key" ON "Piesa"("codPiesa");

-- CreateIndex
CREATE UNIQUE INDEX "Manopera_codManopera_key" ON "Manopera"("codManopera");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_numar_key" ON "Factura"("numar");

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_idClient_fkey" FOREIGN KEY ("idClient") REFERENCES "Client"("idClient") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaItem" ADD CONSTRAINT "FacturaItem_idFactura_fkey" FOREIGN KEY ("idFactura") REFERENCES "Factura"("idFactura") ON DELETE RESTRICT ON UPDATE CASCADE;
