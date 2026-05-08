import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchVehicule, fetchClienti, saveVehicul, schimbaStatusVehicul } from '../entitati.service';
import type { VehiculEntity, ClientEntity, VehiculFormValues } from '../entitati.service';

export type SortField = 'numarInmatriculare' | 'numeDetinator' | 'marca' | 'status';
export type SortDirection = 'asc' | 'desc';

export function useVehicul() {
  const [vehicule, setVehicule] = useState<VehiculEntity[]>([]);
  const [clienti, setClienti] = useState<ClientEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [cautare, setCautare] = useState("");
  
  const [sortField, setSortField] = useState<SortField>('numarInmatriculare');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const incarcaDate = useCallback(async () => {
    setLoading(true);
    try {
      const [v, c] = await Promise.all([fetchVehicule(), fetchClienti()]);
      setVehicule(v);
      setClienti(c);
    } catch (error) {
      console.error("Eroare la preluarea datelor:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    incarcaDate();
  }, [incarcaDate]);

  const onSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else { 
      setSortField(field); 
      setSortDir('asc'); 
    }
  };

  const vehiculeProcesate = useMemo(() => {
    return vehicule.map((vehicul: any) => {
      const client = vehicul.client || clienti.find(c => c.idClient === vehicul.idClient);
      const numeDetinator = client 
        ? (client.tipClient === 'PJ' ? client.nume : `${client.nume} ${client.prenume || ""}`).trim() 
        : "Necunoscut";
      
      const comenziDirecte = vehicul.comenzi || [];
      const comenziDinDosare = (vehicul.dosareDauna || []).flatMap((d: any) => d.comenzi || []);
      
      const istoricComenzi = [...comenziDirecte, ...comenziDinDosare].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return { ...vehicul, clientObj: client, numeDetinator, istoricComenzi };
    });
  }, [vehicule, clienti]);

  const vehiculeFiltrateSiSortate = useMemo(() => {
    let rezultat = vehiculeProcesate;
    if (cautare) {
      const term = cautare.toLowerCase();
      rezultat = rezultat.filter(v => 
        v.numarInmatriculare.toLowerCase().includes(term) ||
        v.numeDetinator.toLowerCase().includes(term) ||
        (v.vin && v.vin.toLowerCase().includes(term))
      );
    }

    return rezultat.sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [vehiculeProcesate, cautare, sortField, sortDir]);

  const stats = useMemo(() => ({
    total: vehicule.length,
    activi: vehicule.filter(v => v.status === 'Activ').length
  }), [vehicule]);

  const salveaza = async (data: VehiculFormValues, id?: number) => {
    await saveVehicul(data, id);
    await incarcaDate(); 
  };

  const sterge = async (id: number) => {
    await schimbaStatusVehicul(id, 'Inactiv');
    await incarcaDate();
  };

  return {
    vehiculeFiltrateSiSortate,
    clienti,
    loading,
    cautare,
    setCautare,
    sortField,
    sortDir,
    onSort,
    stats,
    salveaza,
    sterge
  };
}