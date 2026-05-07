import type { ClientFormValues, AngajatFormValues, AsiguratorFormValues } from './schemas';

export type ClientEntity = ClientFormValues & { idClient: number };
export type AngajatEntity = AngajatFormValues & { idAngajat: number };

// Definim explicit entitatea Asiguratorului pentru a include toate câmpurile din Prisma
export interface AsiguratorEntity {
  idAsigurator: number;
  denumire: string;
  CUI: string;
  telefon?: string;
  nrRegCom?: string;
  adresa?: string;
  emailDaune?: string;
  IBAN?: string;
  termenPlataZile: number;
  status: 'Activ' | 'Inactiv';
}

const API_URL = 'http://127.0.0.1:3000/entitati';
const OPERATIONAL_API_URL = 'http://127.0.0.1:3000/operational';

// ============================================================================
// --- CLIENȚI (Conectat la Baza de Date) ---
// ============================================================================
export async function fetchClienti(): Promise<ClientEntity[]> {
  try {
    const res = await fetch(`${API_URL}/clienti`);
    if (!res.ok) throw new Error('Eroare backend la clienți');
    return await res.json();
  } catch (err) {
    console.error("Eroare la fetchClienti:", err);
    return []; // Protecție: returnăm listă goală ca să nu crape maparea
  }
}

export async function saveClient(data: ClientFormValues, id?: number): Promise<ClientEntity> {
  const method = id ? 'PATCH' : 'POST';
  const url = id ? `${API_URL}/clienti/${id}` : `${API_URL}/clienti`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Eroare la salvarea clientului');
  return await res.json();
}

export async function schimbaStatusClient(id: number, status: 'Activ' | 'Inactiv'): Promise<void> {
  const res = await fetch(`${API_URL}/clienti/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Eroare la schimbarea statusului clientului');
}

// ============================================================================
// --- ANGAJAȚI (Conectat la Baza de Date) ---
// ============================================================================
export async function fetchAngajati(): Promise<AngajatEntity[]> {
  try {
    const res = await fetch(`${API_URL}/angajati`);
    if (!res.ok) throw new Error('Eroare backend la angajați');
    return await res.json();
  } catch (err) {
    console.error("Eroare la fetchAngajati:", err);
    return [];
  }
}

export async function saveAngajat(data: AngajatFormValues, id?: number): Promise<AngajatEntity> {
  const method = id ? 'PATCH' : 'POST';
  const url = id ? `${API_URL}/angajati/${id}` : `${API_URL}/angajati`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Eroare la salvarea angajatului');
  return await res.json();
}

export async function schimbaStatusAngajat(id: number, status: 'Activ' | 'Inactiv'): Promise<void> {
  const res = await fetch(`${API_URL}/angajati/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Eroare la schimbarea statusului angajatului');
}

// ============================================================================
// --- ASIGURĂTORI (Conectat la Baza de Date) ---
// ============================================================================
export async function fetchAsiguratori(): Promise<AsiguratorEntity[]> {
  try {
    const res = await fetch(`${API_URL}/asiguratori`);
    if (!res.ok) throw new Error('Eroare backend la asigurători');
    return await res.json();
  } catch (err) {
    console.error("Eroare la fetchAsiguratori:", err);
    return [];
  }
}

export async function saveAsigurator(data: AsiguratorFormValues, id?: number): Promise<AsiguratorEntity> {
  const method = id ? 'PATCH' : 'POST';
  const url = id ? `${API_URL}/asiguratori/${id}` : `${API_URL}/asiguratori`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Eroare la salvarea asigurătorului');
  return await res.json();
}

export async function schimbaStatusAsigurator(id: number, status: 'Activ' | 'Inactiv'): Promise<void> {
  const res = await fetch(`${API_URL}/asiguratori/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Eroare la schimbarea statusului asigurătorului');
}

// ============================================================================
// --- VEHICULE (Conectat la Baza de Date via Modulul Operațional) ---
// ============================================================================
export type VehiculEntity = {
  idVehicul: number;
  numarInmatriculare: string; // Adaptat exact la denumirea din Prisma
  marca: string;
  model: string;
  vin: string;                // Adaptat exact la denumirea din Prisma
  idClient: number;
  status: 'Activ' | 'Inactiv';
  client?: ClientEntity;      // Returnat automat din backend prin logica de "include"
};

export type VehiculFormValues = {
  numarInmatriculare: string;
  marca: string;
  model: string;
  vin: string;
  idClient: number;
};

export async function fetchVehicule(): Promise<VehiculEntity[]> {
  try {
    const res = await fetch(`${OPERATIONAL_API_URL}/vehicule`);
    if (!res.ok) throw new Error('Eroare backend la vehicule');
    return await res.json();
  } catch (err) {
    console.error("Eroare la fetchVehicule:", err);
    return [];
  }
}

export async function saveVehicul(data: VehiculFormValues, id?: number): Promise<VehiculEntity> {
  const method = id ? 'PATCH' : 'POST';
  const url = id ? `${OPERATIONAL_API_URL}/vehicule/${id}` : `${OPERATIONAL_API_URL}/vehicule`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Eroare la salvarea vehiculului');
  return await res.json();
}

export async function schimbaStatusVehicul(id: number, status: 'Activ' | 'Inactiv'): Promise<void> {
  const res = await fetch(`${OPERATIONAL_API_URL}/vehicule/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Eroare la schimbarea statusului vehiculului');
}
