import { type ManoperaCatalog, type PiesaCatalog } from '../../types/catalog';
import { apiJson } from '../../lib/api';

// ─── Manoperă ─────────────────────────
export async function fetchManopera(): Promise<ManoperaCatalog[]> {
  return apiJson('/catalog/manopera');
}

export async function createManopera(data: Omit<ManoperaCatalog, 'idManopera'>): Promise<ManoperaCatalog> {
  return apiJson('/catalog/manopera', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateManopera(id: number, data: Partial<ManoperaCatalog>): Promise<ManoperaCatalog> {
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
export async function fetchPiese(): Promise<PiesaCatalog[]> {
  return apiJson('/catalog/piese');
}

export async function fetchIstoricPiesa(id: number): Promise<any[]> {
  // Numai date reale din DB
  return apiJson<any[]>(`/catalog/piese/${id}/istoric`);
}

export async function recordConsumPiesa(data: { idPiesa: number, idComanda: number, cantitate: number, dataComanda: string, numeAngajat?: string }) {
  // Implementat în backend prin fluxul de facturare.
  // Dacă e nevoie de un apel separat:
  try {
    await apiJson(`/catalog/piese/${data.idPiesa}/consum`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error("Endpoint-ul de consum nu este încă expus direct pe acest path.", err);
  }
}

export async function createPiesa(data: Omit<PiesaCatalog, 'idPiesa'>): Promise<PiesaCatalog> {
  return apiJson('/catalog/piese', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePiesa(id: number, data: Partial<PiesaCatalog>): Promise<PiesaCatalog> {
  return apiJson(`/catalog/piese/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deletePiesa(id: number): Promise<void> {
  await apiJson(`/catalog/piese/${id}`, { method: 'DELETE' });
}

