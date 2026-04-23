// src/modules/01entitati/useAsigurator.ts
import { useState, useEffect, useMemo } from 'react';
import { fetchAsiguratori, saveAsigurator, schimbaStatusAsigurator, type AsiguratorEntity } from '../entitati.service';
import type { AsiguratorFormValues } from '../schemas';

export function useAsigurator() {
  const [lista, setLista] = useState<AsiguratorEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [cautare, setCautare] = useState('');
  const [arataInactivi, setArataInactivi] = useState(false);

  useEffect(() => {
    fetchAsiguratori().then(setLista).finally(() => setLoading(false));
  }, []);

  const listaFiltrata = useMemo(() => {
    return lista.filter(a => {
      if (!arataInactivi && a.status === 'Inactiv') return false;
      const matchText = `${a.denumire} ${a.CUI || ''}`.toLowerCase();
      return matchText.includes(cautare.toLowerCase());
    });
  }, [lista, cautare, arataInactivi]);

  const salveaza = async (data: AsiguratorFormValues, editId?: number) => {
    const saved = await saveAsigurator(data, editId);
    if (editId) {
      setLista(prev => prev.map(a => a.idAsigurator === editId ? saved : a));
    } else {
      setLista(prev => [saved, ...prev]);
    }
  };

  const schimbaStatus = async (id: number, noulStatus: 'Activ' | 'Inactiv') => {
    await schimbaStatusAsigurator(id, noulStatus);
    setLista(prev => prev.map(a => a.idAsigurator === id ? { ...a, status: noulStatus } : a));
  };

  return {
    listaFiltrata, loading, cautare, setCautare, arataInactivi, setArataInactivi,
    salveaza, schimbaStatus,
    stats: { totalActivi: lista.filter(a => a.status === 'Activ').length }
  };
}