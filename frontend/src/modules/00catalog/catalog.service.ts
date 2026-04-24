// src/modules/00catalog/catalog.service.ts
//
// Acest fișier izolează toate operațiunile CRUD asupra datelor de catalog.
// În prezent lucrează exclusiv cu state local (mock-uri), dar fiecare funcție
// are semnătura finală care va fi păstrată când adăugăm backend-ul.
// La integrarea API-ului, înlocuiești implementarea din interior, nu și apelurile.

import {
  manoperaCatalogMock,
  pieseCatalogMock,
  type ManoperaCatalogMock,
  type PiesaCatalogMock,
} from '../../mock/catalog';

// ─── Manoperă ─────────────────────────────────────────────────────────────────

export async function fetchManopera(): Promise<ManoperaCatalogMock[]> {
  // TODO: return await api.get('/catalog/manopera');
  return Promise.resolve([...manoperaCatalogMock]);
}

export async function createManopera(
  data: Omit<ManoperaCatalogMock, 'idManopera'>,
): Promise<ManoperaCatalogMock> {
  // TODO: return await api.post('/catalog/manopera', data);
  return Promise.resolve({ ...data, idManopera: Date.now() });
}

export async function updateManopera(
  id: number,
  data: Partial<Omit<ManoperaCatalogMock, 'idManopera'>>,
): Promise<ManoperaCatalogMock> {
  // TODO: return await api.put(`/catalog/manopera/${id}`, data);
  const existing = manoperaCatalogMock.find((m) => m.idManopera === id);
  if (!existing) throw new Error(`Manopera cu id ${id} nu a fost găsită.`);
  return Promise.resolve({ ...existing, ...data });
}

export async function deleteManopera(): Promise<void> {
  // TODO: return await api.delete(`/catalog/manopera/${id}`);
  return Promise.resolve();
}

// ─── Piese ────────────────────────────────────────────────────────────────────

export async function fetchPiese(): Promise<PiesaCatalogMock[]> {
  // TODO: return await api.get('/catalog/piese');
  return Promise.resolve([...pieseCatalogMock]);
}

export async function createPiesa(
  data: Omit<PiesaCatalogMock, 'idPiesa'>,
): Promise<PiesaCatalogMock> {
  // TODO: return await api.post('/catalog/piese', data);
  return Promise.resolve({ ...data, idPiesa: Date.now() });
}

export async function updatePiesa(
  id: number,
  data: Partial<Omit<PiesaCatalogMock, 'idPiesa'>>,
): Promise<PiesaCatalogMock> {
  // TODO: return await api.put(`/catalog/piese/${id}`, data);
  const existing = pieseCatalogMock.find((p) => p.idPiesa === id);
  if (!existing) throw new Error(`Piesa cu id ${id} nu a fost găsită.`);
  return Promise.resolve({ ...existing, ...data });
}

export async function deletePiesa(): Promise<void> {
  // TODO: return await api.delete(`/catalog/piese/${id}`);
  return Promise.resolve();
}