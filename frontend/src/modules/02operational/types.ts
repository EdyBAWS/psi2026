// src/modules/02operational/types.ts
// Strict alignment with the logical database schema.

// ─── Core domain entities ──────────────────────────────────────────────────

export interface Vehicul {
  idVehicul: number;
  idClient: number;
  nrInmatriculare: string;
  marca: string;
  model: string;
  an: number;
  serieSasiu: string;
}

export interface DosarDauna {
  idDosar: number;
  idClient: number;
  idVehicul: number;
  idAsigurator: number;
  nrDosar: string;
  dataDeschidere: Date;
  sumaAprobata: number;
  franciza: number;
}

export interface ComandaService {
  idComanda: number;
  idVehicul: number;
  idDosar: number | null;       // null when not an insurance job
  idMecanic: number;
  nrComanda: string;
  dataDeschidere: Date;
  dataFinalizare: Date | null;
  status: StatusComanda;
  totalEstimat: number;         // derived: sum of PozitieComanda rows
}

export interface PozitieComanda {
  idPozitieCmd: number;
  idComanda: number;
  idPiesa: number | null;
  idKit: number | null;
  idManopera: number | null;
  tipPozitie: TipPozitie;
  cantitate: number;
  pretVanzare: number;
  cotaTVA: number;              // e.g. 0.19 for 19%
}

// ─── Lookup / reference entities ──────────────────────────────────────────

export interface Client {
  idClient: number;
  nume: string;
  telefon: string;
}

export interface Asigurator {
  idAsigurator: number;
  denumire: string;
}

export interface Mecanic {
  idMecanic: number;
  nume: string;
  specialitate: string;
}

// ─── Enums / literal unions ────────────────────────────────────────────────

export type StatusComanda =
  | 'Deschis'
  | 'In Lucru'
  | 'Finalizat'
  | 'Facturat'
  | 'Anulat';

export type TipPozitie = 'Piesa' | 'Kit' | 'Manopera';

// ─── UI / form-only types (not persisted) ─────────────────────────────────

/** Draft row while user builds the positions list before saving. */
export interface PozitieComandaDraft {
  _draftId: string;             // local key, replaced by idPozitieCmd on save
  tipPozitie: TipPozitie;
  descriere: string;            // free text label for mock purposes
  cantitate: number;
  pretVanzare: number;
  cotaTVA: number;
}

export interface FormComandaValues {
  idVehicul: number | null;
  idDosar: number | null;
  idMecanic: number | null;
  dataEstimataFinalizare: string; // ISO date string from <input type="date">
  observatii: string;
}