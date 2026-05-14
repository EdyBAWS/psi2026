import { useState, useEffect } from 'react';
import { fetchKituri, createKit, updateKit, deleteKit, fetchPiese } from '../catalog.service';

export function useKituri() {
  const [kituri, setKituri] = useState<any[]>([]);
  const [pieseInventar, setPieseInventar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cautare, setCautare] = useState('');

  const [arataFormular, setArataFormular] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [form, setForm] = useState<any>({
    codKit: '',
    denumire: '',
    reducere: 0,
    piese: []
  });

  useEffect(() => {
    Promise.all([fetchKituri(), fetchPiese()]).then(([k, p]) => {
      setKituri(k);
      setPieseInventar(p);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const kituriFiltrate = kituri.filter(k => 
    k.denumire.toLowerCase().includes(cautare.toLowerCase()) || 
    k.codKit.toLowerCase().includes(cautare.toLowerCase())
  );

  const totalKituri = kituri.length;
  const reducereMaxima = kituri.length > 0 ? Math.max(...kituri.map(k => k.reducere || 0)) : 0;
  const valoareMedieKit = kituri.length > 0 
    ? kituri.reduce((sum, k) => {
        const valoare = k.piese?.reduce((s: number, p: any) => s + (p.piesa?.pretBaza || 0) * p.cantitate, 0) || 0;
        return sum + valoare * (1 - (k.reducere || 0) / 100);
      }, 0) / kituri.length
    : 0;

  const handleDeschideAdaugare = () => {
    setForm({ codKit: '', denumire: '', reducere: 0, piese: [] });
    setEditId(null);
    setArataFormular(true);
  };

  const handleEditeaza = (kit: any) => {
    setForm({
      codKit: kit.codKit,
      denumire: kit.denumire,
      reducere: kit.reducere,
      piese: kit.piese.map((p: any) => ({
        idPiesa: p.idPiesa,
        cantitate: p.cantitate
      }))
    });
    setEditId(kit.idKit);
    setArataFormular(true);
  };

  const handleInchideFormular = () => {
    setArataFormular(false);
    setEditId(null);
  };

  const handleSalvare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.piese.length < 2) {
      alert('Un kit trebuie să conțină cel puțin 2 piese!');
      return;
    }
    
    try {
      if (editId) {
        await updateKit(editId, form);
      } else {
        await createKit(form);
      }
      const data = await fetchKituri();
      setKituri(data);
      handleInchideFormular();
    } catch (error: any) {
      alert(error.message || 'A apărut o eroare la salvarea kit-ului.');
    }
  };

  const handleSterge = async (id: number) => {
    try {
      await deleteKit(id);
      setKituri(kituri.filter(k => k.idKit !== id));
    } catch (error: any) {
      alert(error.message || 'Nu s-a putut șterge kit-ul.');
    }
  };

  return {
    kituri,
    kituriFiltrate,
    pieseInventar,
    loading,
    form,
    setForm,
    editId,
    arataFormular,
    cautare,
    setCautare,
    handleSalvare,
    handleEditeaza,
    handleSterge,
    handleDeschideAdaugare,
    handleInchideFormular,
    totalKituri,
    reducereMaxima,
    valoareMedieKit
  };
}

