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

const API_BASE = "http://127.0.0.1:3000";
const API_OP = `${API_BASE}/operational`;
const API_ENT = `${API_BASE}/entitati`;
const API_CAT = `${API_BASE}/catalog`;
const POZITII_STORAGE_KEY = "psi-operational-pozitii-comanda";

type BackendStatus = "Activ" | "Inactiv";

// Backend-ul păstrează statusuri generale simple, iar UI-ul folosește statusuri
// mai descriptive pentru fluxul de service. Aceste funcții sunt stratul de
// traducere dintre cele două lumi.
const statusBackendToUi = (status?: BackendStatus | null): StatusComanda =>
  status === "Inactiv" ? "Anulat" : "In asteptare diagnoza";

const statusUiToBackend = (status?: StatusComanda): BackendStatus =>
  status === "Anulat" ? "Inactiv" : "Activ";

async function parseApiError(response: Response, fallback: string) {
  const text = await response.text();

  if (!text) return fallback;

  try {
    const body = JSON.parse(text);
    const message = Array.isArray(body.message)
      ? body.message.join("; ")
      : body.message;
    return message ? `${fallback}: ${message}` : fallback;
  } catch {
    return `${fallback}: ${text}`;
  }
}

// Mapper-ele de mai jos normalizează răspunsurile API. Asta ține componentele
// React decuplate de forma exactă în care Prisma/Nest întorc relațiile.
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

  return {
    idComanda: c.idComanda,
    idVehicul,
    idDosar: c.idDosar ?? fallback?.idDosar ?? null,
    idMecanic,
    numarComanda: c.numarComanda ?? fallback?.numarComanda ?? "",
    dataDeschidere: c.createdAt ? new Date(c.createdAt) : fallback?.dataDeschidere,
    dataFinalizare: c.dataFinalizare ? new Date(c.dataFinalizare) : fallback?.dataFinalizare ?? null,
    status: statusBackendToUi(c.status),
    totalEstimat: fallback?.totalEstimat ?? 0,
    kilometrajPreluare: fallback?.kilometrajPreluare,
    nivelCombustibil: fallback?.nivelCombustibil,
    simptomeReclamate: fallback?.simptomeReclamate,
    observatiiPreluare: fallback?.observatiiPreluare,
    observatiiCaroserie: fallback?.observatiiCaroserie,
    accesoriiPredate: fallback?.accesoriiPredate,
    termenPromis: c.dataPreconizata
      ? new Date(c.dataPreconizata)
      : fallback?.termenPromis,
    prioritate: fallback?.prioritate ?? "Normala",
    tipPlata: fallback?.tipPlata ?? (dosar?.idAsigurator ? "Asigurare" : "Client Direct"),
  };
};

const readPozitiiLocale = (): PozitieComanda[] => {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(POZITII_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
};

// Schema backend actuală nu are încă tabel separat pentru pozițiile de comandă.
// Le păstrăm local ca soluție intermediară, iar comanda și dosarul rămân
// persistate real în PostgreSQL.
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
      idAngajat: data.idMecanic ?? undefined,
      dataPreconizata: data.termenPromis ? new Date(data.termenPromis).toISOString() : undefined,
      // DTO-ul Nest acceptă doar enum-ul Prisma StatusGeneral: Activ/Inactiv.
      status: statusUiToBackend(data.status),
    }),
  });

  if (!res.ok) throw new Error(await parseApiError(res, "Eroare la crearea comenzii"));

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

export async function fetchMecanici(): Promise<Mecanic[]> {
  const res = await fetch(`${API_ENT}/angajati`);
  if (!res.ok) return [];
  const data = await res.json();
  return data
    .filter((a: any) => a.tipAngajat === "Mecanic" && a.status === "Activ")
    .map((a: any) => ({
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
  return [];
}

export async function fetchPozitiiComanda(): Promise<PozitieComanda[]> {
  return readPozitiiLocale();
}

export async function createPozitiiComanda(
  idComanda: number,
  pozitii: PozitieComandaDraft[],
): Promise<PozitieComanda[]> {
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
