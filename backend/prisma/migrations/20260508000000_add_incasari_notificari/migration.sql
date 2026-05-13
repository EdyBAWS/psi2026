DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ModalitateIncasare') THEN
    CREATE TYPE "ModalitateIncasare" AS ENUM ('TransferBancar', 'POS', 'Cash');
  END IF;
END $$;

ALTER TABLE "FacturaItem"
ALTER COLUMN "cantitate" TYPE DOUBLE PRECISION
USING "cantitate"::double precision;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TipNotificare') THEN
    CREATE TYPE "TipNotificare" AS ENUM ('Info', 'Avertizare', 'Succes');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Incasare" (
  "idIncasare" SERIAL PRIMARY KEY,
  "idClient" INTEGER NOT NULL,
  "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "suma" DOUBLE PRECISION NOT NULL,
  "modalitate" "ModalitateIncasare" NOT NULL,
  "referinta" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "IncasareAlocare" (
  "idAlocare" SERIAL PRIMARY KEY,
  "idIncasare" INTEGER NOT NULL,
  "idFactura" INTEGER NOT NULL,
  "sumaAlocata" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Notificare" (
  "idNotificare" SERIAL PRIMARY KEY,
  "tip" "TipNotificare" NOT NULL DEFAULT 'Info',
  "mesaj" TEXT NOT NULL,
  "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paginaDestinatie" TEXT,
  "sursaModul" TEXT,
  "textActiune" TEXT,
  "citit" BOOLEAN NOT NULL DEFAULT false,
  "arhivata" BOOLEAN NOT NULL DEFAULT false,
  "stearsa" BOOLEAN NOT NULL DEFAULT false,
  "idFactura" INTEGER,
  "idComanda" INTEGER,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "Incasare_idClient_idx" ON "Incasare"("idClient");
CREATE INDEX IF NOT EXISTS "IncasareAlocare_idIncasare_idx" ON "IncasareAlocare"("idIncasare");
CREATE INDEX IF NOT EXISTS "IncasareAlocare_idFactura_idx" ON "IncasareAlocare"("idFactura");
CREATE INDEX IF NOT EXISTS "Notificare_idFactura_idx" ON "Notificare"("idFactura");
CREATE INDEX IF NOT EXISTS "Notificare_idComanda_idx" ON "Notificare"("idComanda");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Incasare_idClient_fkey'
  ) THEN
    ALTER TABLE "Incasare"
      ADD CONSTRAINT "Incasare_idClient_fkey"
      FOREIGN KEY ("idClient") REFERENCES "Client"("idClient")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'IncasareAlocare_idIncasare_fkey'
  ) THEN
    ALTER TABLE "IncasareAlocare"
      ADD CONSTRAINT "IncasareAlocare_idIncasare_fkey"
      FOREIGN KEY ("idIncasare") REFERENCES "Incasare"("idIncasare")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'IncasareAlocare_idFactura_fkey'
  ) THEN
    ALTER TABLE "IncasareAlocare"
      ADD CONSTRAINT "IncasareAlocare_idFactura_fkey"
      FOREIGN KEY ("idFactura") REFERENCES "Factura"("idFactura")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Notificare_idFactura_fkey'
  ) THEN
    ALTER TABLE "Notificare"
      ADD CONSTRAINT "Notificare_idFactura_fkey"
      FOREIGN KEY ("idFactura") REFERENCES "Factura"("idFactura")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Notificare_idComanda_fkey'
  ) THEN
    ALTER TABLE "Notificare"
      ADD CONSTRAINT "Notificare_idComanda_fkey"
      FOREIGN KEY ("idComanda") REFERENCES "Comanda"("idComanda")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
