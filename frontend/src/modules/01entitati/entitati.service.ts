// src/modules/01entitati/entitati.service.ts
import type { ClientFormValues, AngajatFormValues, AsiguratorFormValues } from './schemas';

export type ClientEntity = ClientFormValues & { idClient: number };
export type AngajatEntity = AngajatFormValues & { idAngajat: number };
export type AsiguratorEntity = AsiguratorFormValues & { idAsigurator: number };

// --- MOCK DATA ---
let mockClienti: ClientEntity[] = [
  { idClient: 1, tipClient: 'PJ', nume: 'SC Auto Fleet SRL', CUI: 'RO9876543', telefon: '021 440 55 90', email: 'service@autofleet.ro', adresa: 'Bucuresti', soldDebitor: 1550, status: 'Activ' },
  { idClient: 2, tipClient: 'PF', nume: 'Popescu', prenume: 'Ion', CNP: '1800101223344', serieCI: 'XZ123456', telefon: '0722 445 781', email: 'ion@gmail.com', adresa: 'Iasi', soldDebitor: 0, status: 'Activ' }
];

let mockAngajati: AngajatEntity[] = [
  { idAngajat: 1, nume: 'Dumitrescu', prenume: 'Sorin', CNP: '1234567890123', telefon: '0721 100 204', email: 'sorin@service.ro', tipAngajat: 'Manager', departament: 'Operațional', status: 'Activ' },
  { idAngajat: 2, nume: 'Ionescu', prenume: 'Mihai', CNP: '1900101223344', telefon: '0721 100 201', email: 'mihai@service.ro', tipAngajat: 'Mecanic', specializare: 'Mecanică generală', costOrar: 150, status: 'Activ' }
];

let mockAsiguratori: AsiguratorEntity[] = [
  { idAsigurator: 1, denumire: 'Allianz-Țiriac', CUI: 'RO6120740', telefon: '021 208 22 22', status: 'Activ' },
  { idAsigurator: 2, denumire: 'Groupama', CUI: 'RO6291812', telefon: '021 302 92 00', status: 'Activ' }
];

// --- CLIENTI ---
export async function fetchClienti() { return [...mockClienti]; }
export async function saveClient(data: ClientFormValues, id?: number) {
  if (id) {
    mockClienti = mockClienti.map(c => c.idClient === id ? { ...data, idClient: id } : c);
    return mockClienti.find(c => c.idClient === id)!;
  }
  const newEntity = { ...data, idClient: Date.now() };
  mockClienti = [newEntity, ...mockClienti];
  return newEntity;
}
export async function schimbaStatusClient(id: number, status: 'Activ' | 'Inactiv') {
  mockClienti = mockClienti.map(c => c.idClient === id ? { ...c, status } : c);
}

// --- ANGAJATI ---
export async function fetchAngajati() { return [...mockAngajati]; }
export async function saveAngajat(data: AngajatFormValues, id?: number) {
  if (id) {
    mockAngajati = mockAngajati.map(a => a.idAngajat === id ? { ...data, idAngajat: id } : a);
    return mockAngajati.find(a => a.idAngajat === id)!;
  }
  const newEntity = { ...data, idAngajat: Date.now() };
  mockAngajati = [newEntity, ...mockAngajati];
  return newEntity;
}
export async function schimbaStatusAngajat(id: number, status: 'Activ' | 'Inactiv') {
  mockAngajati = mockAngajati.map(a => a.idAngajat === id ? { ...a, status } : a);
}

// --- ASIGURATORI ---
export async function fetchAsiguratori() { return [...mockAsiguratori]; }
export async function saveAsigurator(data: AsiguratorFormValues, id?: number) {
  if (id) {
    mockAsiguratori = mockAsiguratori.map(a => a.idAsigurator === id ? { ...data, idAsigurator: id } : a);
    return mockAsiguratori.find(a => a.idAsigurator === id)!;
  }
  const newEntity = { ...data, idAsigurator: Date.now() };
  mockAsiguratori = [newEntity, ...mockAsiguratori];
  return newEntity;
}
export async function schimbaStatusAsigurator(id: number, status: 'Activ' | 'Inactiv') {
  mockAsiguratori = mockAsiguratori.map(a => a.idAsigurator === id ? { ...a, status } : a);
}