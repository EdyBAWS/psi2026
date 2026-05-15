import { PrismaClient } from '@prisma/client';

export async function seedManopere(prisma: PrismaClient) {
  console.log('🛠️  Populăm manoperele...');
  await prisma.manopera.createMany({
    data: [
      {
        codManopera: 'MAN-SCHIMB-ULEI',
        denumire: 'Schimb Ulei și Filtre',
        categorie: 'Mecanică Ușoară',
        durataStd: 0.5,
        pretOra: 180,
      },
      {
        codManopera: 'MAN-DISTRIBUTIE',
        denumire: 'Înlocuire Kit Distribuție',
        categorie: 'Mecanică Grea',
        durataStd: 4.0,
        pretOra: 200,
      },
      {
        codManopera: 'MAN-DIAGNOZA',
        denumire: 'Diagnoză Computerizată',
        categorie: 'Diagnoză',
        durataStd: 1.0,
        pretOra: 190,
      },
      {
        codManopera: 'MAN-FRANE-FATA',
        denumire: 'Înlocuire Plăcuțe și Discuri Față',
        categorie: 'Mecanică Ușoară',
        durataStd: 2.0,
        pretOra: 180,
      },
      {
        codManopera: 'MAN-TINICHIGERIE-ELEM',
        denumire: 'Vopsit și Îndreptat Element',
        categorie: 'Tinichigerie',
        durataStd: 5.5,
        pretOra: 250,
      },
      {
        codManopera: 'MAN-SERVICE-AC',
        denumire: 'Revizie și Încărcare Freon',
        categorie: 'Electrică',
        durataStd: 1.8,
        pretOra: 180,
      },
      {
        codManopera: 'MAN-REVIZIE-ANUALA',
        denumire: 'Revizie Anuală Completă',
        categorie: 'Mecanică Ușoară',
        durataStd: 1.5,
        pretOra: 170,
      },
      {
        codManopera: 'MAN-SCHIMB-AMORT',
        denumire: 'Înlocuire Amortizoare Față',
        categorie: 'Mecanică Ușoară',
        durataStd: 2.6,
        pretOra: 190,
      },
      {
        codManopera: 'MAN-PARBRIZ',
        denumire: 'Înlocuire Parbriz și Calibrare Senzori',
        categorie: 'Mecanică Ușoară',
        durataStd: 3.0,
        pretOra: 260,
      },
      {
        codManopera: 'MAN-DIRECTIE',
        denumire: 'Verificare și Reglaj Direcție',
        categorie: 'Mecanică Ușoară',
        durataStd: 1.2,
        pretOra: 220,
      },
      {
        codManopera: 'MAN-DISTRIB-VW',
        denumire: 'Înlocuire Distribuție Volkswagen',
        categorie: 'Mecanică Grea',
        durataStd: 4.5,
        pretOra: 240,
      },
      {
        codManopera: 'MAN-SENZORI-PARCARE',
        denumire: 'Montaj și Calibrare Senzori Parcare',
        categorie: 'Electrică',
        durataStd: 1.4,
        pretOra: 230,
      },
    ],
  });
  console.log('✅ Manopere inserate.');
}
