// Funcțiile de calcul sunt centralizate aici pentru ca totalurile din mock data,
// formular și listări să folosească aceeași formulă.
import type { PozitieComanda, PozitieComandaDraft, StatusComanda } from './types';

type PozitieCalculabila = Pick<
  PozitieComandaDraft | PozitieComanda,
  'cantitate' | 'pretVanzare' | 'discountProcent' | 'cotaTVA'
>;

export interface RezumatFinanciar {
  subtotal: number;
  tva: number;
  total: number;
}

const rotunjeste = (valoare: number) => Number(valoare.toFixed(2));

export const calculeazaValoriPozitie = (
  pozitie: PozitieCalculabila,
): RezumatFinanciar => {
  const subtotalBrut = pozitie.cantitate * pozitie.pretVanzare;
  const subtotalNet = subtotalBrut * (1 - pozitie.discountProcent / 100);
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

const statusuriActive: StatusComanda[] = [
  'In asteptare diagnoza',
  'Asteapta aprobare client',
  'Asteapta piese',
  'In Lucru',
  'Gata de livrare',
];

export const comandaEsteActiva = (status: StatusComanda) =>
  statusuriActive.includes(status);

export const comandaEsteIntarziata = (
  status: StatusComanda,
  termenPromis: Date,
) => comandaEsteActiva(status) && termenPromis.getTime() < Date.now();
