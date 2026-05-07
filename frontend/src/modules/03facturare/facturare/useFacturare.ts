// src/modules/03facturare/useFacturare.ts
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { usePageSessionState } from '../../../lib/pageState';
import { FacturareService } from '../facturare.service';
import { API_BASE_URL } from '../../../lib/api';
import type { ComandaFacturabilaMock, LinieFacturaMock } from '../../../mock/types';

export type FacturareSortField = 'data' | 'nrComanda' | 'valoare';
export type FacturareSortDir = 'asc' | 'desc';

interface BackendClient {
  idClient: number;
  nume: string;
  prenume?: string | null;
}

const normalizeazaText = (valoare: string) =>
  valoare
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const scorPotrivireClient = (clientBackend: BackendClient, numeComanda: string) => {
  const tinta = normalizeazaText(numeComanda);
  const variante = [
    clientBackend.nume,
    `${clientBackend.nume} ${clientBackend.prenume ?? ''}`,
    `${clientBackend.prenume ?? ''} ${clientBackend.nume}`,
  ].map(normalizeazaText);

  return variante.some((varianta) => varianta && (tinta.includes(varianta) || varianta.includes(tinta)));
};

async function rezolvaIdClientPentruComanda(comanda: ComandaFacturabilaMock) {
  const response = await fetch(`${API_BASE_URL}/entitati/clienti`);
  if (!response.ok) throw new Error('Nu s-au putut încărca clienții pentru facturare.');

  const clienti = (await response.json()) as BackendClient[];
  const clientGasit = clienti.find((client) => scorPotrivireClient(client, comanda.client));

  return clientGasit?.idClient ?? clienti[0]?.idClient;
}

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

    try {
      const idClient = await rezolvaIdClientPentruComanda(comandaSelectata);

      if (!idClient) {
        toast.error('Nu există niciun client valid în backend pentru emiterea facturii.');
        return;
      }

      const dateBackend = {
        numar: Number(numarFactura),
        serie: serieFactura,
        idClient,
        idComanda: comandaSelectata.idComanda,
        scadenta: new Date(dataScadenta).toISOString(),
        iteme: liniiFactura.map((linie) => ({
          descriere: linie.denumire,
          cantitate: linie.cantitate,
          pretUnitar: linie.pretUnitar,
        }))
      };

      const response = await fetch(`${API_BASE_URL}/facturare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dateBackend),
      });

      if (!response.ok) {
        throw new Error('Eroare de la server');
      }

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
