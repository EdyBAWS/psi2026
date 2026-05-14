export interface ComandaFacturabila {
  idComanda: number;
  nrComanda: string;
  dataComanda: string;
  idVehicul: number;
  status: string;
  totalEstimat: number;
  client: string;
  vehicul: string;
  idClient?: number;
}

export interface LinieFactura {
  idLinie: number;
  idPiesa?: number;
  idKit?: number;
  idManopera?: number;
  tip?: "Piesa" | "Kit" | "Manopera";
  denumire: string;
  cantitate: number;
  pretUnitar: number;
}

export interface Factura {
  idFactura: number;
  idClient: number;
  idComanda?: number | null;
  idVehicul?: number | null;
  idAsigurator?: number | null;
  numeAsigurator?: string | null;
  tipPlata?: 'client' | 'asigurator';
  numar: string;
  dataEmitere: string;
  dataScadenta: string;
  client: string;
  totalInitial: number;
  restDePlata: number;
  status: "Emisa" | "Achitata partial" | "Achitata";
}

export interface Incasare {
  idIncasare: number;
  idFactura: number;
  dataIncasare: string;
  suma: number;
  modalitate: "Transfer Bancar" | "Cash" | "POS";
  client?: string;
  tipPlatitor?: 'client' | 'asigurator';
  numeAsigurator?: string | null;
  numeBeneficiar?: string | null;
  alocari?: any[];
  referinta?: string;
}

export interface Notificare {
  id: number;
  data: string;
  ora?: string;
  mesaj: string;
  paginaDestinatie?: string;
  sursaModul?: string;
  textActiune?: string;
  tip: "Info" | "Avertizare" | "Succes";
  citit?: boolean;
  arhivata?: boolean;
  stearsa?: boolean;
  metadata?: Record<string, any>;
}

export interface TranzactieIstoric {
  id: string;
  dataOra: string;
  tipOperatiune:
    | "Facturare Comandă"
    | "Penalizare"
    | "Storno"
    | "Discount Extra";
  numarDocument: string;
  client: string;
  valoare: number;
  utilizator: string;
  detalii: string;
}

