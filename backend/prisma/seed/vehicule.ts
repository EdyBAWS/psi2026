import { PrismaClient, StatusGeneral } from '@prisma/client';
import { getRequired } from './utils';

export async function seedVehicule(prisma: PrismaClient) {
  console.log('🚗 Populăm vehiculele...');

  const clienti = await prisma.client.findMany();
  if (clienti.length === 0)
    throw new Error('Clienții trebuie inserați înainte de vehicule!');

  const clientByCnp = new Map(
    clienti.flatMap((c) => (c.CNP ? [[c.CNP, c]] : [])),
  );
  const clientByCui = new Map(
    clienti.flatMap((c) => (c.CUI ? [[c.CUI, c]] : [])),
  );

  await prisma.vehicul.createMany({
    data: [
      {
        numarInmatriculare: 'IS-09-SAG',
        marca: 'Dacia',
        model: 'Logan',
        vin: 'UU1LSDL4H60512345',
        idClient: getRequired(clientByCnp, '1800101223344', 'client CNP')
          .idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'B-54-GAR',
        marca: 'Skoda',
        model: 'Octavia',
        vin: 'TMBJR7NX1MY102468',
        idClient: getRequired(clientByCui, 'RO9876543', 'client CUI').idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'CJ-12-AUT',
        marca: 'Volkswagen',
        model: 'Golf',
        vin: 'WVWZZZAUZFW223344',
        idClient: getRequired(clientByCnp, '2870306123456', 'client CNP')
          .idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'B-88-TPD',
        marca: 'Ford',
        model: 'Transit Custom',
        vin: 'WF0YXXTTGYLK55129',
        idClient: getRequired(clientByCui, 'RO44556677', 'client CUI').idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'NT-07-MIL',
        marca: 'Renault',
        model: 'Clio',
        vin: 'VF15R980H63218457',
        idClient: getRequired(clientByCnp, '1900714223345', 'client CNP')
          .idClient,
        status: StatusGeneral.Inactiv,
      },
      {
        numarInmatriculare: 'CJ-44-NLF',
        marca: 'Toyota',
        model: 'Proace City',
        vin: 'YAREFYHZ2GJ118903',
        idClient: getRequired(clientByCui, 'RO30112244', 'client CUI').idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'BV-21-RXV',
        marca: 'Hyundai',
        model: 'i30',
        vin: 'TMAD351UAGJ452187',
        idClient: getRequired(clientByCnp, '2920415223344', 'client CNP')
          .idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'B-901-CFM',
        marca: 'Mercedes-Benz',
        model: 'Sprinter',
        vin: 'WDB9076331P441207',
        idClient: getRequired(clientByCui, 'RO50887712', 'client CUI').idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'CT-33-DNG',
        marca: 'Volkswagen',
        model: 'Passat',
        vin: 'WVWZZZ3CZGE338120',
        idClient: getRequired(clientByCnp, '1850822223344', 'client CNP')
          .idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'B-77-UDL',
        marca: 'Peugeot',
        model: 'Partner',
        vin: 'VF3K9HN8CCR447210',
        idClient: getRequired(clientByCui, 'RO77112233', 'client CUI').idClient,
        status: StatusGeneral.Activ,
      },
    ],
  });
  console.log('✅ Vehicule inserate.');
}
