// Tipurile din acest fișier descriu modelul domeniului operațional.
// Am păstrat nucleul schemei inițiale și am adăugat câmpuri uzuale pentru
// recepția auto, astfel încât fluxul să semene mai mult cu un service real.

export type TipClient = 'Persoana Fizica' | 'Persoana Juridica' | 'Flota';
export type TipPlata = 'Client Direct' | 'Asigurare' | 'Flota';
export type PrioritateComanda = 'Scazuta' | 'Normala' | 'Ridicata' | 'Urgenta';
export type NivelCombustibil = 'Rezerva' | '1/4' | '1/2' | '3/4' | 'Plin';
export type TipPolita = 'RCA' | 'CASCO';
export type StatusDosar = 'Deschis' | 'In analiza' | 'Aprobat partial' | 'Aprobat' | 'Respins';
export type TipPozitie = 'Piesa' | 'Kit' | 'Manopera';
export type UnitateMasura = 'buc' | 'set' | 'ore' | 'kit';

export type StatusComanda =
  | 'In asteptare diagnoza'
  | 'Asteapta aprobare client'
  | 'Asteapta piese'
  | 'In Lucru'
  | 'Gata de livrare'
  | 'Livrat'
  | 'Facturat'
  | 'Anulat';

export interface Client {
  idClient: number;
  nume: string;
  telefon: string;
  email: string;
  tipClient: TipClient;
  denumireCompanie: string | null;
}

export interface Vehicul {
  idVehicul: number;
  idClient: number;
  nrInmatriculare: string;
  marca: string;
  model: string;
  an: number;
  serieSasiu: string;
}

// Un dosar de daună leagă vehiculul de asigurator și de starea aprobării.
export interface DosarDauna {
  idDosar: number;
  idClient: number;
  idVehicul: number;
  idAsigurator: number;
  nrDosar: string;
  numarReferintaAsigurator: string;
  tipPolita: TipPolita;
  dataDeschidere: Date;
  dataConstatare: Date;
  sumaAprobata: number;
  franciza: number;
  statusAprobare: StatusDosar;
  inspectorDauna: string;
  observatiiDauna: string;
}

// Comanda de service păstrează atât câmpurile esențiale din schema inițială,
// cât și detaliile de recepție necesare în lucru de zi cu zi.
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
  kilometrajPreluare: number;
  nivelCombustibil: NivelCombustibil;
  simptomeReclamate: string;
  observatiiPreluare: string;
  observatiiCaroserie: string;
  accesoriiPredate: string[];
  termenPromis: Date;
  prioritate: PrioritateComanda;
  tipPlata: TipPlata;
}

// Fiecare rând din comandă poate veni din catalog și conține și detalii utile
// în operațional, nu doar prețul și TVA-ul.
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

export interface Asigurator {
  idAsigurator: number;
  denumire: string;
}

export interface Mecanic {
  idMecanic: number;
  nume: string;
  specialitate: string;
}

export interface CatalogPiesa {
  idPiesa: number;
  cod: string;
  denumire: string;
  unitateMasura: UnitateMasura;
  pretVanzare: number;
  cotaTVA: number;
  disponibilitateStoc: boolean;
}

export interface CatalogKit {
  idKit: number;
  cod: string;
  denumire: string;
  unitateMasura: UnitateMasura;
  pretVanzare: number;
  cotaTVA: number;
  disponibilitateStoc: boolean;
}

export interface CatalogManopera {
  idManopera: number;
  cod: string;
  denumire: string;
  unitateMasura: 'ore';
  tarif: number;
  cotaTVA: number;
}

// Varianta "draft" este folosită doar în formular, înainte ca poziția
// să fie transformată într-o înregistrare reală de tip `PozitieComanda`.
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
