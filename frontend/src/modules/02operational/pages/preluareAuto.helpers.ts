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

interface PasFluxParams {
  detaliiPreluare: DetaliiPreluareForm;
  dosarValid: boolean;
  esteLucrareAsigurare: boolean;
  idMecanicSelectat: number | null;
  pozitiiDraft: PozitieComandaDraft[];
  vehiculSelectat: Vehicul | null;
}

export function calculeazaFluxPreluare({
  detaliiPreluare,
  dosarValid,
  esteLucrareAsigurare,
  idMecanicSelectat,
  pozitiiDraft,
  vehiculSelectat,
}: PasFluxParams) {
  const pasiFlux = esteLucrareAsigurare
    ? ['Selectare auto', 'Simptome', 'Dosar Daună', 'Deviz', 'Confirmare']
    : ['Selectare auto', 'Simptome', 'Deviz', 'Confirmare'];

  let pasCurent = 1;

  if (vehiculSelectat) {
    pasCurent = 2;
    if (detaliiPreluare.simptomeReclamate) {
      if (esteLucrareAsigurare) {
        pasCurent = 3;
        if (dosarValid) {
          pasCurent = 4;
          if (suntPozitiiValide(pozitiiDraft) && idMecanicSelectat !== null) {
            pasCurent = 5;
          }
        }
      } else {
        pasCurent = 3;
        if (suntPozitiiValide(pozitiiDraft) && idMecanicSelectat !== null) {
          pasCurent = 4;
        }
      }
    }
  }

  return { pasiFlux, pasCurent };
}

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
