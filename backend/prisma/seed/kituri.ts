import { PrismaClient } from '@prisma/client';

export async function seedKituri(prisma: PrismaClient) {
  console.log('📦 Populăm kiturile de piese...');

  const piese = await prisma.piesa.findMany();
  const piesaByCod = new Map(piese.map((p) => [p.codPiesa, p]));

  const getPiesaId = (cod: string) => {
    const p = piesaByCod.get(cod);
    if (!p) throw new Error(`Piesa cu codul ${cod} nu a fost găsită.`);
    return p.idPiesa;
  };

  const kituriData = [
    {
      codKit: 'KIT-REV-VAG',
      denumire: 'Kit Revizie Standard (VAG)',
      reducere: 10,
      piese: [
        { cod: 'FIL-UL-BOSCH', cantitate: 1 },
        { cod: 'FIL-AER-MANN', cantitate: 1 },
        { cod: 'FIL-CAB-HENG', cantitate: 1 },
      ],
    },
    {
      codKit: 'KIT-FRANA-ATE',
      denumire: 'Kit Frânare Față Premium (ATE/Textar)',
      reducere: 5,
      piese: [
        { cod: 'PL-FR-RCL', cantitate: 1 },
        { cod: 'DISC-FR-RCL', cantitate: 2 },
      ],
    },
  ];

  for (const kit of kituriData) {
    await prisma.kitPiese.create({
      data: {
        codKit: kit.codKit,
        denumire: kit.denumire,
        reducere: kit.reducere,
        piese: {
          create: kit.piese.map((p) => ({
            idPiesa: getPiesaId(p.cod),
            cantitate: p.cantitate,
          })),
        },
      },
    });
  }

  console.log('✅ Kituri inserate.');
}
