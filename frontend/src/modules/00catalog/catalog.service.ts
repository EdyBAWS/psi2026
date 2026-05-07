import { type ManoperaCatalogMock, type PiesaCatalogMock } from '../../mock/catalog';

const API_URL = 'http://127.0.0.1:3000/catalog';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Eroare server');
  }
  return response.status !== 204 ? response.json() : null;
}

// ─── Manoperă ─────────────────────────
export async function fetchManopera(): Promise<ManoperaCatalogMock[]> {
  const response = await fetch(`${API_URL}/manopera`);
  return handleResponse(response);
}

export async function createManopera(data: Omit<ManoperaCatalogMock, 'idManopera'>): Promise<ManoperaCatalogMock> {
  const response = await fetch(`${API_URL}/manopera`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateManopera(id: number, data: Partial<ManoperaCatalogMock>): Promise<ManoperaCatalogMock> {
  const response = await fetch(`${API_URL}/manopera/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteManopera(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/manopera/${id}`, { method: 'DELETE' });
  await handleResponse(response);
}

// ─── Piese ──────────────────────────
export async function fetchPiese(): Promise<PiesaCatalogMock[]> {
  const response = await fetch(`${API_URL}/piese`);
  return handleResponse(response);
}

export async function fetchIstoricPiesa(id: number) {
  const response = await fetch(`${API_URL}/piese/${id}/istoric`);
  return handleResponse(response);
}

export async function createPiesa(data: Omit<PiesaCatalogMock, 'idPiesa'>): Promise<PiesaCatalogMock> {
  const response = await fetch(`${API_URL}/piese`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updatePiesa(id: number, data: Partial<PiesaCatalogMock>): Promise<PiesaCatalogMock> {
  const response = await fetch(`${API_URL}/piese/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deletePiesa(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/piese/${id}`, { method: 'DELETE' });
  await handleResponse(response);
}
