import type {
  AngajatCore,
  AsiguratorCore,
  ClientCoreBase,
  TipClientOperational,
} from '../../types/domain';

// Tipurile din acest fișier descriu modelul domeniului operațional.
// Am păstrat nucleul schemei inițiale și am adăugat câmpuri uzuale pentru
// recepția auto, astfel încât fluxul să semene mai mult cu un service real.

// Aceste tipuri simple sunt folosite ca liste de valori permise.
// Avantajul pentru TypeScript este că prindem mai repede greșeli de scriere
// și știm exact ce opțiuni poate avea un câmp din formular sau din datele salvate.
export type TipClient = TipClientOperational;
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

// `Client` este entitatea care deține vehiculul.
// În UI o folosim pentru a afișa rapid cine aduce mașina în service
// și pentru a decide din start anumite valori, cum ar fi tipul de plată.
export interface Client extends ClientCoreBase {
  nume: string;
  tipClient: TipClient;
  denumireCompanie: string | null;
}

// `Vehicul` rămâne apropiat de schema de bază.
// În restul modulului el este "punctul de plecare" pentru o comandă nouă.
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
// Acesta este un tip "persistat", adică reprezintă obiectul final care ar putea
// fi salvat într-o bază de date sau trimis către backend.
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
// Practic, acesta este obiectul principal al modulului operațional.
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
// Acesta este tipul "real" al unei poziții după salvare.
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

export type Asigurator = Pick<AsiguratorCore, 'idAsigurator' | 'denumire'>;

export interface Mecanic extends Pick<AngajatCore, 'nume'> {
  idMecanic: number;
  specialitate: string;
}

// Catalogele sunt sursa din care utilizatorul alege articole pentru deviz.
// Separarea lor pe tipuri ne ajută să controlăm mai clar ce câmpuri sunt disponibile
// pentru piese, kituri sau manoperă.
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
// Diferența importantă pentru un începător:
// - `PozitieComandaDraft` există doar cât timp edităm formularul
// - `PozitieComanda` este forma finală, gata de salvat
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
