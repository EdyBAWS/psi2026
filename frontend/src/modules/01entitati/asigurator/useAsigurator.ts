import { useState, useEffect, useMemo } from 'react';
import { fetchAsiguratori, saveAsigurator, schimbaStatusAsigurator, type AsiguratorEntity } from '../entitati.service';
import type { AsiguratorFormValues } from '../schemas';

export function useAsigurator() {
  const [asiguratori, setAsiguratori] = useState<AsiguratorEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [cautare, setCautare] = useState('');
  const [arataInactivi, setArataInactivi] = useState(false);

  const incarcaDate = async () => {
    setLoading(true);
    try {
      const data = await fetchAsiguratori();
      setAsiguratori(data);
    } catch (error) {
      console.error("Eroare la încărcarea datelor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    incarcaDate();
  }, []);

  const listaFiltrata = useMemo(() => {
    return asiguratori.filter((asig) => {
      const matchCautare = asig.denumire.toLowerCase().includes(cautare.toLowerCase()) || 
                           asig.CUI.toLowerCase().includes(cautare.toLowerCase());
      const matchStatus = arataInactivi ? true : asig.status === 'Activ';
      return matchCautare && matchStatus;
    });
  }, [asiguratori, cautare, arataInactivi]);

  const stats = useMemo(() => {
    return {
      totalActivi: asiguratori.filter(a => a.status === 'Activ').length
    };
  }, [asiguratori]);

  const salveaza = async (data: AsiguratorFormValues, id?: number) => {
    await saveAsigurator(data, id);
    await incarcaDate(); 
  };

  const schimbaStatus = async (id: number, status: 'Activ' | 'Inactiv') => {
    await schimbaStatusAsigurator(id, status);
    await incarcaDate(); 
  };

  return {
    listaFiltrata,
    loading,
    cautare,
    setCautare,
    arataInactivi,
    setArataInactivi,
    salveaza,
    schimbaStatus,
    stats
  };
}