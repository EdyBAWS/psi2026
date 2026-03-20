// frontend/src/modules/02operational/mockData.ts
import { Vehicul, DosarDauna, ComandaService, PozitieComanda } from './types';

export const mockVehicule: Vehicul[] = [
  {
    idVehicul: 1,
    idClient: 101,
    nrInmatriculare: 'IS-24-SAG',
    marca: 'Dacia',
    model: 'Logan',
    an: 2018,
    serieSasiu: 'UU1YSDL1234567890'
  },
  {
    idVehicul: 2,
    idClient: 102,
    nrInmatriculare: 'B-99-WST',
    marca: 'Skoda',
    model: 'Octavia',
    an: 2021,
    serieSasiu: 'TMBAK7NE4L0123456'
  },
  {
    idVehicul: 3,
    idClient: 101, // Same client owns two cars
    nrInmatriculare: 'IS-05-TST',
    marca: 'Volkswagen',
    model: 'Golf',
    an: 2015,
    serieSasiu: 'WVWZZZAUZFW123456'
  }
];

export const mockDosareDauna: DosarDauna[] = [
  {
    idDosar: 1,
    idClient: 102,
    idVehicul: 2,
    idAsigurator: 501, // e.g., Allianz
    nrDosar: 'DAUNA-2026-001',
    dataDeschidere: '2026-03-15T09:00:00Z',
    sumaAprobata: 3500.00,
    franciza: 500.00
  }
];

export const mockComenzi: ComandaService[] = [
  {
    idComanda: 1,
    idVehicul: 1,
    idDosar: null, // Regular customer pay
    idMecanic: 201,
    nrComanda: 'CMD-00101',
    dataDeschidere: '2026-03-19T08:30:00Z',
    dataFinalizare: null,
    status: 'Deschis',
    totalEstimat: 450.00
  },
  {
    idComanda: 2,
    idVehicul: 2,
    idDosar: 1, // Paid by insurance
    idMecanic: 202,
    nrComanda: 'CMD-00102',
    dataDeschidere: '2026-03-20T10:15:00Z',
    dataFinalizare: null,
    status: 'InLucru',
    totalEstimat: 3100.00
  }
];

export const mockPozitii: PozitieComanda[] = [
  // Items for CMD-00101 (Revizie Dacia)
  {
    idPozitieCmd: 1,
    idComanda: 1,
    idPiesa: 301, // Ulei motor
    idKit: null,
    idManopera: null,
    tipPozitie: 'Piesa',
    cantitate: 4,
    pretVanzare: 50.00,
    cotaTVA: 19
  },
  {
    idPozitieCmd: 2,
    idComanda: 1,
    idPiesa: null,
    idKit: null,
    idManopera: 401, // Manopera revizie
    tipPozitie: 'Manopera',
    cantitate: 1.5,
    pretVanzare: 150.00, // 150/ora
    cotaTVA: 19
  },
  // Items for CMD-00102 (Dauna Skoda)
  {
    idPozitieCmd: 3,
    idComanda: 2,
    idPiesa: 305, // Bara fata
    idKit: null,
    idManopera: null,
    tipPozitie: 'Piesa',
    cantitate: 1,
    pretVanzare: 1800.00,
    cotaTVA: 19
  }
];