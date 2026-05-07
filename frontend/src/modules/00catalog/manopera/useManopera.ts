// src/modules/00catalog/manopera/useManopera.ts
//
// Hook ce centralizează toată logica de state pentru modulul Manoperă.
// Componenta Manopera.tsx devine astfel un simplu layer de prezentare,
// fără nicio logică de filtrare, sortare sau CRUD în interior.

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  type CategorieManopera,
  type ManoperaCatalogMock,
} from '../../../mock/catalog';
import {
  createManopera,
  deleteManopera,
  fetchManopera,
  updateManopera,
} from '../catalog.service';

export type SortFieldManopera = 'codManopera' | 'denumire' | 'durataStd';
export type SortDir = 'asc' | 'desc';

// Starea goală a formularului — reutilizată la reset după submit/anulare.
const FORM_INIT: Partial<ManoperaCatalogMock> = {
  categorie: 'Mecanică Ușoară',
};

export function useManopera() {
  const [lista, setLista] = useState<ManoperaCatalogMock[]>([]);
  const [loading, setLoading] = useState(true);

  // Stare formular — null înseamnă că nu se editează nimic (modul adăugare).
  const [editId, setEditId] = useState<number | null>(null);
  const [arataFormular, setArataFormular] = useState(false);
  const [form, setForm] = useState<Partial<ManoperaCatalogMock>>(FORM_INIT);

  // Filtre și sortare — nu modifică lista brută.
  const [cautare, setCautare] = useState('');
  const [filtruCategorie, setFiltruCategorie] = useState<CategorieManopera | 'TOATE'>('TOATE');
  const [sortField, setSortField] = useState<SortFieldManopera>('denumire');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Încărcăm datele o singură dată (sau de la API mai târziu).
  useEffect(() => {
    fetchManopera()
      .then(setLista)
      .finally(() => setLoading(false));
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
      return sortDir === 'asc' ? cmp : -cmp;
    });

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const handleSalvare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codManopera || !form.denumire || !form.durataStd) {
      toast.error('Completează toate câmpurile obligatorii.');
      return;
    }

    try {
      if (editId !== null) {
        // UPDATE
        const actualizata = await updateManopera(editId, form);
        setLista((prev) =>
          prev.map((m) => (m.idManopera === editId ? actualizata : m)),
        );
        toast.success('Operațiunea a fost actualizată.');
      } else {
        // INSERT
        const noua = await createManopera(
          form as Omit<ManoperaCatalogMock, 'idManopera'>,
        );
        setLista((prev) => [noua, ...prev]);
        toast.success('Operațiunea a fost adăugată în nomenclator.');
      }
      handleInchideFormular();
    } catch {
      toast.error('A apărut o eroare. Încearcă din nou.');
    }
  };

  const handleEditeaza = (item: ManoperaCatalogMock) => {
    setEditId(item.idManopera);
    setForm({ ...item });
    setArataFormular(true);
    // Scroll-ul la formular este gestionat de componentă via ref dacă e nevoie.
  };

const handleSterge = async (id: number) => {
  try {
    await deleteManopera(id); // <--- Adaugă id-ul aici
    setLista((prev) => prev.filter((m) => m.idManopera !== id));
    toast.success('Operațiunea a fost ștearsă.');
  } catch {
    toast.error('Ștergerea a eșuat.');
  }
};

  const handleInchideFormular = () => {
    setArataFormular(false);
    setEditId(null);
    setForm(FORM_INIT);
  };

  const handleDeschideAdaugare = () => {
    setEditId(null);
    setForm(FORM_INIT);
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
    mediaNorma,
    // Formular
    form,
    setForm,
    editId,
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