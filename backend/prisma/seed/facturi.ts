import { PrismaClient, StatusFactura } from '@prisma/client';
import { getRequired } from './utils';

export async function seedFacturi(prisma: PrismaClient) {
  console.log('🧾 Populăm facturile și itemele...');

  const clienti = await prisma.client.findMany();
  const comenzi = await prisma.comanda.findMany();

  const clientByCnp = new Map(
    clienti.flatMap((c) => (c.CNP ? [[c.CNP, c]] : [])),
  );
  const clientByCui = new Map(
    clienti.flatMap((c) => (c.CUI ? [[c.CUI, c]] : [])),
  );
  const comandaByNumar = new Map(comenzi.map((c) => [c.numarComanda, c]));

  await prisma.factura.create({
    data: {
      serie: 'SAG',
      numar: 2026002,
      idClient: getRequired(clientByCui, 'RO44556677', 'CUI').idClient,
      idComanda: getRequired(comandaByNumar, 'CMD-2026-004', 'comanda')
        .idComanda,
      scadenta: new Date('2026-05-25T00:00:00'),
      status: StatusFactura.Platita,
      discountProcent: 5,
      totalFaraTVA: 2944,
      tva: 559.36,
      totalGeneral: 3503.36,
      iteme: {
        create: [
          {
            descriere: 'Compresor AC Ford Transit',
            cantitate: 1,
            pretUnitar: 1980,
            cotaTva: 19,
          },
          {
            descriere: 'Revizie și încărcare freon',
            cantitate: 2,
            pretUnitar: 230,
            cotaTva: 19,
          },
          {
            descriere: 'Diagnoză computerizată',
            cantitate: 1,
            pretUnitar: 190,
            cotaTva: 19,
          },
          {
            descriere: 'Baterie 70Ah',
            cantitate: 1,
            pretUnitar: 314,
            cotaTva: 19,
          },
        ],
      },
    },
  });

  await prisma.factura.create({
    data: {
      serie: 'SAG',
      numar: 2026003,
      idClient: getRequired(clientByCui, 'RO50887712', 'CUI').idClient,
      idComanda: getRequired(comandaByNumar, 'CMD-2026-005', 'comanda')
        .idComanda,
      scadenta: new Date('2026-06-01T00:00:00'),
      status: StatusFactura.Emisa,
      penalizareProcent: 2,
      totalFaraTVA: 2820,
      tva: 535.8,
      totalGeneral: 3355.8,
      iteme: {
        create: [
          {
            descriere: 'Parbriz Mercedes Sprinter',
            cantitate: 1,
            pretUnitar: 1280,
            cotaTva: 19,
          },
          {
            descriere: 'Basculă față Mercedes Sprinter',
            cantitate: 1,
            pretUnitar: 760,
            cotaTva: 19,
          },
          {
            descriere: 'Înlocuire parbriz și calibrare senzori',
            cantitate: 3,
            pretUnitar: 260,
            cotaTva: 19,
          },
        ],
      },
    },
  });

  await prisma.factura.create({
    data: {
      serie: 'SAG',
      numar: 2026004,
      idClient: getRequired(clientByCui, 'RO9876543', 'CUI').idClient,
      idComanda: getRequired(comandaByNumar, 'CMD-2026-002', 'comanda')
        .idComanda,
      scadenta: new Date('2026-05-02T00:00:00'),
      status: StatusFactura.Emisa,
      totalFaraTVA: 3220,
      tva: 611.8,
      totalGeneral: 3831.8,
      iteme: {
        create: [
          {
            descriere: 'Bară față Skoda Octavia',
            cantitate: 1,
            pretUnitar: 1820,
            cotaTva: 19,
          },
          {
            descriere: 'Far stânga Skoda Octavia',
            cantitate: 1,
            pretUnitar: 640,
            cotaTva: 19,
          },
          {
            descriere: 'Tinichigerie și vopsitorie',
            cantitate: 4,
            pretUnitar: 190,
            cotaTva: 19,
          },
        ],
      },
    },
  });

  await prisma.factura.create({
    data: {
      serie: 'SAG',
      numar: 2026006,
      idClient: getRequired(clientByCui, 'RO77112233', 'CUI').idClient,
      idComanda: getRequired(comandaByNumar, 'CMD-2026-008', 'comanda')
        .idComanda,
      scadenta: new Date('2026-05-28T00:00:00'),
      status: StatusFactura.Emisa,
      totalFaraTVA: 1265,
      tva: 240.35,
      totalGeneral: 1505.35,
      iteme: {
        create: [
          {
            descriere: 'Senzor parcare spate',
            cantitate: 3,
            pretUnitar: 220,
            cotaTva: 19,
          },
          {
            descriere: 'Montaj și calibrare senzori parcare',
            cantitate: 1.4,
            pretUnitar: 230,
            cotaTva: 19,
          },
          {
            descriere: 'Diagnoză computerizată',
            cantitate: 1,
            pretUnitar: 283,
            cotaTva: 19,
          },
        ],
      },
    },
  });
  console.log('✅ Facturi inserate.');
}
