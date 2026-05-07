// src/modules/03facturare/useFacturare.ts
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { usePageSessionState } from '../../../lib/pageState';
import { FacturareService } from '../facturare.service';
import type { ComandaFacturabilaMock, LinieFacturaMock } from '../../../mock/types';

export type FacturareSortField = 'data' | 'nrComanda' | 'valoare';
export type FacturareSortDir = 'asc' | 'desc';

export function useFacturare() {
  const [comenziGata, setComenziGata] = useState<ComandaFacturabilaMock[]>([]);
  const [comandaSelectata, setComandaSelectata] = useState<ComandaFacturabilaMock | null>(null);
  const [liniiFactura, setLiniiFactura] = useState<LinieFacturaMock[]>([]);
  const [loading, setLoading] = useState(true);

  // Stare Formular Emitere
  const [serieFactura, setSerieFactura] = useState('F-SAG');
  const [numarFactura, setNumarFactura] = useState('');
  const [termenPlata, setTermenPlata] = useState<number>(0);
  const [discountProcent, setDiscountProcent] = useState<number>(0);

  // Stare Sesiune (Căutare & Sortare)
  const [cautare, setCautare] = usePageSessionState('facturare-cautare', '');
  const [sortField, setSortField] = usePageSessionState<FacturareSortField>('facturare-sort-field', 'data');
  const [sortDir, setSortDir] = usePageSessionState<FacturareSortDir>('facturare-sort-dir', 'desc');

  // Fetch Inițial Comenzi
  useEffect(() => {
    FacturareService.fetchComenziFacturabile().then((data) => {
      setComenziGata(data);
      setLoading(false);
    });
  }, []);

  // Fetch Linii când se selectează o comandă
  useEffect(() => {
    if (comandaSelectata) {
      FacturareService.fetchLiniiFactura(comandaSelectata.idComanda).then(setLiniiFactura);
    } else {
      setLiniiFactura([]);
    }
  }, [comandaSelectata]);

  const handleSort = (field: FacturareSortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
      return;
    }
    setSortField(field);
    setSortDir(field === 'data' ? 'desc' : 'asc');
  };

  const comenziFiltrate = useMemo(() => {
    const termen = cautare.trim().toLowerCase();
    return [...comenziGata]
      .filter((comanda) => {
        if (termen === '') return true;
        return [comanda.nrComanda, comanda.client, comanda.vehicul].some((camp) => 
          camp.toLowerCase().includes(termen)
        );
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'data') {
          comparison = a.dataComanda.localeCompare(b.dataComanda);
        } else if (sortField === 'nrComanda') {
          comparison = a.nrComanda.localeCompare(b.nrComanda);
        } else {
          comparison = a.totalEstimat - b.totalEstimat;
        }
        return sortDir === 'asc' ? comparison : -comparison;
      });
  }, [cautare, comenziGata, sortDir, sortField]);

  const totalValoareFacturabila = comenziGata.reduce((total, c) => total + c.totalEstimat, 0);

  const { subtotal, valoareTVA, valoareDiscount, totalPlata, dataScadenta } = useMemo(() => {
    const sub = liniiFactura.reduce((acc, linie) => acc + (linie.cantitate * linie.pretUnitar), 0);
    const disc = sub * (discountProcent / 100);
    const subDupaDiscount = sub - disc;
    const tva = subDupaDiscount * 0.19;

    const dataAzi = new Date();
    dataAzi.setDate(dataAzi.getDate() + termenPlata);

    return {
      subtotal: sub,
      valoareDiscount: disc,
      valoareTVA: tva,
      totalPlata: subDupaDiscount + tva,
      dataScadenta: dataAzi.toISOString().split('T')[0],
    };
  }, [liniiFactura, discountProcent, termenPlata]);

  const handleEmitereFactura = async () => {
    if (!comandaSelectata) {
      toast.error('Selectează o comandă înainte de emiterea facturii.');
      return;
    }
    if (!serieFactura || !numarFactura) {
      toast.error('Te rog completează seria și numărul facturii.');
      return;
    }

    // 1. Pregătim datele pentru backend exact în formatul DTO-ului din NestJS
    const dateBackend = {
      numar: Number(numarFactura),
      serie: serieFactura,
      idClient: 1, // Setăm 1 pentru că baza de date are deja clientul 1
      scadenta: new Date(dataScadenta).toISOString(),
      iteme: liniiFactura.map((linie) => ({
        descriere: linie.denumire,
        cantitate: linie.cantitate,
        pretUnitar: linie.pretUnitar,
        // Dăm un ID de piesă sau manoperă în funcție de tip
        ...(linie.tip === 'Manoperă' ? { idManopera: 1 } : { idPiesa: 1 })
      }))
    };

    try {
      // 2. Facem apelul REAL către baza de date
      const response = await fetch('http://localhost:3000/facturare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dateBackend),
      });

      if (!response.ok) {
        throw new Error('Eroare de la server');
      }

      // 3. Dacă totul e ok, finalizăm acțiunea
      toast.success(`Factura ${serieFactura}-${numarFactura} a fost emisă și salvată în baza de date!`);
      
      setComenziGata((prev) => prev.filter((c) => c.idComanda !== comandaSelectata.idComanda));
      setComandaSelectata(null);
      setNumarFactura('');
      setDiscountProcent(0);
      setTermenPlata(0);
    } catch (error) {
      console.error(error);
      toast.error('A apărut o eroare la salvarea facturii în baza de date.');
    }
  };

  return {
    loading,
    comenziGata, comenziFiltrate, totalValoareFacturabila,
    comandaSelectata, setComandaSelectata,
    cautare, setCautare, sortField, sortDir, handleSort,
    serieFactura, setSerieFactura, numarFactura, setNumarFactura,
    termenPlata, setTermenPlata, discountProcent, setDiscountProcent,
    liniiFactura, subtotal, valoareTVA, valoareDiscount, totalPlata, dataScadenta,
    handleEmitereFactura
  };
}