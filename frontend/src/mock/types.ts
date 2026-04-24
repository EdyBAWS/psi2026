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
}

export interface LinieFacturaMock {
  idLinie: number;
  tip: "Piesă" | "Kit" | "Manoperă";
  denumire: string;
  cantitate: number;
  pretUnitar: number;
}

export interface FacturaMock {
  idFactura: number;
  idClient: number;
  idComanda: number | null;
  idVehicul: number | null;
  numar: string;
  dataEmitere: string;
  dataScadenta: string;
  client: string;
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
