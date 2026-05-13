import { PrismaClient, StatusGeneral } from '@prisma/client';
import { getRequired } from './utils';

export async function seedDosareDauna(prisma: PrismaClient) {
  console.log('📂 Populăm dosarele de daună...');

  const clienti = await prisma.client.findMany();
  const vehicule = await prisma.vehicul.findMany();
  const asiguratori = await prisma.asigurator.findMany();

  const clientByCui = new Map(
    clienti.flatMap((c) => (c.CUI ? [[c.CUI, c]] : [])),
  );
  const clientByCnp = new Map(
    clienti.flatMap((c) => (c.CNP ? [[c.CNP, c]] : [])),
  );
  const vehiculByNr = new Map(vehicule.map((v) => [v.numarInmatriculare, v]));
  const asigByCui = new Map(asiguratori.map((a) => [a.CUI, a]));

  await prisma.dosarDauna.createMany({
    data: [
      {
        numarDosar: 'DAUNA-2026-001',
        idClient: getRequired(clientByCui, 'RO9876543', 'client CUI').idClient,
        idVehicul: getRequired(vehiculByNr, 'B-54-GAR', 'vehicul').idVehicul,
        idAsigurator: getRequired(asigByCui, 'RO6120740', 'asigurator')
          .idAsigurator,
        status: StatusGeneral.Activ,
      },
      {
        numarDosar: 'DAUNA-2026-002',
        idClient: getRequired(clientByCnp, '2870306123456', 'client CNP')
          .idClient,
        idVehicul: getRequired(vehiculByNr, 'CJ-12-AUT', 'vehicul').idVehicul,
        idAsigurator: getRequired(asigByCui, 'RO5587260', 'asigurator')
          .idAsigurator,
        status: StatusGeneral.Activ,
      },
      {
        numarDosar: 'DAUNA-2026-003',
        idClient: getRequired(clientByCui, 'RO44556677', 'client CUI').idClient,
        idVehicul: getRequired(vehiculByNr, 'B-88-TPD', 'vehicul').idVehicul,
        idAsigurator: getRequired(asigByCui, 'RO336290', 'asigurator')
          .idAsigurator,
        status: StatusGeneral.Activ,
      },
      {
        numarDosar: 'DAUNA-2026-004',
        idClient: getRequired(clientByCui, 'RO30112244', 'client CUI').idClient,
        idVehicul: getRequired(vehiculByNr, 'CJ-44-NLF', 'vehicul').idVehicul,
        idAsigurator: getRequired(asigByCui, 'RO6291812', 'asigurator')
          .idAsigurator,
        status: StatusGeneral.Activ,
      },
      {
        numarDosar: 'DAUNA-2026-005',
        idClient: getRequired(clientByCui, 'RO50887712', 'client CUI').idClient,
        idVehicul: getRequired(vehiculByNr, 'B-901-CFM', 'vehicul').idVehicul,
        idAsigurator: getRequired(asigByCui, 'RO2884407', 'asigurator')
          .idAsigurator,
        status: StatusGeneral.Activ,
      },
      {
        numarDosar: 'DAUNA-2026-006',
        idClient: getRequired(clientByCnp, '1850822223344', 'client CNP')
          .idClient,
        idVehicul: getRequired(vehiculByNr, 'CT-33-DNG', 'vehicul').idVehicul,
        idAsigurator: getRequired(asigByCui, 'RO9457880', 'asigurator')
          .idAsigurator,
        status: StatusGeneral.Activ,
      },
      {
        numarDosar: 'DAUNA-2026-007',
        idClient: getRequired(clientByCui, 'RO77112233', 'client CUI').idClient,
        idVehicul: getRequired(vehiculByNr, 'B-77-UDL', 'vehicul').idVehicul,
        idAsigurator: getRequired(asigByCui, 'RO1813613', 'asigurator')
          .idAsigurator,
        status: StatusGeneral.Activ,
      },
    ],
  });
  console.log('✅ Dosare de daună inserate.');
}
