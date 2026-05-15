// src/modules/01entitati/useAngajat.ts
import { useState, useEffect, useMemo } from 'react';
import { fetchAngajati, saveAngajat, schimbaStatusAngajat, type AngajatEntity } from '../entitati.service';
import type { AngajatFormValues } from '../schemas';

export function useAngajat() {
  const [lista, setLista] = useState<AngajatEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [cautare, setCautare] = useState('');
  const [arataInactivi, setArataInactivi] = useState(false);

  useEffect(() => {
    fetchAngajati().then(setLista).finally(() => setLoading(false));
  }, []);

  const listaFiltrata = useMemo(() => {
    return lista.filter(a => {
      if (!arataInactivi && a.status === 'Inactiv') return false;
      const matchText = `${a.nume} ${a.prenume} ${a.CNP || ''} ${a.specializare || ''}`.toLowerCase();
      return matchText.includes(cautare.toLowerCase());
    });
  }, [lista, cautare, arataInactivi]);

  const salveaza = async (data: AngajatFormValues, editId?: number) => {
    const payload = {
      ...data,
      sporConducere: (data.sporConducere !== undefined && !isNaN(data.sporConducere)) ? data.sporConducere : 0,
      costOrar: (data.costOrar !== undefined && !isNaN(data.costOrar)) ? data.costOrar : 0,
    };
    const saved = await saveAngajat(payload as any, editId);
    if (editId) {
      setLista(prev => prev.map(a => a.idAngajat === editId ? saved : a));
    } else {
      setLista(prev => [saved, ...prev]);
    }
  };

  const schimbaStatus = async (id: number, noulStatus: 'Activ' | 'Inactiv') => {
    await schimbaStatusAngajat(id, noulStatus);
    setLista(prev => prev.map(a => a.idAngajat === id ? { ...a, status: noulStatus } : a));
  };

  // Statistici
  const angajatiActivi = lista.filter(a => a.status === 'Activ');
  const totalMecanici = angajatiActivi.filter(a => a.tipAngajat === 'Mecanic').length;
  const totalManageri = angajatiActivi.filter(a => a.tipAngajat === 'Manager').length;
  const totalInspectori = angajatiActivi.filter(a => a.tipAngajat === 'Inspector' || a.esteInspector === true).length;

  return {
    listaFiltrata, loading, cautare, setCautare, arataInactivi, setArataInactivi,
    salveaza, schimbaStatus,
    stats: { totalActivi: angajatiActivi.length, totalMecanici, totalManageri, totalInspectori }
  };
}
