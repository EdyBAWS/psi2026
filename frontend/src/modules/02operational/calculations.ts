// Funcțiile de calcul sunt centralizate aici pentru ca totalurile din mock data,
// formular și listări să folosească aceeași formulă.
// În felul acesta evităm situația în care aceeași poziție ar avea alt total
// în tabel, alt total în comandă și alt total în mock data.
import type { PozitieComanda, PozitieComandaDraft, StatusComanda } from './types';

// Nu avem nevoie de toate câmpurile unei poziții pentru calcule.
// De aceea extragem doar proprietățile strict necesare.
type PozitieCalculabila = Pick<
  PozitieComandaDraft | PozitieComanda,
  'cantitate' | 'pretVanzare' | 'discountProcent' | 'cotaTVA'
>;

export interface RezumatFinanciar {
  subtotal: number;
  tva: number;
  total: number;
}

// Rotunjirea la 2 zecimale este importantă pentru a păstra afișarea financiară stabilă.
// Fără această etapă, pot apărea valori de tip 12.199999999.
const rotunjeste = (valoare: number) => Number(valoare.toFixed(2));

export const calculeazaValoriPozitie = (
  pozitie: PozitieCalculabila,
): RezumatFinanciar => {
  // Mai întâi calculăm valoarea brută: cantitate x preț.
  const subtotalBrut = pozitie.cantitate * pozitie.pretVanzare;
  // Apoi aplicăm reducerea, dacă există.
  const subtotalNet = subtotalBrut * (1 - pozitie.discountProcent / 100);
  // TVA-ul se aplică peste valoarea netă.
  const tva = subtotalNet * (pozitie.cotaTVA / 100);

  return {
    subtotal: rotunjeste(subtotalNet),
    tva: rotunjeste(tva),
    total: rotunjeste(subtotalNet + tva),
  };
};

export const calculeazaRezumatPozitii = (
  pozitii: Array<PozitieCalculabila>,
): RezumatFinanciar =>
  // Reducem lista de poziții într-un singur rezumat financiar.
  // Acest tip de calcul este util atât în formular, cât și în paginile de listare.
  pozitii.reduce<RezumatFinanciar>(
    (accumulator, pozitie) => {
      const valori = calculeazaValoriPozitie(pozitie);
      return {
        subtotal: rotunjeste(accumulator.subtotal + valori.subtotal),
        tva: rotunjeste(accumulator.tva + valori.tva),
        total: rotunjeste(accumulator.total + valori.total),
      };
    },
    { subtotal: 0, tva: 0, total: 0 },
  );

// Considerăm "active" doar statusurile care înseamnă că lucrarea încă se află
// în fluxul operațional și nu a fost închisă efectiv.
const statusuriActive: StatusComanda[] = [
  'In asteptare diagnoza',
  'Asteapta aprobare client',
  'Asteapta piese',
  'In Lucru',
  'Gata de livrare',
];

export const comandaEsteActiva = (status: StatusComanda) =>
  statusuriActive.includes(status);

// O comandă este întârziată doar dacă:
// 1. încă este activă
// 2. termenul promis a trecut deja
export const comandaEsteIntarziata = (
  status: StatusComanda,
  termenPromis: Date,
) => comandaEsteActiva(status) && termenPromis.getTime() < Date.now();
