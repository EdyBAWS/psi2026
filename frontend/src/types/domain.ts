// `domain.ts` conține nucleul comun de tipuri folosite de mai multe module.
// Scopul lui nu este să înlocuiască modelele bogate din operațional,
// ci să ofere o bază unitară pentru entitățile care se repetă în aplicație.

export type TipClientCrud = 'PF' | 'PJ';
export type TipClientOperational = 'Persoana Fizica' | 'Persoana Juridica' | 'Flota';
export type TipAngajatCore = 'Manager' | 'Mecanic' | 'Receptioner';

export interface ContactCore {
  telefon: string;
  email: string;
}

export interface ClientCoreBase extends ContactCore {
  idClient: number;
}

export interface AsiguratorCore {
  idAsigurator: number;
  denumire: string;
  CUI: string;
  telefon: string;
  email?: string;
}

export interface AngajatCore extends ContactCore {
  idAngajat: number;
  nume: string;
  prenume: string;
  CNP: string;
  tipAngajat: TipAngajatCore;
}

export const tipClientCrudLaOperational: Record<TipClientCrud, TipClientOperational> = {
  PF: 'Persoana Fizica',
  PJ: 'Persoana Juridica',
};

export const tipClientOperationalLaCrud: Partial<Record<TipClientOperational, TipClientCrud>> = {
  'Persoana Fizica': 'PF',
  'Persoana Juridica': 'PJ',
};
