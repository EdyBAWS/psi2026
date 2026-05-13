import { PrismaClient, ModalitateIncasare } from '@prisma/client';
import { getRequired } from './utils';

export async function seedIncasari(prisma: PrismaClient) {
  console.log('💳 Populăm încasările...');

  const clienti = await prisma.client.findMany();
  const facturi = await prisma.factura.findMany();

  const clientByCui = new Map(
    clienti.flatMap((c) => (c.CUI ? [[c.CUI, c]] : [])),
  );
  const facturaByNumar = new Map(facturi.map((f) => [f.numar, f]));

  await prisma.incasare.create({
    data: {
      idClient: getRequired(clientByCui, 'RO44556677', 'CUI').idClient,
      data: new Date('2026-05-07T10:20:00'),
      suma: 3503.36,
      modalitate: ModalitateIncasare.TransferBancar,
      referinta: 'OP-TEH-2026-004',
      alocari: {
        create: [
          {
            idFactura: getRequired(facturaByNumar, 2026002, 'factura')
              .idFactura,
            sumaAlocata: 3503.36,
          },
        ],
      },
    },
  });
  console.log('✅ Încasări inserate.');
}
