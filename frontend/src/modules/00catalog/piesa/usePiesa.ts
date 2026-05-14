// src/modules/00catalog/piese/usePiesa.ts

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
  type PiesaCatalog, 
  type TipPiesaCatalog,
  type CategoriePiesa
} from '../../../types/catalog';
import {
  createPiesa,
  deletePiesa,
  fetchIstoricPiesa,
  fetchPiese,
  updatePiesa,
} from '../catalog.service';

export type SortFieldPiesa = 'codPiesa' | 'denumire' | 'pretBaza' | 'stoc';
export type SortDir = 'asc' | 'desc';

export const FORM_INIT: Partial<PiesaCatalog> = {
  denumire: '',
  codPiesa: '',
  producator: '',
  categorie: 'Altele',
  pretBaza: 0,
  stoc: 0,
  tip: 'NOUA',
};

export function usePiesa() {
  const [piese, setPiese] = useState<PiesaCatalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editareId, setEditareId] = useState<number | null>(null);
  const [arataFormular, setArataFormular] = useState(false);
  const [termenCautare, setTermenCautare] = useState('');

  // Istoric piese
  const [istoricCurent, setIstoricCurent] = useState<any[] | null>(null);
  const [loadingIstoric, setLoadingIstoric] = useState(false);

  // Filtre
  const [filtruCategorie, setFiltruCategorie] = useState<CategoriePiesa | 'TOATE'>('TOATE');
  const [filtruTip, setFiltruTip] = useState<TipPiesaCatalog | 'TOATE'>('TOATE');
  const [sortField, setSortField] = useState<SortFieldPiesa>('denumire');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const incarcaPiese = async () => {
    setLoading(true);
    try {
      const data = await fetchPiese();
      setPiese(data);
    } catch (err) {
      setError('Nu am putut încărca piesele din catalog.');
      toast.error("Eroare la încărcarea datelor din baza de date.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    incarcaPiese();
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
        (p.codPiesa.toLowerCase().includes(termenCautare.toLowerCase()) ||
          p.denumire.toLowerCase().includes(termenCautare.toLowerCase()) ||
          p.producator.toLowerCase().includes(termenCautare.toLowerCase())),
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'codPiesa') cmp = a.codPiesa.localeCompare(b.codPiesa);
      if (sortField === 'denumire') cmp = a.denumire.localeCompare(b.denumire);
      if (sortField === 'pretBaza') cmp = a.pretBaza - b.pretBaza;
      if (sortField === 'stoc') cmp = a.stoc - b.stoc;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const handleSalvare = async (data: any) => {
    try {
      if (editareId !== null) {
        const actualizata = await updatePiesa(editareId, data);
        setPiese((prev) => prev.map((p) => (p.idPiesa === editareId ? actualizata : p)));
        toast.success('Piesa a fost actualizată.');
      } else {
        const noua = await createPiesa(data as Omit<PiesaCatalog, 'idPiesa'>);
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

  const handleEditeaza = (piesa: PiesaCatalog) => {
    setEditareId(piesa.idPiesa);
    setArataFormular(true);
  };

  const handleInchideFormular = () => {
    setArataFormular(false);
    setEditareId(null);
  };

  const handleDeschideAdaugare = () => {
    setEditareId(null);
    setArataFormular(true);
  };

  const valoareStoc = piese.reduce((acc, p) => acc + p.pretBaza * p.stoc, 0);
  const stocEpuizat = piese.filter((p) => p.stoc === 0).length;
  const stocCritic = piese.filter((p) => p.stoc > 0 && p.stoc < 5).length;

  return {
    piese, pieseFiltrate, loading, error, valoareStoc, stocEpuizat, stocCritic,
    editareId, arataFormular, termenCautare, setTermenCautare,
    filtruTip, setFiltruTip, filtruCategorie, setFiltruCategorie,
    sortField, sortDir, handleSort, handleSalvare, handleEditeaza,
    handleSterge, handleDeschideAdaugare, handleInchideFormular,
    istoricCurent, setIstoricCurent, loadingIstoric, handleVeziIstoric
  };
}

