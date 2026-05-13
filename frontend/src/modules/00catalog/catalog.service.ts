import { type ManoperaCatalogMock, type PiesaCatalogMock } from '../../mock/catalog';
import { apiJson } from '../../lib/api';

// ─── Manoperă ─────────────────────────
export async function fetchManopera(): Promise<ManoperaCatalogMock[]> {
  return apiJson('/catalog/manopera');
}

export async function createManopera(data: Omit<ManoperaCatalogMock, 'idManopera'>): Promise<ManoperaCatalogMock> {
  return apiJson('/catalog/manopera', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateManopera(id: number, data: Partial<ManoperaCatalogMock>): Promise<ManoperaCatalogMock> {
  return apiJson(`/catalog/manopera/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteManopera(id: number): Promise<void> {
  await apiJson(`/catalog/manopera/${id}`, { method: 'DELETE' });
}

// ─── Kituri ──────────────────────────
export async function fetchKituri(): Promise<any[]> {
  return apiJson<any[]>('/catalog/kituri');
}

export async function createKit(data: any): Promise<any> {
  return apiJson('/catalog/kituri', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateKit(id: number, data: any): Promise<any> {
  return apiJson(`/catalog/kituri/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteKit(id: number): Promise<void> {
  await apiJson(`/catalog/kituri/${id}`, { method: 'DELETE' });
}

// ─── Piese ──────────────────────────
export async function fetchPiese(): Promise<PiesaCatalogMock[]> {
  return apiJson('/catalog/piese');
}

const ISTORIC_STORAGE_KEY = "psi-catalog-istoric-piese";

export async function fetchIstoricPiesa(id: number): Promise<any[]> {
  let localData: any[] = [];
  try {
    const raw = window.localStorage.getItem(ISTORIC_STORAGE_KEY);
    if (raw) {
      localData = JSON.parse(raw).filter((h: any) => h.idPiesa === id);
    }
  } catch (err) { console.error(err); }

  try {
    const apiData = await apiJson<any[]>(`/catalog/piese/${id}/istoric`);
    return [...localData, ...apiData].sort((a, b) => new Date(b.dataComanda).getTime() - new Date(a.dataComanda).getTime());
  } catch {
    return localData; // Return local if API fails or returns 404
  }
}

export async function recordConsumPiesa(data: { idPiesa: number, idComanda: number, cantitate: number, dataComanda: string, numeAngajat?: string }) {
  try {
    const raw = window.localStorage.getItem(ISTORIC_STORAGE_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.push({ ...data, id: Date.now() });
    window.localStorage.setItem(ISTORIC_STORAGE_KEY, JSON.stringify(history));
  } catch (err) { console.error(err); }
}

export async function createPiesa(data: Omit<PiesaCatalogMock, 'idPiesa'>): Promise<PiesaCatalogMock> {
  return apiJson('/catalog/piese', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePiesa(id: number, data: Partial<PiesaCatalogMock>): Promise<PiesaCatalogMock> {
  return apiJson(`/catalog/piese/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deletePiesa(id: number): Promise<void> {
  await apiJson(`/catalog/piese/${id}`, { method: 'DELETE' });
}
