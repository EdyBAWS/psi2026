// Tipurile din acest fișier descriu modelul domeniului operațional.
// Ele urmăresc schema logică din proiect și sunt folosite atât în mock data,
// cât și în componentele care afișează sau modifică informațiile.
export interface Vehicul {
  idVehicul: number;
  idClient: number;
  nrInmatriculare: string;
  marca: string;
  model: string;
  an: number;
  serieSasiu: string;
}

// Un dosar de daună leagă un vehicul de un asigurator și de valorile aprobate
// pentru reparația acoperită prin asigurare.
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

// Comanda de service este "capul" operațiunii: ce vehicul intră în service,
// cine lucrează pe el și care este totalul estimat.
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

// Fiecare rând din comandă reprezintă o piesă, un kit sau o manoperă.
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

// Entități ajutătoare pentru dropdown-uri și afișare în UI.
export interface Asigurator {
  idAsigurator: number;
  denumire: string;
}

export interface Mecanic {
  idMecanic: number;
  nume: string;
  specialitate: string;
}

// Valorile posibile pentru status și tip sunt separate în literal unions
// pentru a reduce erorile de scriere în restul aplicației.
export type StatusComanda =
  | 'Deschis'
  | 'In Lucru'
  | 'Finalizat'
  | 'Facturat'
  | 'Anulat';

export type TipPozitie = 'Piesa' | 'Kit' | 'Manopera';

// Varianta "draft" este folosită doar în formular, înainte ca poziția
// să fie transformată într-o înregistrare reală de tip `PozitieComanda`.
export interface PozitieComandaDraft {
  _draftId: string;
  tipPozitie: TipPozitie;
  descriere: string;
  cantitate: number;
  pretVanzare: number;
  cotaTVA: number;
}
