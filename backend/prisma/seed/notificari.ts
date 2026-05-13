import { PrismaClient, TipNotificare } from '@prisma/client';
import { getRequired } from './utils';

export async function seedNotificari(prisma: PrismaClient) {
  console.log('🔔 Populăm notificările...');

  const facturi = await prisma.factura.findMany();
  const comenzi = await prisma.comanda.findMany();
  const incasari = await prisma.incasare.findMany();

  const facByNumar = new Map(facturi.map((f) => [f.numar, f]));
  const comByNumar = new Map(comenzi.map((c) => [c.numarComanda, c]));

  // Folosim direct primul element de incasare pentru seed (din Tehnoparts)
  const incasareTeh = incasari[0];

  const f2026001 = getRequired(facByNumar, 2026001, 'factura');
  const f2026004 = getRequired(facByNumar, 2026004, 'factura');
  const f2026002 = getRequired(facByNumar, 2026002, 'factura');
  const f2026006 = getRequired(facByNumar, 2026006, 'factura');
  const f2026003 = getRequired(facByNumar, 2026003, 'factura');

  await prisma.notificare.createMany({
    data: [
      {
        tip: TipNotificare.Succes,
        mesaj: `Factura ${f2026001.serie}-${f2026001.numar} a fost emisă pentru Popescu Ion.`,
        paginaDestinatie: 'facturare-istoric',
        sursaModul: 'Facturare',
        textActiune: 'Vezi istoricul',
        idFactura: f2026001.idFactura,
        idComanda: getRequired(comByNumar, 'CMD-2026-001', 'comanda').idComanda,
        metadata: { event: 'factura-creata', seed: true },
      },
      {
        tip: TipNotificare.Avertizare,
        mesaj: `Factura ${f2026004.serie}-${f2026004.numar} este scadentă și are 3831.80 RON de încasat.`,
        paginaDestinatie: 'incasari',
        sursaModul: 'Încasări',
        textActiune: 'Deschide Încasări',
        idFactura: f2026004.idFactura,
        idComanda: getRequired(comByNumar, 'CMD-2026-002', 'comanda').idComanda,
        metadata: { event: 'factura-restanta', seed: true },
      },
      {
        tip: TipNotificare.Succes,
        mesaj: `Încasare de 3503.36 RON înregistrată pentru Tehnoparts Solutions.`,
        paginaDestinatie: 'incasari',
        sursaModul: 'Încasări',
        textActiune: 'Deschide Încasări',
        idFactura: f2026002.idFactura,
        idComanda: getRequired(comByNumar, 'CMD-2026-004', 'comanda').idComanda,
        metadata: {
          event: 'incasare-creata',
          seed: true,
          idIncasare: incasareTeh?.idIncasare,
        },
      },
      {
        tip: TipNotificare.Info,
        mesaj:
          'Comanda CMD-2026-007 așteaptă confirmarea pieselor pentru Volkswagen Passat.',
        paginaDestinatie: 'operational-comenzi',
        sursaModul: 'Operațional',
        textActiune: 'Deschide comenzi',
        idComanda: getRequired(comByNumar, 'CMD-2026-007', 'comanda').idComanda,
        metadata: { event: 'comanda-creata', seed: true },
      },
      {
        tip: TipNotificare.Info,
        mesaj: `Factura ${f2026006.serie}-${f2026006.numar} are termen de plată în 20 de zile.`,
        paginaDestinatie: 'facturare-istoric',
        sursaModul: 'Facturare',
        textActiune: 'Vezi istoricul',
        idFactura: f2026006.idFactura,
        idComanda: getRequired(comByNumar, 'CMD-2026-008', 'comanda').idComanda,
        metadata: { event: 'factura-creata', seed: true },
      },
      {
        tip: TipNotificare.Avertizare,
        mesaj:
          'Stoc critic: Compresor AC mai are o singură bucată disponibilă.',
        paginaDestinatie: 'catalog-piese',
        sursaModul: 'Catalog',
        textActiune: 'Verifică stocul',
        metadata: { event: 'stoc-critic', seed: true },
      },
      {
        tip: TipNotificare.Succes,
        mesaj: `Factura ${f2026003.serie}-${f2026003.numar} a fost pregătită pentru Construct Fleet Management SRL.`,
        paginaDestinatie: 'facturare-istoric',
        sursaModul: 'Facturare',
        textActiune: 'Vezi istoricul',
        idFactura: f2026003.idFactura,
        idComanda: getRequired(comByNumar, 'CMD-2026-005', 'comanda').idComanda,
        metadata: { event: 'factura-creata', seed: true },
      },
    ],
  });
  console.log('✅ Notificări inserate.');
}
