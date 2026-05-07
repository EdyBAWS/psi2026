import type { CatalogKit, CatalogManopera, CatalogPiesa, ComandaService, DosarDauna, Mecanic, PozitieComanda, Vehicul, Asigurator, Client } from "./types";

const API_OP = 'http://localhost:3000/operational';
const API_ENT = 'http://localhost:3000/entitati';
const API_CAT = 'http://localhost:3000/catalog';

export const fetchComenzi = async (): Promise<ComandaService[]> => {
  const response = await fetch(`${API_OP}/comenzi`);
  if (!response.ok) throw new Error('Eroare la preluarea comenzilor');
  const data = await response.json();

  return data.map((c: any) => ({
    ...c,
    vehicul: c.dosar?.vehicul || null, 
    client: c.dosar?.client || null,
    idMecanic: c.idAngajat,
    numeMecanic: c.angajat ? `${c.angajat.nume} ${c.angajat.prenume || ''}`.trim() : 'Nealocat'
  }));
};

export async function createComanda(data: Partial<ComandaService>): Promise<ComandaService> {
  const res = await fetch(`${API_OP}/comenzi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      numarComanda: data.numarComanda,
      idDosar: data.idDosar,
      idAngajat: data.idMecanic,
      dataPreconizata: data.termenPromis,
      status: data.status || "In asteptare diagnoza"
    }),
  });
  if (!res.ok) throw new Error('Eroare la crearea comenzii');
  const c = await res.json();
  return { ...c, idMecanic: c.idAngajat };
}

export async function createDosarDauna(data: Partial<DosarDauna>): Promise<DosarDauna> {
  const res = await fetch(`${API_OP}/dosare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Eroare la crearea dosarului');
  return await res.json();
}

export async function fetchDosareDauna(): Promise<DosarDauna[]> {
  const res = await fetch(`${API_OP}/dosare`);
  return res.ok ? await res.json() : [];
}

export async function fetchVehicule(): Promise<Vehicul[]> {
  const res = await fetch(`${API_OP}/vehicule`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((v: any) => ({
    idVehicul: v.idVehicul,
    idClient: v.idClient,
    numarInmatriculare: v.numarInmatriculare || "",
    marca: v.marca || "",
    model: v.model || "",
    an: v.an || new Date().getFullYear(),
    vin: v.vin || ""                     
  }));
}

export async function fetchMecanici(): Promise<Mecanic[]> {
  const res = await fetch(`${API_ENT}/angajati`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.filter((a: any) => a.tipAngajat === 'Mecanic' && a.status === 'Activ').map((a: any) => ({
    idMecanic: a.idAngajat,
    nume: `${a.nume} ${a.prenume || ''}`.trim(),
    specialitate: a.specializare || 'Mecanic'
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
  return res.ok ? await res.json() : [];
}

export async function fetchCatalogManopere(): Promise<CatalogManopera[]> {
  const res = await fetch(`${API_CAT}/manopera`);
  return res.ok ? await res.json() : [];
}

export async function fetchCatalogKituri(): Promise<CatalogKit[]> { return []; }
export async function fetchPozitiiComanda(): Promise<PozitieComanda[]> { return []; }
export async function createPozitiiComanda(_id: number, pozitii: any[]): Promise<any[]> { return pozitii; }