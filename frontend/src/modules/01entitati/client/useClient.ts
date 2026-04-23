// src/modules/01entitati/client/useClient.ts
import { useState, useEffect, useMemo } from 'react';
import { fetchClienti, saveClient, schimbaStatusClient, type ClientEntity } from '../entitati.service';
import type { ClientFormValues } from '../schemas';

// --- 1. Definim Tipurile de Sortare ---
export type SortFieldClient = 'nume' | 'telefon' | 'soldDebitor' | 'status';
export type SortDir = 'asc' | 'desc';

export function useClient() {
  const [lista, setLista] = useState<ClientEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stări pentru Filtrare
  const [cautare, setCautare] = useState('');
  const [arataInactivi, setArataInactivi] = useState(false);
  
  // --- 2. Stări pentru Sortare ---
  const [sortField, setSortField] = useState<SortFieldClient>('nume');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    fetchClienti().then(setLista).finally(() => setLoading(false));
  }, []);

  // --- 3. Funcție pentru schimbarea direcției/coloanei ---
  const toggleSort = (field: SortFieldClient) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const listaFiltrata = useMemo(() => {
    // 1. Filtrarea Datelor
    let filtered = lista.filter(c => {
      if (!arataInactivi && c.status === 'Inactiv') return false;
      const matchText = `${c.nume} ${c.prenume || ''} ${c.CUI || ''} ${c.CNP || ''}`.toLowerCase();
      return matchText.includes(cautare.toLowerCase());
    });

    // 2. Sortarea Datelor Filtrate
    filtered.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'nume':
          valA = a.nume.toLowerCase();
          valB = b.nume.toLowerCase();
          break;
        case 'telefon':
          valA = a.telefon;
          valB = b.telefon;
          break;
        case 'soldDebitor':
          valA = a.soldDebitor || 0;
          valB = b.soldDebitor || 0;
          break;
        case 'status':
          valA = a.status;
          valB = b.status;
          break;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [lista, cautare, arataInactivi, sortField, sortDir]);

  const salveaza = async (data: ClientFormValues, editId?: number) => {
    const saved = await saveClient(data, editId);
    if (editId) {
      setLista(prev => prev.map(c => c.idClient === editId ? saved : c));
    } else {
      setLista(prev => [saved, ...prev]);
    }
  };

  const schimbaStatus = async (id: number, noulStatus: 'Activ' | 'Inactiv') => {
    await schimbaStatusClient(id, noulStatus);
    setLista(prev => prev.map(c => c.idClient === id ? { ...c, status: noulStatus } : c));
  };

  const clientiActivi = lista.filter(c => c.status === 'Activ');
  const totalPJ = clientiActivi.filter(c => c.tipClient === 'PJ').length;
  const soldTotal = clientiActivi.reduce((acc, c) => acc + (c.soldDebitor || 0), 0);

  return {
    listaFiltrata, loading, cautare, setCautare, arataInactivi, setArataInactivi,
    salveaza, schimbaStatus,
    // --- 4. Exportăm uneltele de sortare către UI ---
    sortField, sortDir, toggleSort,
    stats: { totalActivi: clientiActivi.length, totalPJ, soldTotal }
  };
}