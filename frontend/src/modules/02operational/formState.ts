// Aici ținem starea "de formular" care nu aparține direct tabelelor din bază,
// dar este necesară pentru UI: de exemplu cum arată formularul de dosar și cum
// se creează o poziție nouă în mod local înainte de salvare.
import type { PozitieComandaDraft } from './types';

// Reprezintă starea formularului pentru dosarul de daună.
// `mod` spune dacă utilizatorul alege un dosar existent sau creează unul nou.
export interface StareDosarAsigurare {
  mod: 'existent' | 'nou';
  idDosarSelectat: number | null;
  idAsigurator: number | null;
  sumaAprobata: number | '';
  franciza: number | '';
}

// Starea de start este neutră: nu avem dosar selectat și nici valori completate.
export const stareDosarInitiala: StareDosarAsigurare = {
  mod: 'existent',
  idDosarSelectat: null,
  idAsigurator: null,
  sumaAprobata: '',
  franciza: '',
};

// Generăm un id local pentru rândurile din UI. Nu este un id de bază de date,
// ci doar o cheie stabilă pentru React până când poziția este salvată.
const genereazaDraftId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

// Creează o poziție "goală" cu valori implicite, folosită când deschidem
// formularul sau când utilizatorul apasă pe "Adaugă poziție".
export const creeazaPozitieDraft = (): PozitieComandaDraft => ({
  _draftId: genereazaDraftId(),
  tipPozitie: 'Manopera',
  descriere: '',
  cantitate: 1,
  pretVanzare: 0,
  cotaTVA: 19,
});
