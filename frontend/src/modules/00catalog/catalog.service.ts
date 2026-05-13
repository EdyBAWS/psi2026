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

export async function fetchIstoricPiesa(id: number): Promise<any[]> {
  return apiJson<any[]>(`/catalog/piese/${id}/istoric`);
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
