// src/mock/catalog.ts

export type TipPiesaCatalogMock = 'NOUA' | 'SH';
export type CategoriePiesa = 'Filtre' | 'Frânare' | 'Motor & Distribuție' | 'Electrice' | 'Suspensie & Direcție' | 'Climatizare' | 'Altele';
export type CategorieManopera = 'Mecanică Ușoară' | 'Mecanică Grea' | 'Diagnoză' | 'Tinichigerie' | 'Electrică';

export interface PiesaCatalogMock {
  idPiesa: number;
  codPiesa: string;
  denumire: string; // <-- Am adăugat denumirea clară a piesei
  producator: string;
  categorie: CategoriePiesa;
  pretBaza: number;
  stoc: number;     // <-- Management de stoc
  tip: TipPiesaCatalogMock;
  luniGarantie?: number;
  gradUzura?: string;
}

export interface ManoperaCatalogMock {
  idManopera: number;
  codManopera: string;
  denumire: string;
  categorie: CategorieManopera;
  durataStd: number;
  pretOra?: number; // Opțional: dacă vrei să ai preț fix pe oră per operațiune
}

export const pieseCatalogMock: PiesaCatalogMock[] = [
  { idPiesa: 1, codPiesa: 'FIL-UL-BOSCH', denumire: 'Filtru Ulei', producator: 'Bosch', categorie: 'Filtre', pretBaza: 45.5, stoc: 24, tip: 'NOUA', luniGarantie: 12 },
  { idPiesa: 2, codPiesa: 'ALT-VW-GOLF', denumire: 'Alternator 140A', producator: 'Valeo', categorie: 'Electrice', pretBaza: 350, stoc: 0, tip: 'SH', gradUzura: 'Ușor uzat' },
  { idPiesa: 3, codPiesa: 'PL-FR-RCL', denumire: 'Set Plăcuțe Frână Față', producator: 'ATE', categorie: 'Frânare', pretBaza: 265, stoc: 5, tip: 'NOUA', luniGarantie: 24 },
  { idPiesa: 4, codPiesa: 'DISC-FR-RCL', denumire: 'Disc Frână Ventilat', producator: 'Textar', categorie: 'Frânare', pretBaza: 410, stoc: 12, tip: 'NOUA', luniGarantie: 24 },
  { idPiesa: 5, codPiesa: 'COMP-AC-FTR', denumire: 'Compresor AC', producator: 'Denso', categorie: 'Climatizare', pretBaza: 1980, stoc: 1, tip: 'SH', gradUzura: 'Testat, uzură medie' },
  { idPiesa: 6, codPiesa: 'BAT-70AH-VAR', denumire: 'Baterie 70Ah', producator: 'Varta', categorie: 'Electrice', pretBaza: 540, stoc: 8, tip: 'NOUA', luniGarantie: 18 },
];

export const manoperaCatalogMock: ManoperaCatalogMock[] = [
  { idManopera: 1, codManopera: 'MAN-SCHIMB-ULEI', denumire: 'Schimb Ulei și Filtre', categorie: 'Mecanică Ușoară', durataStd: 0.5 },
  { idManopera: 2, codManopera: 'MAN-DISTRIBUTIE', denumire: 'Înlocuire Kit Distribuție', categorie: 'Mecanică Grea', durataStd: 4.0 },
  { idManopera: 3, codManopera: 'MAN-DIAGNOZA', denumire: 'Diagnoză Computerizată', categorie: 'Diagnoză', durataStd: 1.0 },
  { idManopera: 4, codManopera: 'MAN-FRANE-FATA', denumire: 'Înlocuire Plăcuțe și Discuri Față', categorie: 'Mecanică Ușoară', durataStd: 2.0 },
  { idManopera: 5, codManopera: 'MAN-TINICHIGERIE-ELEM', denumire: 'Vopsit și Îndreptat Element', categorie: 'Tinichigerie', durataStd: 5.5 },
  { idManopera: 6, codManopera: 'MAN-SERVICE-AC', denumire: 'Revizie și Încărcare Freon', categorie: 'Electrică', durataStd: 1.8 },
];