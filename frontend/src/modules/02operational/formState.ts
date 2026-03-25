// Aici ținem starea de UI care nu este încă "persistată", dar este necesară
// pentru formularele din modulul operațional.
// Pe scurt:
// - tipurile din `types.ts` descriu obiectele finale ale domeniului
// - tipurile din acest fișier descriu valorile intermediare din formular
import type {
  NivelCombustibil,
  PozitieComandaDraft,
  PrioritateComanda,
  StatusDosar,
  TipPlata,
  TipPolita,
} from './types';

// Această structură descrie doar starea vizibilă în formularul de daună.
// De exemplu, datele sunt păstrate ca string pentru input-uri HTML de tip `date`,
// iar sumele pot fi temporar goale până când utilizatorul le completează.
export interface StareDosarAsigurare {
  mod: 'existent' | 'nou';
  idDosarSelectat: number | null;
  idAsigurator: number | null;
  numarReferintaAsigurator: string;
  tipPolita: TipPolita;
  dataConstatare: string;
  sumaAprobata: number | '';
  franciza: number | '';
  statusAprobare: StatusDosar;
  inspectorDauna: string;
  observatiiDauna: string;
}

// Aceasta este starea pentru datele de recepție ale comenzii.
// Din nou, unele câmpuri sunt mai permisive decât în datele finale,
// pentru că formularul trebuie să poată porni "gol".
export interface DetaliiPreluareForm {
  kilometrajPreluare: number | '';
  nivelCombustibil: NivelCombustibil;
  simptomeReclamate: string;
  observatiiPreluare: string;
  observatiiCaroserie: string;
  accesoriiPredate: string;
  termenPromis: string;
  prioritate: PrioritateComanda;
  tipPlata: TipPlata;
}

// Calculăm o dată implicită puțin în viitor, ca formularul să pornească
// într-o stare realistă și să nu oblige utilizatorul să completeze totul de la zero.
const dataPesteDouaZile = () => {
  const data = new Date();
  data.setDate(data.getDate() + 2);
  return data.toISOString().slice(0, 10);
};

// Valorile inițiale sunt centralizate aici ca să putem reseta ușor formularul
// și să folosim aceeași bază de pornire oriunde este nevoie.
export const stareDosarInitiala: StareDosarAsigurare = {
  mod: 'existent',
  idDosarSelectat: null,
  idAsigurator: null,
  numarReferintaAsigurator: '',
  tipPolita: 'CASCO',
  dataConstatare: new Date().toISOString().slice(0, 10),
  sumaAprobata: '',
  franciza: '',
  statusAprobare: 'In analiza',
  inspectorDauna: '',
  observatiiDauna: '',
};

export const detaliiPreluareInitiale: DetaliiPreluareForm = {
  kilometrajPreluare: '',
  nivelCombustibil: '1/2',
  simptomeReclamate: '',
  observatiiPreluare: '',
  observatiiCaroserie: '',
  accesoriiPredate: '',
  termenPromis: dataPesteDouaZile(),
  prioritate: 'Normala',
  tipPlata: 'Client Direct',
};

// Generăm un id local pentru rândurile din UI. Nu este un id de bază de date,
// ci doar o cheie stabilă pentru React până la salvare.
const genereazaDraftId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

// Când utilizatorul apasă "Adaugă poziție", pornim de la acest obiect standard.
// Valorile implicite sunt alese astfel încât primul pas să fie ușor de înțeles:
// tipul este manoperă, cantitatea este 1 și TVA-ul pornește de la 19%.
export const creeazaPozitieDraft = (): PozitieComandaDraft => ({
  _draftId: genereazaDraftId(),
  tipPozitie: 'Manopera',
  catalogId: null,
  codArticol: '',
  descriere: '',
  unitateMasura: 'ore',
  cantitate: 1,
  pretVanzare: 0,
  discountProcent: 0,
  cotaTVA: 19,
  disponibilitateStoc: true,
  observatiiPozitie: '',
});
