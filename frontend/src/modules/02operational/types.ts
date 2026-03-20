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
  idDosar: number | null;
  idMecanic: number;
  nrComanda: string;
  dataDeschidere: Date;
  dataFinalizare: Date | null;
  status: StatusComanda;
  totalEstimat: number;
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
  cotaTVA: number;
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

export type StatusComanda =
  | 'Deschis'
  | 'In Lucru'
  | 'Finalizat'
  | 'Facturat'
  | 'Anulat';

export type TipPozitie = 'Piesa' | 'Kit' | 'Manopera';

export interface PozitieComandaDraft {
  _draftId: string;
  tipPozitie: TipPozitie;
  descriere: string;
  cantitate: number;
  pretVanzare: number;
  cotaTVA: number;
}
