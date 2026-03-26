// Seed-urile din acest fișier sunt sursa comună pentru modulele de catalog.
// Componentele locale păstrează în continuare starea editabilă în pagină,
// dar nu mai pornesc din liste hardcodate direct în JSX.

export type TipPiesaCatalogMock = 'NOUA' | 'SH';

export interface PiesaCatalogMock {
  idPiesa: number;
  codPiesa: string;
  producator: string;
  pretBaza: number;
  tip: TipPiesaCatalogMock;
  luniGarantie?: number;
  gradUzura?: string;
}

export interface ManoperaCatalogMock {
  idManopera: number;
  codManopera: string;
  durataStd: number;
}

export const pieseCatalogMock: PiesaCatalogMock[] = [
  {
    idPiesa: 1,
    codPiesa: 'FIL-UL-BOSCH',
    producator: 'Bosch',
    pretBaza: 45.5,
    tip: 'NOUA',
    luniGarantie: 12,
  },
  {
    idPiesa: 2,
    codPiesa: 'ALT-VW-GOLF',
    producator: 'Valeo',
    pretBaza: 350,
    tip: 'SH',
    gradUzura: 'Ușor uzat',
  },
  {
    idPiesa: 3,
    codPiesa: 'PL-FR-RCL',
    producator: 'ATE',
    pretBaza: 265,
    tip: 'NOUA',
    luniGarantie: 24,
  },
  {
    idPiesa: 4,
    codPiesa: 'DISC-FR-RCL',
    producator: 'Textar',
    pretBaza: 410,
    tip: 'NOUA',
    luniGarantie: 24,
  },
  {
    idPiesa: 5,
    codPiesa: 'COMP-AC-FTR',
    producator: 'Denso',
    pretBaza: 1980,
    tip: 'SH',
    gradUzura: 'Testat, uzură medie',
  },
  {
    idPiesa: 6,
    codPiesa: 'BAT-70AH-VAR',
    producator: 'Varta',
    pretBaza: 540,
    tip: 'NOUA',
    luniGarantie: 18,
  },
];

export const manoperaCatalogMock: ManoperaCatalogMock[] = [
  { idManopera: 1, codManopera: 'MAN-SCHIMB-ULEI', durataStd: 0.5 },
  { idManopera: 2, codManopera: 'MAN-DISTRIBUTIE', durataStd: 4.0 },
  { idManopera: 3, codManopera: 'MAN-DIAGNOZA', durataStd: 1.0 },
  { idManopera: 4, codManopera: 'MAN-FRANE-FATA', durataStd: 2.0 },
  { idManopera: 5, codManopera: 'MAN-TINICHIGERIE-ELEMENT', durataStd: 5.5 },
  { idManopera: 6, codManopera: 'MAN-SERVICE-AC', durataStd: 1.8 },
];
