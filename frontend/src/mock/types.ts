// Tipurile din acest fișier descriu obiectele demo comune dintre module.
// Ele nu înlocuiesc modelele de business din operațional, ci doar oferă
// o "limbă comună" pentru facturare, încasări și notificări.

export interface ComandaFacturabilaMock {
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

export interface LinieFacturaMock {
  idLinie: number;
  idPiesa?: number;
  idKit?: number;
  tip?: "Piesa" | "Kit" | "Manopera";
  denumire: string;
  cantitate: number;
  pretUnitar: number;
}

export interface FacturaMock {
  idFactura: number;
  idClient: number;
  idComanda: number | null;
  idVehicul: number | null;
  // Campuri pentru plata prin asigurator (Varianta A)
  idAsigurator?: number | null;
  numeAsigurator?: string | null;
  tipPlata?: 'client' | 'asigurator';
  numar: string;
  dataEmitere: string;
  dataScadenta: string;
  client: string;  // intotdeauna beneficiarul (proprietarul masinii)
  totalInitial: number;
  restDePlata: number;
  status: "Emisa" | "Achitata partial" | "Achitata";
}

export interface IncasareMock {
  idIncasare: number;
  idFactura: number;
  dataIncasare: string;
  suma: number;
  modalitate: "Transfer Bancar" | "Cash" | "POS";
}

export interface NotificareMock {
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

export interface TranzactieIstoricMock {
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
