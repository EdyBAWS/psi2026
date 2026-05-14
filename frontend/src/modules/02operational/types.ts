import type { ClientCoreBase, TipClientOperational } from "../../types/domain";

export type TipClient = TipClientOperational;
export type TipPlata = "Client Direct" | "Asigurare" | "Flota";
export type PrioritateComanda = "Scazuta" | "Normala" | "Ridicata" | "Urgenta";
export type NivelCombustibil = "Rezerva" | "1/4" | "1/2" | "3/4" | "Plin";
export type TipPolita = "RCA" | "CASCO";
export type StatusDosar = "Deschis" | "In analiza" | "Aprobat partial" | "Aprobat" | "Respins";
export type TipPozitie = "Piesa" | "Kit" | "Manopera";
export type UnitateMasura = "buc" | "set" | "ore" | "kit";

// Cele 7 statusuri exacte și fixe:
export type StatusComanda = "In asteptare diagnoza" | "Asteapta aprobare client" | "In asteptare piese" | "In lucru" | "Finalizat" | "Facturat" | "Anulat";

export interface Client extends ClientCoreBase {
  nume: string;
  tipClient: TipClient;
  denumireCompanie: string | null;
}

export interface Vehicul {
  idVehicul: number;
  idClient: number;
  numarInmatriculare: string; 
  marca: string;
  model: string;
  an: number;
  vin: string; 
}

export interface DosarDauna {
  idDosar: number;
  idClient: number;
  idVehicul: number;
  idAsigurator?: number | null;
  numarDosar: string;
  status?: "Activ" | "Inactiv";
  numarReferintaAsigurator?: string;
  tipPolita?: TipPolita;
  dataDeschidere?: Date;
  dataConstatare?: Date;
  sumaAprobata?: number;
  franciza?: number;
  statusAprobare?: StatusDosar;
  idInspector?: number | null;
  inspectorDauna?: string;
  observatiiDauna?: string;
}

export interface ComandaService {
  idComanda: number;
  idVehicul: number;
  idDosar: number | null;
  idMecanic?: number | null;
  idMecanici?: number[];
  mecanici?: Mecanic[];
  numarComanda: string;
  dataDeschidere?: Date;
  dataFinalizare?: Date | null;
  status?: StatusComanda;
  totalEstimat?: number;
  kilometrajPreluare?: number;
  nivelCombustibil?: NivelCombustibil;
  simptomeReclamate?: string;
  observatiiPreluare?: string;
  observatiiCaroserie?: string;
  accesoriiPredate?: string[];
  termenPromis?: Date;
  prioritate?: PrioritateComanda;
  tipPlata?: TipPlata;
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

export interface PozitieComanda {
  idPozitieCmd: number;
  idComanda: number;
  idPiesa: number | null;
  idKit: number | null;
  idManopera: number | null;
  tipPozitie: TipPozitie;
  codArticol: string;
  descriere: string;
  unitateMasura: UnitateMasura;
  cantitate: number;
  pretVanzare: number;
  discountProcent: number;
  cotaTVA: number;
  disponibilitateStoc: boolean;
  observatiiPozitie: string;
}

export interface CatalogPiesa {
  idPiesa: number;
  codPiesa: string;
  denumire: string;
  pretBaza: number;
  unitateMasura: UnitateMasura;
  disponibilitateStoc: boolean;
  cotaTVA: number;
}

export interface CatalogManopera {
  idManopera: number;
  codManopera: string;
  denumire: string;
  durataStd: number;
  pretOra: number;
  cotaTVA: number;
}

export interface CatalogKit {
  idKit: number;
  cod: string;
  denumire: string;
  unitateMasura: UnitateMasura;
  pretVanzare: number;
  cotaTVA: number;
  disponibilitateStoc: boolean;
  piese?: any[];
}

export interface PozitieComandaDraft {
  _draftId: string;
  tipPozitie: TipPozitie;
  catalogId: number | null;
  codArticol: string;
  descriere: string;
  unitateMasura: UnitateMasura;
  cantitate: number;
  pretVanzare: number;
  discountProcent: number;
  cotaTVA: number;
  disponibilitateStoc: boolean;
  observatiiPozitie: string;
}
