import type {
  Asigurator,
  CatalogKit,
  CatalogManopera,
  CatalogPiesa,
  Client,
  ComandaService,
  DosarDauna,
  Mecanic,
  PozitieComanda,
  PozitieComandaDraft,
  StatusComanda,
  Vehicul,
} from "./types";
import { API_BASE_URL } from "../../lib/api";

const API_OP = `${API_BASE_URL}/operational`;
const API_ENT = `${API_BASE_URL}/entitati`;
const API_CAT = `${API_BASE_URL}/catalog`;
const POZITII_STORAGE_KEY = "psi-operational-pozitii-comanda";

const mapStatusToPrisma = (status?: StatusComanda): string => {
  if (!status) return "IN_ASTEPTARE_DIAGNOZA";
  switch (status as string) {
    case "In asteptare diagnoza": return "IN_ASTEPTARE_DIAGNOZA";
    case "Asteapta aprobare client": return "ASTEAPTA_APROBARE_CLIENT";
    case "In asteptare piese": return "IN_ASTEPTARE_PIESE";
    case "In lucru": return "IN_LUCRU";
    case "Finalizat": return "FINALIZAT";
    case "Facturat": return "FACTURAT";
    case "Anulat": return "ANULAT";
    default: return "IN_ASTEPTARE_DIAGNOZA";
  }
};

const mapStatusFromPrisma = (statusString?: string): StatusComanda => {
  switch (statusString) {
    case "IN_ASTEPTARE_DIAGNOZA": return "In asteptare diagnoza";
    case "ASTEAPTA_APROBARE_CLIENT": return "Asteapta aprobare client";
    case "IN_ASTEPTARE_PIESE": return "In asteptare piese";
    case "IN_LUCRU": return "In lucru";
    case "FINALIZAT": return "Finalizat";
    case "FACTURAT": return "Facturat";
    case "ANULAT": return "Anulat";
    // Fallbacks
    case "Activ": return "In asteptare diagnoza"; 
    case "Inactiv": return "Anulat";
    default: return "In asteptare diagnoza";
  }
};

async function parseApiError(response: Response, fallback: string) {
  const text = await response.text();
  if (!text) return fallback;
  try {
    const body = JSON.parse(text);
    const message = Array.isArray(body.message) ? body.message.join("; ") : body.message;
    return message ? `${fallback}: ${message}` : fallback;
  } catch {
    return `${fallback}: ${text}`;
  }
}

const mapVehicul = (v: any): Vehicul => ({
  idVehicul: v.idVehicul,
  idClient: v.idClient,
  numarInmatriculare: v.numarInmatriculare || "",
  marca: v.marca || "",
  model: v.model || "",
  an: v.an || new Date().getFullYear(),
  vin: v.vin || "",
});

const mapDosar = (d: any): DosarDauna => ({
  idDosar: d.idDosar,
  numarDosar: d.numarDosar,
  idClient: d.idClient,
  idVehicul: d.idVehicul,
  idAsigurator: d.idAsigurator ?? null,
  status: d.status,
  dataDeschidere: d.dataDeschidere ? new Date(d.dataDeschidere) : undefined,
  statusAprobare: d.status === "Inactiv" ? "Respins" : "In analiza",
});

const mapComanda = (c: any, fallback?: Partial<ComandaService>): ComandaService => {
  const dosar = c.dosar ?? null;
  const idVehicul = c.idVehicul ?? dosar?.idVehicul ?? dosar?.vehicul?.idVehicul ?? fallback?.idVehicul ?? 0;
  const idMecanic = c.idMecanic ?? c.idAngajat ?? fallback?.idMecanic ?? null;
  const idMecanici = c.mecanici?.map((m: any) => m.idAngajat) ?? fallback?.idMecanici ?? [];
  const mecanici = c.mecanici?.map((m: any) => ({
    idMecanic: m.idAngajat,
    nume: `${m.nume} ${m.prenume || ""}`.trim(),
    specialitate: m.specializare || "Mecanic",
  })) ?? fallback?.mecanici ?? [];

  return {
    idComanda: c.idComanda,
    idVehicul,
    idDosar: c.idDosar ?? fallback?.idDosar ?? null,
    idMecanic,
    idMecanici,
    mecanici,
    numarComanda: c.numarComanda ?? fallback?.numarComanda ?? "",
    dataDeschidere: c.createdAt ? new Date(c.createdAt) : fallback?.dataDeschidere,
    dataFinalizare: c.dataFinalizare ? new Date(c.dataFinalizare) : fallback?.dataFinalizare ?? null,
    status: mapStatusFromPrisma(c.status),
    totalEstimat: c.totalEstimat ?? fallback?.totalEstimat ?? 0,
    kilometrajPreluare: fallback?.kilometrajPreluare,
    nivelCombustibil: fallback?.nivelCombustibil,
    simptomeReclamate: fallback?.simptomeReclamate,
    observatiiPreluare: fallback?.observatiiPreluare,
    observatiiCaroserie: fallback?.observatiiCaroserie,
    accesoriiPredate: fallback?.accesoriiPredate,
    termenPromis: c.dataPreconizata ? new Date(c.dataPreconizata) : fallback?.termenPromis,
    prioritate: fallback?.prioritate ?? "Normala",
    tipPlata: fallback?.tipPlata ?? (dosar?.idAsigurator ? "Asigurare" : "Client Direct"),
  };
};

const readPozitiiLocale = (): PozitieComanda[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(POZITII_STORAGE_KEY) ?? "[]"); } catch { return []; }
};

const writePozitiiLocale = (pozitii: PozitieComanda[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(POZITII_STORAGE_KEY, JSON.stringify(pozitii));
};

export const fetchComenzi = async (): Promise<ComandaService[]> => {
  const response = await fetch(`${API_OP}/comenzi`);
  if (!response.ok) throw new Error(await parseApiError(response, "Eroare la preluarea comenzilor"));
  const data = await response.json();
  return data.map((comanda: any) => mapComanda(comanda));
};

export async function createComanda(data: Partial<ComandaService>): Promise<ComandaService> {
  const res = await fetch(`${API_OP}/comenzi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      numarComanda: data.numarComanda,
      idDosar: data.idDosar ?? undefined,
      idClient: (data as any).idClient ?? undefined,
      idVehicul: (data as any).idVehicul ?? undefined,
      idAngajat: data.idMecanic ?? undefined,
      idMecanici: data.idMecanici ?? undefined,
      dataPreconizata: data.termenPromis ? new Date(data.termenPromis).toISOString() : undefined,
      status: mapStatusToPrisma(data.status),
    }),
  });
  if (!res.ok) throw new Error(await parseApiError(res, "Eroare la crearea comenzii"));
  const comanda = await res.json();
  return mapComanda(comanda, data);
}

export async function updateComanda(idComanda: number, data: Partial<ComandaService>): Promise<ComandaService> {
  const res = await fetch(`${API_OP}/comenzi/${idComanda}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      numarComanda: data.numarComanda,
      idDosar: data.idDosar ?? undefined,
      idClient: (data as any).idClient ?? undefined,
      idVehicul: (data as any).idVehicul ?? undefined,
      idAngajat: data.idMecanic ?? undefined,
      idMecanici: data.idMecanici ?? undefined,
      dataPreconizata: data.termenPromis ? new Date(data.termenPromis).toISOString() : undefined,
      status: data.status ? mapStatusToPrisma(data.status) : undefined,
    }),
  });
  if (!res.ok) throw new Error(await parseApiError(res, "Eroare la actualizarea comenzii"));
  const comanda = await res.json();
  return mapComanda(comanda, data);
}

export async function createDosarDauna(data: Partial<DosarDauna>): Promise<DosarDauna> {
  const res = await fetch(`${API_OP}/dosare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      numarDosar: data.numarDosar,
      idClient: data.idClient,
      idVehicul: data.idVehicul,
      idAsigurator: data.idAsigurator ?? undefined,
      idInspector: (data as any).idInspector ?? undefined,
      status: data.status ?? "Activ",
    }),
  });
  if (!res.ok) throw new Error(await parseApiError(res, "Eroare la crearea dosarului"));
  return mapDosar(await res.json());
}

export async function fetchDosareDauna(): Promise<DosarDauna[]> {
  const res = await fetch(`${API_OP}/dosare`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((dosar: any) => mapDosar(dosar));
}

export async function fetchVehicule(): Promise<Vehicul[]> {
  const res = await fetch(`${API_OP}/vehicule`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((vehicul: any) => mapVehicul(vehicul));
}

export async function fetchAngajati(): Promise<any[]> {
  const res = await fetch(`${API_ENT}/angajati`);
  return res.ok ? await res.json() : [];
}

export async function fetchMecanici(): Promise<Mecanic[]> {
  const data = await fetchAngajati();
  return data.filter((a: any) => a.tipAngajat === "Mecanic" && a.status === "Activ").map((a: any) => ({
    idMecanic: a.idAngajat,
    nume: `${a.nume} ${a.prenume || ""}`.trim(),
    specialitate: a.specializare || "Mecanic",
  }));
}

export async function fetchClienti(): Promise<Client[]> {
  const res = await fetch(`${API_ENT}/clienti`);
  return res.ok ? await res.json() : [];
}

export async function fetchAsiguratori(): Promise<Asigurator[]> {
  const res = await fetch(`${API_ENT}/asiguratori`);
  return res.ok ? await res.json() : [];
}

export async function fetchCatalogPiese(): Promise<CatalogPiesa[]> {
  const res = await fetch(`${API_CAT}/piese`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((piesa: any) => ({
    idPiesa: piesa.idPiesa,
    codPiesa: piesa.codPiesa,
    denumire: piesa.denumire,
    pretBaza: piesa.pretBaza ?? 0,
    unitateMasura: "buc",
    disponibilitateStoc: (piesa.stoc ?? 0) > 0,
    cotaTVA: 19,
  }));
}

export async function fetchCatalogManopere(): Promise<CatalogManopera[]> {
  const res = await fetch(`${API_CAT}/manopera`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((manopera: any) => ({
    idManopera: manopera.idManopera,
    codManopera: manopera.codManopera,
    denumire: manopera.denumire,
    durataStd: manopera.durataStd ?? 1,
    pretOra: manopera.pretOra ?? 0,
    cotaTVA: 19,
  }));
}

export async function fetchCatalogKituri(): Promise<CatalogKit[]> {
  const res = await fetch(`${API_CAT}/kituri`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((kit: any) => ({
    idKit: kit.idKit,
    cod: kit.codKit,
    denumire: kit.denumire,
    unitateMasura: "kit",
    pretVanzare: kit.piese?.reduce((sum: number, p: any) => sum + (p.piesa.pretBaza * p.cantitate), 0) * (1 - (kit.reducere || 0) / 100),
    cotaTVA: 19,
    disponibilitateStoc: true,
    piese: kit.piese,
  }));
}

export async function fetchPozitiiComanda(): Promise<PozitieComanda[]> { return readPozitiiLocale(); }

export async function createPozitiiComanda(idComanda: number, pozitii: PozitieComandaDraft[]): Promise<PozitieComanda[]> {
  const existente = readPozitiiLocale();
  const stamp = Date.now();
  const pozitiiSalvate = pozitii.map((pozitie, index): PozitieComanda => ({
    idPozitieCmd: stamp + index,
    idComanda,
    idPiesa: pozitie.tipPozitie === "Piesa" ? pozitie.catalogId : null,
    idKit: pozitie.tipPozitie === "Kit" ? pozitie.catalogId : null,
    idManopera: pozitie.tipPozitie === "Manopera" ? pozitie.catalogId : null,
    tipPozitie: pozitie.tipPozitie,
    codArticol: pozitie.codArticol,
    descriere: pozitie.descriere,
    unitateMasura: pozitie.unitateMasura,
    cantitate: pozitie.cantitate,
    pretVanzare: pozitie.pretVanzare,
    discountProcent: pozitie.discountProcent,
    cotaTVA: pozitie.cotaTVA,
    disponibilitateStoc: pozitie.disponibilitateStoc,
    observatiiPozitie: pozitie.observatiiPozitie,
  }));

  writePozitiiLocale([...existente, ...pozitiiSalvate]);
  return pozitiiSalvate;
}

export async function updatePozitiiComanda(idComanda: number, pozitiiDraft: PozitieComandaDraft[]): Promise<PozitieComanda[]> {
  const toateExistente = readPozitiiLocale();
  const faraComandaCurenta = toateExistente.filter(p => p.idComanda !== idComanda);
  
  const stamp = Date.now();
  const noiPozitii = pozitiiDraft.map((p, index): PozitieComanda => ({
    idPozitieCmd: stamp + index,
    idComanda,
    idPiesa: p.tipPozitie === "Piesa" ? p.catalogId : null,
    idKit: p.tipPozitie === "Kit" ? p.catalogId : null,
    idManopera: p.tipPozitie === "Manopera" ? p.catalogId : null,
    tipPozitie: p.tipPozitie,
    codArticol: p.codArticol,
    descriere: p.descriere,
    unitateMasura: p.unitateMasura,
    cantitate: p.cantitate,
    pretVanzare: p.pretVanzare,
    discountProcent: p.discountProcent,
    cotaTVA: p.cotaTVA,
    disponibilitateStoc: p.disponibilitateStoc,
    observatiiPozitie: p.observatiiPozitie,
  }));

  writePozitiiLocale([...faraComandaCurenta, ...noiPozitii]);
  return noiPozitii;
}
