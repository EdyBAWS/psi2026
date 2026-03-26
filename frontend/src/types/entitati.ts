// Aceste tipuri sunt modelul "simplu" folosit de modulele de entități.
// Spre deosebire de `02operational/types.ts`, aici avem structuri mai compacte,
// potrivite pentru ecrane CRUD locale.
export interface Client {
  idClient: number;
  tipClient: 'PF' | 'PJ';
  telefon: string;
  email: string;
  adresa: string;
  soldDebitor: number;
  CNP?: string;
  serieCI?: string;
  CUI?: string;
  IBAN?: string;
  nrRegCom?: string;
}

// `Angajat` grupează câmpurile comune și câteva câmpuri opționale
// care depind de rolul ales în formular.
export interface Angajat {
  idAngajat: number;
  nume: string;
  prenume: string;
  CNP: string;
  telefon: string;
  email: string;
  tipAngajat: 'Manager' | 'Mecanic' | 'Receptioner'; 
  departament?: string;
  sporConducere?: number;
  specializare?: string;
  costOrar?: number;
  nrBirou?: string;
  tura?: string;
}

// `Asigurator` este păstrat intenționat minimal în această zonă a aplicației.
// Detaliile mai bogate de business apar în modulul operațional, atunci când este nevoie.
export interface Asigurator {
  idAsigurator: number;
  denumire: string;
  CUI: string;
  telefon: string;
}
