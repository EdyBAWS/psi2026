export type TipPiesaCatalog = "NOUA" | "SH";
export type CategoriePiesa = "Filtre" | "Frânare" | "Motor & Distribuție" | "Electrice" | "Suspensie & Direcție" | "Climatizare" | "Lichide" | "Transmisie" | "Altele";
export type CategorieManopera = "Mecanică Ușoară" | "Mecanică Grea" | "Diagnoză" | "Tinichigerie" | "Electrică";

export interface PiesaCatalog {
  idPiesa: number;
  codPiesa: string;
  denumire: string;
  producator: string;
  categorie: CategoriePiesa;
  pretBaza: number;
  stoc: number;
  tip: TipPiesaCatalog;
  luniGarantie?: number;
  gradUzura?: string;
}

export interface ManoperaCatalog {
  idManopera: number;
  codManopera: string;
  denumire: string;
  categorie: CategorieManopera;
  durataStd: number;
  pretOra: number;
}

