// Aici ținem starea de UI care nu este încă "persistată", dar este necesară
// pentru formularele din modulul operațional.
import type {
  NivelCombustibil,
  PozitieComandaDraft,
  PrioritateComanda,
  StatusDosar,
  TipPlata,
  TipPolita,
} from './types';

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

const dataPesteDouaZile = () => {
  const data = new Date();
  data.setDate(data.getDate() + 2);
  return data.toISOString().slice(0, 10);
};

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
