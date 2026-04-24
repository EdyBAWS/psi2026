// src/modules/02operational/operational.service.ts
//
// Service layer pentru modulul operațional — aceeași structură ca catalog.service.ts
// și entitati.service.ts. Fiecare funcție are semnătura finală pentru API.
// La integrarea Spring Boot, înlocuiești doar corpul funcțiilor, nu și apelurile
// din hook-uri sau componente.
//
// Endpoint-uri Spring Boot anticipate:
//   GET    /api/comenzi
//   POST   /api/comenzi
//   PUT    /api/comenzi/{id}
//   GET    /api/comenzi/{id}/pozitii
//   POST   /api/comenzi/{id}/pozitii
//   GET    /api/dosare-dauna
//   POST   /api/dosare-dauna
//   GET    /api/vehicule
//   GET    /api/mecanici
//   GET    /api/clienti
//   GET    /api/asiguratori
//   GET    /api/catalog/piese
//   GET    /api/catalog/kituri
//   GET    /api/catalog/manopere

import {
  mockAsiguratori,
  mockCatalogKituri,
  mockCatalogManopera,
  mockCatalogPiese,
  mockClienti,
  mockComenzi,
  mockDosareDauna,
  mockMecanici,
  mockPozitii,
  mockVehicule,
} from "../../mock/operational";
import type {
  CatalogKit,
  CatalogManopera,
  CatalogPiesa,
  ComandaService,
  DosarDauna,
  Mecanic,
  PozitieComanda,
  Vehicul,
  Asigurator,
  Client,
} from "./types";

// ─── Comenzi ──────────────────────────────────────────────────────────────────

export async function fetchComenzi(): Promise<ComandaService[]> {
  // TODO: return await api.get('/api/comenzi');
  return Promise.resolve([...mockComenzi]);
}

export async function createComanda(
  data: Omit<ComandaService, "idComanda">,
): Promise<ComandaService> {
  // TODO: return await api.post('/api/comenzi', data);
  const idNou = mockComenzi.reduce((max, c) => Math.max(max, c.idComanda), 0) + 1;
  return Promise.resolve({ ...data, idComanda: idNou });
}

export async function updateComanda(
  id: number,
  data: Partial<Omit<ComandaService, "idComanda">>,
): Promise<ComandaService> {
  // TODO: return await api.put(`/api/comenzi/${id}`, data);
  const existenta = mockComenzi.find((c) => c.idComanda === id);
  if (!existenta) throw new Error(`Comanda cu id ${id} nu a fost găsită.`);
  return Promise.resolve({ ...existenta, ...data });
}

// ─── Pozitii Comanda ───────────────────────────────────────────────────────────

export async function fetchPozitiiComanda(
  idComanda?: number,
): Promise<PozitieComanda[]> {
  // TODO: return idComanda
  //   ? await api.get(`/api/comenzi/${idComanda}/pozitii`)
  //   : await api.get('/api/pozitii');
  const rezultat = idComanda
    ? mockPozitii.filter((p) => p.idComanda === idComanda)
    : [...mockPozitii];
  return Promise.resolve(rezultat);
}

export async function createPozitiiComanda(
  idComanda: number,
  pozitii: Omit<PozitieComanda, "idPozitieCmd" | "idComanda">[],
): Promise<PozitieComanda[]> {
  // TODO: return await api.post(`/api/comenzi/${idComanda}/pozitii`, pozitii);
  let nextId = mockPozitii.reduce((max, p) => Math.max(max, p.idPozitieCmd), 0) + 1;
  return Promise.resolve(
    pozitii.map((p) => ({
      ...p,
      idComanda,
      idPozitieCmd: nextId++,
    })),
  );
}

// ─── Dosare Dauna ──────────────────────────────────────────────────────────────

export async function fetchDosareDauna(): Promise<DosarDauna[]> {
  // TODO: return await api.get('/api/dosare-dauna');
  return Promise.resolve([...mockDosareDauna]);
}

export async function createDosarDauna(
  data: Omit<DosarDauna, "idDosar">,
): Promise<DosarDauna> {
  // TODO: return await api.post('/api/dosare-dauna', data);
  const idNou =
    mockDosareDauna.reduce((max, d) => Math.max(max, d.idDosar), 0) + 1;
  return Promise.resolve({ ...data, idDosar: idNou });
}

// ─── Entități de referință (read-only din perspectiva operaționalului) ─────────

export async function fetchVehicule(): Promise<Vehicul[]> {
  // TODO: return await api.get('/api/vehicule');
  return Promise.resolve([...mockVehicule]);
}

export async function fetchMecanici(): Promise<Mecanic[]> {
  // TODO: return await api.get('/api/mecanici');
  return Promise.resolve([...mockMecanici]);
}

export async function fetchClienti(): Promise<Client[]> {
  // TODO: return await api.get('/api/clienti');
  return Promise.resolve([...mockClienti]);
}

export async function fetchAsiguratori(): Promise<Asigurator[]> {
  // TODO: return await api.get('/api/asiguratori');
  return Promise.resolve([...mockAsiguratori]);
}

// ─── Catalog (read-only — scrisul se face din modulul 00catalog) ───────────────

export async function fetchCatalogPiese(): Promise<CatalogPiesa[]> {
  // TODO: return await api.get('/api/catalog/piese');
  return Promise.resolve([...mockCatalogPiese]);
}

export async function fetchCatalogKituri(): Promise<CatalogKit[]> {
  // TODO: return await api.get('/api/catalog/kituri');
  return Promise.resolve([...mockCatalogKituri]);
}

export async function fetchCatalogManopere(): Promise<CatalogManopera[]> {
  // TODO: return await api.get('/api/catalog/manopere');
  return Promise.resolve([...mockCatalogManopera]);
}