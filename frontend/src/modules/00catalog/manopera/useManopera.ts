// src/modules/00catalog/manopera/useManopera.ts
//
// Hook ce centralizează toată logica de state pentru modulul Manoperă.
// Componenta Manopera.tsx devine astfel un simplu layer de prezentare,
// fără nicio logică de filtrare, sortare sau CRUD în interior.

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
  type ManoperaCatalog, 
  type CategorieManopera
} from '../../../types/catalog';
import {
  createManopera,
  deleteManopera,
  fetchManopera,
  updateManopera,
} from '../catalog.service';

export type SortFieldManopera = 'codManopera' | 'denumire' | 'durataStd' | 'pretOra';
export type SortDir = 'asc' | 'desc';

// Starea goală a formularului — reutilizată la reset după submit/anulare.
export const FORM_INIT_MANOPERA: Partial<ManoperaCatalog> = {
  denumire: '',
  codManopera: '',
  categorie: 'Mecanică Ușoară',
  durataStd: 0,
  pretOra: 0,
};

export function useManopera() {
  const [lista, setLista] = useState<ManoperaCatalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stare formular — null înseamnă că nu se editează nimic (modul adăugare).
  const [editareId, setEditareId] = useState<number | null>(null);
  const [arataFormular, setArataFormular] = useState(false);

  // Filtre și sortare — nu modifică lista brută.
  const [cautare, setCautare] = useState('');
  const [filtruCategorie, setFiltruCategorie] = useState<CategorieManopera | 'TOATE'>('TOATE');
  const [sortField, setSortField] = useState<SortFieldManopera>('denumire');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const incarcaDate = async () => {
    setLoading(true);
    try {
      const data = await fetchManopera();
      setLista(data);
    } catch (err) {
      setError('Nu am putut încărca datele din catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    incarcaDate();
  }, []);

  // ── Sortare ──────────────────────────────────────────────────────────────────
  const handleSort = (field: SortFieldManopera) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  // ── Lista procesată (filtru + sort) ──────────────────────────────────────────
  const listaFiltrata = lista
    .filter((m) =>
      (filtruCategorie === 'TOATE' || m.categorie === filtruCategorie) &&
      (m.codManopera.toLowerCase().includes(cautare.toLowerCase()) ||
        m.denumire.toLowerCase().includes(cautare.toLowerCase())),
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'codManopera') cmp = a.codManopera.localeCompare(b.codManopera);
      if (sortField === 'denumire') cmp = a.denumire.localeCompare(b.denumire);
      if (sortField === 'durataStd') cmp = a.durataStd - b.durataStd;
      if (sortField === 'pretOra') cmp = (a.pretOra || 0) - (b.pretOra || 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const handleSalvare = async (data: any) => {
    try {
      if (editareId !== null) {
        // UPDATE
        const actualizata = await updateManopera(editareId, data);
        setLista((prev) =>
          prev.map((m) => (m.idManopera === editareId ? actualizata : m)),
        );
        toast.success('Operațiunea a fost actualizată.');
      } else {
        // INSERT
        const noua = await createManopera(
          data as Omit<ManoperaCatalog, 'idManopera'>,
        );
        setLista((prev) => [noua, ...prev]);
        toast.success('Operațiunea a fost adăugată în nomenclator.');
      }
      handleInchideFormular();
    } catch {
      toast.error('A apărut o eroare. Încearcă din nou.');
    }
  };

  const handleEditeaza = (item: ManoperaCatalog) => {
    setEditareId(item.idManopera);
    setArataFormular(true);
  };

const handleSterge = async (id: number) => {
  try {
    await deleteManopera(id);
    setLista((prev) => prev.filter((m) => m.idManopera !== id));
    toast.success('Operațiunea a fost ștearsă.');
  } catch {
    toast.error('Ștergerea a eșuat.');
  }
};

  const handleInchideFormular = () => {
    setArataFormular(false);
    setEditareId(null);
  };

  const handleDeschideAdaugare = () => {
    setEditareId(null);
    setArataFormular(true);
  };

  // Statistici derivate (nu recalculate dacă nu se schimbă lista).
  const mediaNorma =
    lista.length > 0
      ? lista.reduce((acc, m) => acc + m.durataStd, 0) / lista.length
      : 0;

  return {
    // Date
    lista,
    listaFiltrata,
    loading,
    error,
    mediaNorma,
    // Formular
    editareId,
    arataFormular,
    // Filtre
    cautare,
    setCautare,
    filtruCategorie,
    setFiltruCategorie,
    // Sortare
    sortField,
    sortDir,
    handleSort,
    // Acțiuni
    handleSalvare,
    handleEditeaza,
    handleSterge,
    handleDeschideAdaugare,
    handleInchideFormular,
  };
}
