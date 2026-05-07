// mock/entitati.ts

import type {
  Angajat as AngajatEntitate,
  Asigurator as AsiguratorEntitate,
  Client as ClientEntitate,
  Vehicul as VehiculEntitate,
} from "../types/entitati";

// --- CLIENȚI ---
export const clientiEntitateMock: ClientEntitate[] = [
  {
    idClient: 1,
    tipClient: "PF",
    status: "Activ",
    nume: "Popescu",
    prenume: "Ion",
    telefon: "0722 445 781",
    email: "ion.popescu@gmail.com",
    adresa: "Str. Păcurari 18, Iași",
    soldDebitor: 0,
    CNP: "1800101223344",
    serieCI: "MX123456",
  },
  {
    idClient: 2,
    tipClient: "PJ",
    status: "Activ",
    nume: "SC Auto Fleet SRL",
    telefon: "021 440 55 90",
    email: "service@autofleet.ro",
    adresa: "Bd. Timișoara 101, București",
    soldDebitor: 1550,
    CUI: "RO9876543",
    IBAN: "RO49AAAA1B31007593840000",
    nrRegCom: "J40/1234/2018",
  },
  {
    idClient: 3,
    tipClient: "PF",
    status: "Activ",
    nume: "Marinescu",
    prenume: "Ana",
    telefon: "0744 118 620",
    email: "ana.marinescu@yahoo.com",
    adresa: "Str. Observatorului 74, Cluj-Napoca",
    soldDebitor: 0,
    CNP: "2870306123456",
    serieCI: "CJ654321",
  },
  {
    idClient: 4,
    tipClient: "PJ",
    status: "Activ",
    nume: "Tehnoparts Solutions",
    telefon: "031 808 44 12",
    email: "office@tehnoparts.ro",
    adresa: "Șos. Industriilor 22, București",
    soldDebitor: 4200,
    CUI: "RO44556677",
    IBAN: "RO95INGB0000999912345678",
    nrRegCom: "J40/7788/2016",
  },
  {
    idClient: 5,
    tipClient: "PF",
    status: "Inactiv",
    nume: "Ilie",
    prenume: "Marius",
    telefon: "0733 905 118",
    email: "marius.ilie@gmail.com",
    adresa: "Str. Romană 11, Piatra-Neamț",
    soldDebitor: 380,
    CNP: "1900714223345",
    serieCI: "NT778899",
  }
];

// --- ANGAJAȚI ---
export const angajatiEntitateMock: AngajatEntitate[] = [
  {
    idAngajat: 1,
    status: "Activ",
    nume: "Ionescu",
    prenume: "Mihai",
    CNP: "1820101223344",
    telefon: "0721 100 201",
    email: "mihai.ionescu@serviceautog.ro",
    tipAngajat: "Mecanic",
    specializare: "Mecanică generală",
    costOrar: 170,
  },
  {
    idAngajat: 2,
    status: "Activ",
    nume: "Popa",
    prenume: "Andrei",
    CNP: "1840615223344",
    telefon: "0721 100 202",
    email: "andrei.popa@serviceautog.ro",
    tipAngajat: "Mecanic",
    specializare: "Tinichigerie și vopsitorie",
    costOrar: 210,
  },
  {
    idAngajat: 3,
    status: "Activ",
    nume: "Marin",
    prenume: "Elena",
    CNP: "2860226223344",
    telefon: "0721 100 203",
    email: "elena.marin@serviceautog.ro",
    tipAngajat: "Receptioner",
    nrBirou: "R-02",
    tura: "Dimineață",
  }
];

// --- ASIGURATORI ---
export const asiguratoriEntitateMock: AsiguratorEntitate[] = [
  {
    idAsigurator: 1,
    status: "Activ",
    denumire: "Allianz-Țiriac Asigurări",
    CUI: "RO6120740",
    telefon: "021 208 22 22",
  },
  {
    idAsigurator: 2,
    status: "Activ",
    denumire: "Groupama Asigurări",
    CUI: "RO6291812",
    telefon: "021 302 92 00",
  },
  {
    idAsigurator: 3,
    status: "Activ",
    denumire: "Omniasig Vienna Insurance Group",
    CUI: "RO5587260",
    telefon: "021 405 74 20",
  }
];

// --- VEHICULE (MOCK NOU ADĂUGAT) ---
export const vehiculeEntitateMock: VehiculEntitate[] = [
  {
    idVehicul: 1,
    nrInmatriculare: "IS 24 ABC",
    marca: "Volkswagen",
    model: "Passat B8",
    anFabricatie: 2019,
    vin: "WVWZZZ3CZJE123456",
    idClient: 1, // Popescu Ion
    status: "Activ",
  },
  {
    idVehicul: 2,
    nrInmatriculare: "B 101 FLT",
    marca: "Skoda",
    model: "Octavia",
    anFabricatie: 2021,
    vin: "TMBJG7NE0M0123456",
    idClient: 2, // SC Auto Fleet SRL
    status: "Activ",
  },
  {
    idVehicul: 3,
    nrInmatriculare: "CJ 55 ANA",
    marca: "BMW",
    model: "Seria 3 G20",
    anFabricatie: 2020,
    vin: "WBA5L31080FL12345",
    idClient: 3, // Marinescu Ana
    status: "Activ",
  },
  {
    idVehicul: 4,
    nrInmatriculare: "NT 07 MAR",
    marca: "Dacia",
    model: "Duster",
    anFabricatie: 2018,
    vin: "UU1HSDCW662123456",
    idClient: 5, // Ilie Marius
    status: "Inactiv",
  },
  {
    idVehicul: 5,
    nrInmatriculare: "IS 99 XYZ",
    marca: "Audi",
    model: "A6 C8",
    anFabricatie: 2022,
    vin: "WAUZZZF20NN123456",
    idClient: 1, // Popescu Ion (a doua mașină)
    status: "Activ",
  }
];