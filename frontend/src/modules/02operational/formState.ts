import type { PozitieComandaDraft } from './types';

export interface StareDosarAsigurare {
  mod: 'existent' | 'nou';
  idDosarSelectat: number | null;
  idAsigurator: number | null;
  sumaAprobata: number | '';
  franciza: number | '';
}

export const stareDosarInitiala: StareDosarAsigurare = {
  mod: 'existent',
  idDosarSelectat: null,
  idAsigurator: null,
  sumaAprobata: '',
  franciza: '',
};

const genereazaDraftId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const creeazaPozitieDraft = (): PozitieComandaDraft => ({
  _draftId: genereazaDraftId(),
  tipPozitie: 'Manopera',
  descriere: '',
  cantitate: 1,
  pretVanzare: 0,
  cotaTVA: 19,
});
