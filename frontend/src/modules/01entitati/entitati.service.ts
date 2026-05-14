import type { ClientFormValues, AngajatFormValues, AsiguratorFormValues } from './schemas';
import { apiJson } from '../../lib/api';

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

const API_URL = '/entitati';
const OPERATIONAL_API_URL = '/operational';

// ============================================================================
// --- CLIENȚI (Conectat la Baza de Date) ---
// ============================================================================
export async function fetchClienti(): Promise<ClientEntity[]> {
  try {
    return await apiJson<ClientEntity[]>(`${API_URL}/clienti`);
  } catch (err) {
    console.error("Eroare la fetchClienti:", err);
    return []; // Protecție: returnăm listă goală ca să nu crape maparea
  }
}

export async function saveClient(data: ClientFormValues, id?: number): Promise<ClientEntity> {
  const method = id ? 'PATCH' : 'POST';
  const url = id ? `${API_URL}/clienti/${id}` : `${API_URL}/clienti`;
  return await apiJson<ClientEntity>(url, {
    method,
    body: JSON.stringify(data),
  });
}

export async function schimbaStatusClient(id: number, status: 'Activ' | 'Inactiv'): Promise<void> {
  await apiJson(`${API_URL}/clienti/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// --- ANGAJAȚI (Conectat la Baza de Date) ---
// ============================================================================
export async function fetchAngajati(): Promise<AngajatEntity[]> {
  try {
    return await apiJson<AngajatEntity[]>(`${API_URL}/angajati`);
  } catch (err) {
    console.error("Eroare la fetchAngajati:", err);
    return [];
  }
}

export async function saveAngajat(data: AngajatFormValues, id?: number): Promise<AngajatEntity> {
  const method = id ? 'PATCH' : 'POST';
  const url = id ? `${API_URL}/angajati/${id}` : `${API_URL}/angajati`;
  return await apiJson<AngajatEntity>(url, {
    method,
    body: JSON.stringify(data),
  });
}

export async function schimbaStatusAngajat(id: number, status: 'Activ' | 'Inactiv'): Promise<void> {
  await apiJson(`${API_URL}/angajati/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// --- ASIGURĂTORI (Conectat la Baza de Date) ---
// ============================================================================
export async function fetchAsiguratori(): Promise<AsiguratorEntity[]> {
  try {
    return await apiJson<AsiguratorEntity[]>(`${API_URL}/asiguratori`);
  } catch (err) {
    console.error("Eroare la fetchAsiguratori:", err);
    return [];
  }
}

export async function saveAsigurator(data: AsiguratorFormValues, id?: number): Promise<AsiguratorEntity> {
  const method = id ? 'PATCH' : 'POST';
  const url = id ? `${API_URL}/asiguratori/${id}` : `${API_URL}/asiguratori`;
  return await apiJson<AsiguratorEntity>(url, {
    method,
    body: JSON.stringify(data),
  });
}

export async function schimbaStatusAsigurator(id: number, status: 'Activ' | 'Inactiv'): Promise<void> {
  await apiJson(`${API_URL}/asiguratori/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
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
    return await apiJson<VehiculEntity[]>(`${OPERATIONAL_API_URL}/vehicule`);
  } catch (err) {
    console.error("Eroare la fetchVehicule:", err);
    return [];
  }
}

export async function saveVehicul(data: VehiculFormValues, id?: number): Promise<VehiculEntity> {
  const method = id ? 'PATCH' : 'POST';
  const url = id ? `${OPERATIONAL_API_URL}/vehicule/${id}` : `${OPERATIONAL_API_URL}/vehicule`;
  return await apiJson<VehiculEntity>(url, {
    method,
    body: JSON.stringify(data),
  });
}

export async function schimbaStatusVehicul(id: number, status: 'Activ' | 'Inactiv'): Promise<void> {
  await apiJson(`${OPERATIONAL_API_URL}/vehicule/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

