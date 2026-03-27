import type { Client, Angajat, Asigurator } from '../types/entitati';

export const clientiEntitateMock: Client[] = [
  {
    idClient: 1,
    tipClient: 'PJ',
    status: 'Activ',
    nume: 'Auto Fleet Solutions SRL',
    telefon: '0722111222',
    email: 'office@autofleet.ro',
    adresa: 'Str. Industriei 10, Iasi',
    soldDebitor: 1500,
    CUI: 'RO123456',
    IBAN: 'RO12INGB0000111122223333',
    nrRegCom: 'J22/100/2020'
  },
  {
    idClient: 2,
    tipClient: 'PF',
    status: 'Activ',
    nume: 'Popescu',
    prenume: 'Ion',
    telefon: '0744555666',
    email: 'ion.popescu@gmail.com',
    adresa: 'Str. Primaverii 5, Vaslui',
    soldDebitor: 0,
    CNP: '1800101223344',
    serieCI: 'VS123456'
  }
];

export const angajatiEntitateMock: Angajat[] = [
  {
    idAngajat: 1,
    status: 'Activ',
    nume: 'Ionescu',
    prenume: 'Andrei',
    CNP: '1900101223344',
    telefon: '0711222333',
    email: 'andrei.mecanic@service.ro',
    tipAngajat: 'Mecanic',
    specializare: 'Diagnoza Auto',
    costOrar: 150
  }
];

export const asiguratoriEntitateMock: Asigurator[] = [
  {
    idAsigurator: 1,
    status: 'Activ',
    denumire: 'Allianz Tiriac',
    CUI: 'RO998877',
    telefon: '0219999'
  }
];