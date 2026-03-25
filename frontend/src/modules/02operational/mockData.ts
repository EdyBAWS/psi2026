// Mock data-ul permite rularea completă a modulului fără API.
// În plus, menține relațiile dintre comenzi, dosare și poziții suficient de
// realiste pentru a testa fluxul operațional cap-coadă.
import type {
  Asigurator,
  ComandaService,
  DosarDauna,
  Mecanic,
  PozitieComanda,
  Vehicul,
} from './types';

// Totalul estimat este derivat din pozițiile unei comenzi, nu introdus manual.
// Formula folosește și TVA-ul pentru a reflecta valoarea totală afișată în UI.
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

// Vehiculele sunt baza fluxului: de la ele pornește deschiderea unei comenzi.
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

// Asiguratorii și mecanicii sunt folosiți în dropdown-uri.
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

// Pozițiile sunt împărțite pe comenzi pentru ca totalul fiecărei comenzi
// să poată fi calculat independent și verificat ușor.
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

// Dosarele sunt folosite când o comandă intră în fluxul de asigurare.
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

// Comenzile finale folosesc totalul derivat din pozițiile aferente.
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
