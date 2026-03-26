export interface Client {
  idClient: number;
  tipClient: 'PF' | 'PJ';
  status: 'Activ' | 'Inactiv';
  nume: string;
  prenume?: string;
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

export interface Angajat {
  idAngajat: number;
  status: 'Activ' | 'Inactiv';
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

export interface Asigurator {
  idAsigurator: number;
  status: 'Activ' | 'Inactiv';
  denumire: string;
  CUI: string;
  telefon: string;
}