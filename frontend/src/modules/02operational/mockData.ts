import type {
  Asigurator,
  ComandaService,
  DosarDauna,
  Mecanic,
  PozitieComanda,
  Vehicul,
} from './types';

const calculeazaTotalEstimat = (pozitii: PozitieComanda[]) =>
  Number(
    pozitii
      .reduce(
        (total, pozitie) =>
          total + pozitie.cantitate * pozitie.pretVanzare * (1 + pozitie.cotaTVA / 100),
        0,
      )
      .toFixed(2),
  );

export const mockVehicule: Vehicul[] = [
  {
    idVehicul: 1,
    idClient: 1001,
    nrInmatriculare: 'IS-09-SAG',
    marca: 'Dacia',
    model: 'Logan',
    an: 2018,
    serieSasiu: 'UU1LSDL4H60512345',
  },
  {
    idVehicul: 2,
    idClient: 1002,
    nrInmatriculare: 'B-54-GAR',
    marca: 'Skoda',
    model: 'Octavia',
    an: 2021,
    serieSasiu: 'TMBJR7NX1MY102468',
  },
  {
    idVehicul: 3,
    idClient: 1003,
    nrInmatriculare: 'CJ-12-AUT',
    marca: 'Volkswagen',
    model: 'Golf',
    an: 2015,
    serieSasiu: 'WVWZZZAUZFW223344',
  },
];

export const mockAsiguratori: Asigurator[] = [
  {
    idAsigurator: 501,
    denumire: 'Allianz-Tiriac',
  },
  {
    idAsigurator: 502,
    denumire: 'Groupama',
  },
  {
    idAsigurator: 503,
    denumire: 'Omniasig',
  },
];

export const mockMecanici: Mecanic[] = [
  {
    idMecanic: 201,
    nume: 'Mihai Ionescu',
    specialitate: 'Mecanica generala',
  },
  {
    idMecanic: 202,
    nume: 'Andrei Popa',
    specialitate: 'Tinichigerie',
  },
  {
    idMecanic: 203,
    nume: 'Cristian Pavel',
    specialitate: 'Diagnoza si electrica',
  },
];

const pozitiiComanda1: PozitieComanda[] = [
  {
    idPozitieCmd: 1,
    idComanda: 1,
    idPiesa: 301,
    idKit: null,
    idManopera: null,
    tipPozitie: 'Piesa',
    cantitate: 4,
    pretVanzare: 58,
    cotaTVA: 19,
  },
  {
    idPozitieCmd: 2,
    idComanda: 1,
    idPiesa: null,
    idKit: null,
    idManopera: 401,
    tipPozitie: 'Manopera',
    cantitate: 1.2,
    pretVanzare: 170,
    cotaTVA: 19,
  },
  {
    idPozitieCmd: 3,
    idComanda: 1,
    idPiesa: 302,
    idKit: null,
    idManopera: null,
    tipPozitie: 'Piesa',
    cantitate: 1,
    pretVanzare: 95,
    cotaTVA: 19,
  },
];

const pozitiiComanda2: PozitieComanda[] = [
  {
    idPozitieCmd: 4,
    idComanda: 2,
    idPiesa: 305,
    idKit: null,
    idManopera: null,
    tipPozitie: 'Piesa',
    cantitate: 1,
    pretVanzare: 1820,
    cotaTVA: 19,
  },
  {
    idPozitieCmd: 5,
    idComanda: 2,
    idPiesa: 306,
    idKit: null,
    idManopera: null,
    tipPozitie: 'Piesa',
    cantitate: 1,
    pretVanzare: 640,
    cotaTVA: 19,
  },
  {
    idPozitieCmd: 6,
    idComanda: 2,
    idPiesa: null,
    idKit: null,
    idManopera: 402,
    tipPozitie: 'Manopera',
    cantitate: 6,
    pretVanzare: 210,
    cotaTVA: 19,
  },
];

export const mockDosareDauna: DosarDauna[] = [
  {
    idDosar: 1,
    idClient: 1002,
    idVehicul: 2,
    idAsigurator: 501,
    nrDosar: 'DAUNA-2026-001',
    dataDeschidere: new Date('2026-03-14T09:00:00'),
    sumaAprobata: 5200,
    franciza: 600,
  },
  {
    idDosar: 2,
    idClient: 1003,
    idVehicul: 3,
    idAsigurator: 503,
    nrDosar: 'DAUNA-2026-002',
    dataDeschidere: new Date('2026-03-18T11:30:00'),
    sumaAprobata: 2800,
    franciza: 300,
  },
];

export const mockPozitii: PozitieComanda[] = [...pozitiiComanda1, ...pozitiiComanda2];

export const mockComenzi: ComandaService[] = [
  {
    idComanda: 1,
    idVehicul: 1,
    idDosar: null,
    idMecanic: 201,
    nrComanda: 'CMD-2026-001',
    dataDeschidere: new Date('2026-03-19T08:30:00'),
    dataFinalizare: null,
    status: 'Deschis',
    totalEstimat: calculeazaTotalEstimat(pozitiiComanda1),
  },
  {
    idComanda: 2,
    idVehicul: 2,
    idDosar: 1,
    idMecanic: 202,
    nrComanda: 'CMD-2026-002',
    dataDeschidere: new Date('2026-03-20T10:15:00'),
    dataFinalizare: null,
    status: 'In Lucru',
    totalEstimat: calculeazaTotalEstimat(pozitiiComanda2),
  },
];
