// src/mock/catalog.ts

export type TipPiesaCatalogMock = "NOUA" | "SH";
export type CategoriePiesa =
  | "Filtre"
  | "Frânare"
  | "Motor & Distribuție"
  | "Electrice"
  | "Suspensie & Direcție"
  | "Climatizare"
  | "Altele";
export type CategorieManopera =
  | "Mecanică Ușoară"
  | "Mecanică Grea"
  | "Diagnoză"
  | "Tinichigerie"
  | "Electrică";

export interface PiesaCatalogMock {
  idPiesa: number;
  codPiesa: string;
  denumire: string; // <-- Am adăugat denumirea clară a piesei
  producator: string;
  categorie: CategoriePiesa;
  pretBaza: number;
  stoc: number; // <-- Management de stoc
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
  {
    idPiesa: 1,
    codPiesa: "FIL-UL-BOSCH",
    denumire: "Filtru Ulei",
    producator: "Bosch",
    categorie: "Filtre",
    pretBaza: 45.5,
    stoc: 24,
    tip: "NOUA",
    luniGarantie: 12,
  },
  {
    idPiesa: 2,
    codPiesa: "ALT-VW-GOLF",
    denumire: "Alternator 140A",
    producator: "Valeo",
    categorie: "Electrice",
    pretBaza: 350,
    stoc: 0,
    tip: "SH",
    gradUzura: "Ușor uzat",
  },
  {
    idPiesa: 3,
    codPiesa: "PL-FR-RCL",
    denumire: "Set Plăcuțe Frână Față",
    producator: "ATE",
    categorie: "Frânare",
    pretBaza: 265,
    stoc: 5,
    tip: "NOUA",
    luniGarantie: 24,
  },
  {
    idPiesa: 4,
    codPiesa: "DISC-FR-RCL",
    denumire: "Disc Frână Ventilat",
    producator: "Textar",
    categorie: "Frânare",
    pretBaza: 410,
    stoc: 12,
    tip: "NOUA",
    luniGarantie: 24,
  },
  {
    idPiesa: 5,
    codPiesa: "COMP-AC-FTR",
    denumire: "Compresor AC",
    producator: "Denso",
    categorie: "Climatizare",
    pretBaza: 1980,
    stoc: 1,
    tip: "SH",
    gradUzura: "Testat, uzură medie",
  },
  {
    idPiesa: 6,
    codPiesa: "BAT-70AH-VAR",
    denumire: "Baterie 70Ah",
    producator: "Varta",
    categorie: "Electrice",
    pretBaza: 540,
    stoc: 8,
    tip: "NOUA",
    luniGarantie: 18,
  },
  {
    idPiesa: 7,
    codPiesa: "FIL-AER-MANN",
    denumire: "Filtru Aer Motor",
    producator: "MANN",
    categorie: "Filtre",
    pretBaza: 58,
    stoc: 18,
    tip: "NOUA",
    luniGarantie: 12,
  },
  {
    idPiesa: 8,
    codPiesa: "FIL-CAB-HENG",
    denumire: "Filtru Habitaclu Carbon",
    producator: "Hengst",
    categorie: "Filtre",
    pretBaza: 72,
    stoc: 16,
    tip: "NOUA",
    luniGarantie: 12,
  },
  {
    idPiesa: 9,
    codPiesa: "AMORT-FATA-SAC",
    denumire: "Amortizor Față",
    producator: "Sachs",
    categorie: "Suspensie & Direcție",
    pretBaza: 385,
    stoc: 7,
    tip: "NOUA",
    luniGarantie: 24,
  },
  {
    idPiesa: 10,
    codPiesa: "CAP-BARA-TRW",
    denumire: "Cap Bară Direcție",
    producator: "TRW",
    categorie: "Suspensie & Direcție",
    pretBaza: 118,
    stoc: 14,
    tip: "NOUA",
    luniGarantie: 18,
  },
  {
    idPiesa: 11,
    codPiesa: "POMPA-APA-SKF",
    denumire: "Pompă de Apă",
    producator: "SKF",
    categorie: "Motor & Distribuție",
    pretBaza: 290,
    stoc: 9,
    tip: "NOUA",
    luniGarantie: 24,
  },
  {
    idPiesa: 12,
    codPiesa: "KIT-DISTR-CONTI",
    denumire: "Kit Distribuție Complet",
    producator: "Contitech",
    categorie: "Motor & Distribuție",
    pretBaza: 860,
    stoc: 4,
    tip: "NOUA",
    luniGarantie: 24,
  },
  {
    idPiesa: 13,
    codPiesa: "SEN-ABS-ATE",
    denumire: "Senzor ABS Roată",
    producator: "ATE",
    categorie: "Electrice",
    pretBaza: 210,
    stoc: 6,
    tip: "NOUA",
    luniGarantie: 12,
  },
  {
    idPiesa: 14,
    codPiesa: "FAR-ST-LED",
    denumire: "Far Stânga Full LED",
    producator: "Hella",
    categorie: "Electrice",
    pretBaza: 2450,
    stoc: 2,
    tip: "SH",
    gradUzura: "Testat, mici urme de utilizare",
  },
  {
    idPiesa: 15,
    codPiesa: "COND-AC-NISS",
    denumire: "Condensator AC",
    producator: "Nissens",
    categorie: "Climatizare",
    pretBaza: 690,
    stoc: 3,
    tip: "NOUA",
    luniGarantie: 18,
  },
  {
    idPiesa: 16,
    codPiesa: "EGR-VAL-PIER",
    denumire: "Valvă EGR",
    producator: "Pierburg",
    categorie: "Motor & Distribuție",
    pretBaza: 970,
    stoc: 1,
    tip: "SH",
    gradUzura: "Recondiționată și testată",
  },
  {
    idPiesa: 17,
    codPiesa: "BRAT-INF-LEM",
    denumire: "Braț Suspensie Inferior",
    producator: "Lemforder",
    categorie: "Suspensie & Direcție",
    pretBaza: 335,
    stoc: 11,
    tip: "NOUA",
    luniGarantie: 24,
  },
  {
    idPiesa: 18,
    codPiesa: "SET-BEC-OSR",
    denumire: "Set Becuri H7",
    producator: "Osram",
    categorie: "Altele",
    pretBaza: 88,
    stoc: 25,
    tip: "NOUA",
    luniGarantie: 6,
  },
];

export const manoperaCatalogMock: ManoperaCatalogMock[] = [
  {
    idManopera: 1,
    codManopera: "MAN-SCHIMB-ULEI",
    denumire: "Schimb Ulei și Filtre",
    categorie: "Mecanică Ușoară",
    durataStd: 0.5,
  },
  {
    idManopera: 2,
    codManopera: "MAN-DISTRIBUTIE",
    denumire: "Înlocuire Kit Distribuție",
    categorie: "Mecanică Grea",
    durataStd: 4.0,
  },
  {
    idManopera: 3,
    codManopera: "MAN-DIAGNOZA",
    denumire: "Diagnoză Computerizată",
    categorie: "Diagnoză",
    durataStd: 1.0,
  },
  {
    idManopera: 4,
    codManopera: "MAN-FRANE-FATA",
    denumire: "Înlocuire Plăcuțe și Discuri Față",
    categorie: "Mecanică Ușoară",
    durataStd: 2.0,
  },
  {
    idManopera: 5,
    codManopera: "MAN-TINICHIGERIE-ELEM",
    denumire: "Vopsit și Îndreptat Element",
    categorie: "Tinichigerie",
    durataStd: 5.5,
  },
  {
    idManopera: 6,
    codManopera: "MAN-SERVICE-AC",
    denumire: "Revizie și Încărcare Freon",
    categorie: "Electrică",
    durataStd: 1.8,
  },
  {
    idManopera: 7,
    codManopera: "MAN-REVIZIE-ANUALA",
    denumire: "Revizie Anuală Completă",
    categorie: "Mecanică Ușoară",
    durataStd: 1.5,
  },
  {
    idManopera: 8,
    codManopera: "MAN-SCHIMB-AMORT",
    denumire: "Înlocuire Amortizoare Față",
    categorie: "Mecanică Ușoară",
    durataStd: 2.6,
  },
  {
    idManopera: 9,
    codManopera: "MAN-SCHIMB-AMBREIAJ",
    denumire: "Înlocuire Kit Ambreiaj",
    categorie: "Mecanică Grea",
    durataStd: 6.5,
  },
  {
    idManopera: 10,
    codManopera: "MAN-SCHIMB-TURBINA",
    denumire: "Demontare și Montare Turbină",
    categorie: "Mecanică Grea",
    durataStd: 5.0,
  },
  {
    idManopera: 11,
    codManopera: "MAN-DIAG-AVANSATA",
    denumire: "Diagnoză Electrică Avansată",
    categorie: "Diagnoză",
    durataStd: 2.2,
  },
  {
    idManopera: 12,
    codManopera: "MAN-GEOMETRIE",
    denumire: "Reglaj Geometrie Direcție",
    categorie: "Mecanică Ușoară",
    durataStd: 1.1,
  },
  {
    idManopera: 13,
    codManopera: "MAN-INCARCARE-AC",
    denumire: "Vidare și Încărcare Instalație AC",
    categorie: "Electrică",
    durataStd: 1.2,
  },
  {
    idManopera: 14,
    codManopera: "MAN-VOPSIT-BARA",
    denumire: "Pregătire și Vopsit Bară",
    categorie: "Tinichigerie",
    durataStd: 3.8,
  },
  {
    idManopera: 15,
    codManopera: "MAN-POLISH-FARURI",
    denumire: "Polish Faruri și Protecție UV",
    categorie: "Electrică",
    durataStd: 0.9,
  },
  {
    idManopera: 16,
    codManopera: "MAN-SCHIMB-EGR",
    denumire: "Curățare / Înlocuire Valvă EGR",
    categorie: "Mecanică Grea",
    durataStd: 2.7,
  },
];
