// src/modules/00catalog/piese/usePiesa.ts

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  type CategoriePiesa,
  type PiesaCatalogMock,
  type TipPiesaCatalogMock,
} from '../../../mock/catalog';
import {
  createPiesa,
  deletePiesa,
  fetchPiese,
  updatePiesa,
  fetchIstoricPiesa,
} from '../catalog.service';

export type SortFieldPiesa = 'codPiesa' | 'denumire' | 'pretBaza' | 'stoc';
export type SortDir = 'asc' | 'desc';

const FORM_INIT: Partial<PiesaCatalogMock> = {
  tip: 'NOUA',
  categorie: 'Altele',
  stoc: 0,
};

export function usePiesa() {
  const [piese, setPiese] = useState<PiesaCatalogMock[]>([]);
  const [loading, setLoading] = useState(true);

  const [editId, setEditId] = useState<number | null>(null);
  const [arataFormular, setArataFormular] = useState(false);
  const [form, setForm] = useState<Partial<PiesaCatalogMock>>(FORM_INIT);

  // Istoric piese
  const [istoricCurent, setIstoricCurent] = useState<any[] | null>(null);
  const [loadingIstoric, setLoadingIstoric] = useState(false);

  const [cautare, setCautare] = useState('');
  const [filtruTip, setFiltruTip] = useState<TipPiesaCatalogMock | 'TOATE'>('TOATE');
  const [filtruCategorie, setFiltruCategorie] = useState<CategoriePiesa | 'TOATE'>('TOATE');
  const [sortField, setSortField] = useState<SortFieldPiesa>('denumire');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const loadData = () => {
    setLoading(true);
    fetchPiese()
      .then(setPiese)
      .catch(() => toast.error("Eroare la încărcarea datelor din baza de date."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSort = (field: SortFieldPiesa) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const pieseFiltrate = piese
    .filter(
      (p) =>
        (filtruTip === 'TOATE' || p.tip === filtruTip) &&
        (filtruCategorie === 'TOATE' || p.categorie === filtruCategorie) &&
        (p.codPiesa.toLowerCase().includes(cautare.toLowerCase()) ||
          p.denumire.toLowerCase().includes(cautare.toLowerCase()) ||
          p.producator.toLowerCase().includes(cautare.toLowerCase())),
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'codPiesa') cmp = a.codPiesa.localeCompare(b.codPiesa);
      if (sortField === 'denumire') cmp = a.denumire.localeCompare(b.denumire);
      if (sortField === 'pretBaza') cmp = a.pretBaza - b.pretBaza;
      if (sortField === 'stoc') cmp = a.stoc - b.stoc;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const handleSalvare = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId !== null) {
        const actualizata = await updatePiesa(editId, form);
        setPiese((prev) => prev.map((p) => (p.idPiesa === editId ? actualizata : p)));
        toast.success('Piesa a fost actualizată.');
      } else {
        const noua = await createPiesa(form as Omit<PiesaCatalogMock, 'idPiesa'>);
        setPiese((prev) => [noua, ...prev]);
        toast.success('Piesa a fost adăugată.');
      }
      handleInchideFormular();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleVeziIstoric = async (id: number) => {
    setLoadingIstoric(true);
    try {
      const data = await fetchIstoricPiesa(id);
      setIstoricCurent(data);
    } catch {
      toast.error("Nu s-a putut încărca istoricul.");
    } finally {
      setLoadingIstoric(false);
    }
  };

  const handleSterge = async (id: number) => {
    try {
      await deletePiesa(id);
      setPiese((prev) => prev.filter((p) => p.idPiesa !== id));
      toast.success('Piesa a fost ștearsă.');
    } catch (err: any) {
      // Aici primim eroarea de la backend dacă piesa are istoric
      toast.error(err.message);
    }
  };

  const handleEditeaza = (piesa: PiesaCatalogMock) => {
    setEditId(piesa.idPiesa);
    setForm({ ...piesa });
    setArataFormular(true);
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

  const valoareStoc = piese.reduce((acc, p) => acc + p.pretBaza * p.stoc, 0);
  const stocEpuizat = piese.filter((p) => p.stoc === 0).length;
  const stocCritic = piese.filter((p) => p.stoc > 0 && p.stoc < 5).length;

  return {
    piese, pieseFiltrate, loading, valoareStoc, stocEpuizat, stocCritic,
    form, setForm, editId, arataFormular, cautare, setCautare,
    filtruTip, setFiltruTip, filtruCategorie, setFiltruCategorie,
    sortField, sortDir, handleSort, handleSalvare, handleEditeaza,
    handleSterge, handleDeschideAdaugare, handleInchideFormular,
    istoricCurent, setIstoricCurent, loadingIstoric, handleVeziIstoric
  };
}
