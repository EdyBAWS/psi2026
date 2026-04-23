// src/modules/01entitati/useClient.ts
import { useState, useEffect, useMemo } from 'react';
import { fetchClienti, saveClient, schimbaStatusClient, type ClientEntity } from '../entitati.service';
import type { ClientFormValues } from '../schemas';

export function useClient() {
  const [lista, setLista] = useState<ClientEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [cautare, setCautare] = useState('');
  const [arataInactivi, setArataInactivi] = useState(false);

  useEffect(() => {
    fetchClienti().then(setLista).finally(() => setLoading(false));
  }, []);

  const listaFiltrata = useMemo(() => {
    return lista.filter(c => {
      if (!arataInactivi && c.status === 'Inactiv') return false;
      const matchText = `${c.nume} ${c.prenume || ''} ${c.CUI || ''} ${c.CNP || ''}`.toLowerCase();
      return matchText.includes(cautare.toLowerCase());
    });
  }, [lista, cautare, arataInactivi]);

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

  // Statistici
  const clientiActivi = lista.filter(c => c.status === 'Activ');
  const totalPJ = clientiActivi.filter(c => c.tipClient === 'PJ').length;
  const soldTotal = clientiActivi.reduce((acc, c) => acc + (c.soldDebitor || 0), 0);

  return {
    listaFiltrata, loading, cautare, setCautare, arataInactivi, setArataInactivi,
    salveaza, schimbaStatus,
    stats: { totalActivi: clientiActivi.length, totalPJ, soldTotal }
  };
}