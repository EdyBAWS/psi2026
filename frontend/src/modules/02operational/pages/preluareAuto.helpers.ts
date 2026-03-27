// Fișierul conține helperi puri pentru pagina `PreluareAuto`.
// "Pur" înseamnă că funcțiile de aici nu modifică direct starea React
// și nu afișează UI; ele doar calculează și întorc rezultate.
import { calculeazaRezumatPozitii } from '../calculations';
import { suntPozitiiValide } from '../validations';
import type { Client, ComandaService, DosarDauna, PozitieComandaDraft, Vehicul } from '../types';
import type { DetaliiPreluareForm } from '../formState';

export const formatSuma = (valoare: number) =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 2,
  }).format(valoare);

export const formatData = (valoare: Date) => valoare.toLocaleDateString('ro-RO');

export const urmatorulId = <T,>(items: T[], selector: (item: T) => number) =>
  items.length === 0 ? 1 : Math.max(...items.map(selector)) + 1;

export const genereazaNumarDocument = (prefix: string, id: number) =>
  `${prefix}-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;

export const esteNumarCompletat = (valoare: number | ''): valoare is number => valoare !== '';

export const accesoriiCaLista = (valoare: string) =>
  valoare
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const tipPlataImplicit = (client: Client | null) =>
  client?.tipClient === 'Flota' ? 'Flota' : 'Client Direct';

// Parametrii acestui helper descriu "starea curentă a fluxului":
// ce vehicul avem, dacă e lucrare pe asigurare, dacă dosarul este valid etc.
interface PasFluxParams {
  detaliiPreluare: DetaliiPreluareForm;
  dosarValid: boolean;
  esteLucrareAsigurare: boolean;
  idMecanicSelectat: number | null;
  poateSalva: boolean;
  pozitiiDraft: PozitieComandaDraft[];
  vehiculSelectat: Vehicul | null;
}

export function calculeazaFluxPreluare({
  detaliiPreluare,
  dosarValid,
  esteLucrareAsigurare,
  idMecanicSelectat,
  poateSalva,
  pozitiiDraft,
  vehiculSelectat,
}: PasFluxParams) {
  // Lista pașilor diferă puțin în funcție de existența unui dosar de daună.
  const pasiFlux = esteLucrareAsigurare
    ? ['Selectare auto', 'Simptome', 'Dosar Daună', 'Deviz', 'Confirmare']
    : ['Selectare auto', 'Simptome', 'Deviz', 'Confirmare'];

  let pasCurent = 1;
  const simptomeCompletate = detaliiPreluare.simptomeReclamate.trim().length > 0;
  const devizCompletat = suntPozitiiValide(pozitiiDraft) && idMecanicSelectat !== null;

  // Dacă nu avem încă vehiculul sau simptomele, fluxul rămâne în primul pas.
  if (!vehiculSelectat) {
    return { pasiFlux, pasCurent };
  }

  if (!simptomeCompletate) {
    return { pasiFlux, pasCurent };
  }

  if (esteLucrareAsigurare) {
    // În fluxul cu asigurare trecem printr-un pas suplimentar: dosarul.
    pasCurent = 2;

    if (dosarValid) {
      pasCurent = 3;

      if (devizCompletat) {
        pasCurent = poateSalva ? 5 : 4;
      }
    }

    return { pasiFlux, pasCurent };
  }

  pasCurent = 2;

  if (devizCompletat) {
    pasCurent = poateSalva ? 4 : 3;
  }

  return { pasiFlux, pasCurent };
}

// Acest helper grupează 3 lucruri folosite des în pagină:
// - dacă lipsesc informații importante din formular
// - dacă dosarul este incomplet
// - rezumatul financiar al pozițiilor din deviz
export function calculeazaIndicatoriPreluare(
  vehiculSelectat: Vehicul | null,
  esteLucrareAsigurare: boolean,
  dosarValid: boolean,
  detaliiPreluare: DetaliiPreluareForm,
  idMecanicSelectat: number | null,
  pozitiiDraft: PozitieComandaDraft[],
) {
  return {
    lipsescSimptomeSauMecanic:
      vehiculSelectat !== null &&
      (!detaliiPreluare.simptomeReclamate ||
        idMecanicSelectat === null ||
        !suntPozitiiValide(pozitiiDraft)),
    lipsesteDosar: vehiculSelectat !== null && esteLucrareAsigurare && !dosarValid,
    rezumatPozitii: calculeazaRezumatPozitii(pozitiiDraft),
  };
}

export function calculeazaPreviewDocumente(
  comenzi: ComandaService[],
  dosare: DosarDauna[],
) {
  // Aici nu salvăm nimic, doar pregătim numerele "preview"
  // pentru următoarea comandă și următorul dosar posibil.
  return {
    nrComandaPreview: genereazaNumarDocument(
      'CMD',
      urmatorulId(comenzi, (comanda) => comanda.idComanda),
    ),
    nrDosarPreview: genereazaNumarDocument(
      'DAUNA',
      urmatorulId(dosare, (dosar) => dosar.idDosar),
    ),
  };
}
