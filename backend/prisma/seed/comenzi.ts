import { PrismaClient, StatusReparatie } from '@prisma/client';
import { getRequired } from './utils';

export async function seedComenzi(prisma: PrismaClient) {
  console.log('📝 Populăm comenzile...');

  const angajati = await prisma.angajat.findMany();
  const dosare = await prisma.dosarDauna.findMany();

  const angajatByCnp = new Map(angajati.map((a) => [a.CNP, a]));
  const dosarByNumar = new Map(dosare.map((d) => [d.numarDosar, d]));

  const mecaniciByCnp = new Map(
    (await prisma.angajat.findMany({ where: { tipAngajat: 'Mecanic' } })).map(a => [a.CNP, a])
  );

  const comenziData = [
    {
      numarComanda: 'CMD-2026-002',
      idDosar: getRequired(dosarByNumar, 'DAUNA-2026-001', 'dosar').idDosar,
      idAngajat: getRequired(angajatByCnp, '2860226223344', 'receptioner').idAngajat,
      dataPreconizata: new Date('2026-05-15T16:30:00'),
      status: StatusReparatie.IN_ASTEPTARE_DIAGNOZA,
      idMecanici: ['1840615223344', '1820101223344']
    },
    {
      numarComanda: 'CMD-2026-003',
      idDosar: getRequired(dosarByNumar, 'DAUNA-2026-002', 'dosar').idDosar,
      idAngajat: getRequired(angajatByCnp, '2860226223344', 'receptioner').idAngajat,
      dataPreconizata: new Date('2026-05-14T12:00:00'),
      status: StatusReparatie.IN_ASTEPTARE_DIAGNOZA,
      idMecanici: ['2890305223344']
    },
    {
      numarComanda: 'CMD-2026-004',
      idDosar: getRequired(dosarByNumar, 'DAUNA-2026-003', 'dosar').idDosar,
      idAngajat: getRequired(angajatByCnp, '2920707223344', 'receptioner').idAngajat,
      dataPreconizata: new Date('2026-05-11T17:00:00'),
      status: StatusReparatie.IN_ASTEPTARE_DIAGNOZA,
      idMecanici: ['2890305223344', '1791215223344']
    },
    {
      numarComanda: 'CMD-2026-005',
      idDosar: getRequired(dosarByNumar, 'DAUNA-2026-005', 'dosar').idDosar,
      idAngajat: getRequired(angajatByCnp, '2940909223344', 'receptioner').idAngajat,
      dataPreconizata: new Date('2026-05-16T17:00:00'),
      status: StatusReparatie.IN_ASTEPTARE_DIAGNOZA,
      idMecanici: ['1791215223344']
    },
    {
      numarComanda: 'CMD-2026-007',
      idDosar: getRequired(dosarByNumar, 'DAUNA-2026-006', 'dosar').idDosar,
      idAngajat: getRequired(angajatByCnp, '2860226223344', 'receptioner').idAngajat,
      dataPreconizata: new Date('2026-05-18T13:30:00'),
      status: StatusReparatie.IN_ASTEPTARE_DIAGNOZA,
      idMecanici: ['1770501223344', '1840615223344']
    },
    {
      numarComanda: 'CMD-2026-008',
      idDosar: getRequired(dosarByNumar, 'DAUNA-2026-007', 'dosar').idDosar,
      idAngajat: getRequired(angajatByCnp, '2920707223344', 'receptioner').idAngajat,
      dataPreconizata: new Date('2026-05-19T09:30:00'),
      status: StatusReparatie.IN_ASTEPTARE_DIAGNOZA,
      idMecanici: ['1791215223344', '1820101223344']
    },
  ];

  for (const c of comenziData) {
    const { idMecanici, ...rest } = c;
    await prisma.comanda.create({
      data: {
        ...rest,
        mecanici: {
          connect: idMecanici.map(cnp => ({ idAngajat: getRequired(mecaniciByCnp, cnp, 'mecanic').idAngajat }))
        }
      }
    });
  }
  console.log('✅ Comenzi inserate.');
}
