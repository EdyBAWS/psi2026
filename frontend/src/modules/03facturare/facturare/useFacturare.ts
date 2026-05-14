import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { usePageSessionState } from '../../../lib/pageState';
import { FacturareService } from '../facturare.service';
import { recordConsumPiesa } from '../../00catalog/catalog.service';
import { API_BASE_URL } from '../../../lib/api';
import { type ComandaFacturabila, type LinieFactura } from '../../../types/facturare';

export type FacturareSortField = 'data' | 'nrComanda' | 'valoare';
export type FacturareSortDir = 'asc' | 'desc';

export function useFacturare() {
  const [comenziGata, setComenziGata] = useState<ComandaFacturabila[]>([]);
  const [comandaSelectata, setComandaSelectata] = useState<ComandaFacturabila | null>(null);
  const [liniiFactura, setLiniiFactura] = useState<LinieFactura[]>([]);
  const [loading, setLoading] = useState(true);

  const [serieFactura, setSerieFactura] = useState('F-SAG');
  const [numarFactura, setNumarFactura] = useState('');
  const [termenPlata, setTermenPlata] = useState<number>(0);
  const [discountProcent, _setDiscountProcent] = useState<number>(0);
  const setDiscountProcent = (val: number) => {
    if (val < 0) _setDiscountProcent(0);
    else if (val > 100) _setDiscountProcent(100);
    else _setDiscountProcent(val);
  };

  const [cautare, setCautare] = usePageSessionState('facturare-cautare', '');
  const [sortField, setSortField] = usePageSessionState<FacturareSortField>('facturare-sort-field', 'data');
  const [sortDir, setSortDir] = usePageSessionState<FacturareSortDir>('facturare-sort-dir', 'desc');

  const incarcaComenzi = useCallback(async () => {
    setLoading(true);
    try {
      const data = await FacturareService.fetchComenziFacturabile();
      setComenziGata(data);

      // --- LOGICA DE REDIRECȚIONARE ȘI DESCHIDERE AUTOMATĂ ---
      // Verificăm dacă avem o comandă trimisă din alt modul (ex: Vehicule)
      const idSalvat = sessionStorage.getItem('facturare-idComandaSelectata');
      if (idSalvat) {
        // Rezolvare eroare TS7006: specificăm explicit tipul (c: ComandaFacturabila)
        const comandaDeDeschis = data.find((c: ComandaFacturabila) => c.idComanda.toString() === idSalvat);
        if (comandaDeDeschis) {
          setComandaSelectata(comandaDeDeschis);
        } else {
          toast.error("Comanda selectată nu a fost găsită sau nu este finalizată.");
        }
        // Curățăm storage-ul pentru a nu bloca aplicația pe această comandă la viitoarele refresh-uri
        sessionStorage.removeItem('facturare-idComandaSelectata');
      }

    } catch (error) {
      console.error("Eroare încărcare comenzi facturabile:", error); // Rezolvare eroare ESLint
      toast.error('Eroare la încărcarea datelor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    incarcaComenzi(); 
  }, [incarcaComenzi]);

  useEffect(() => {
    if (comandaSelectata) {
      FacturareService.fetchLiniiFactura(comandaSelectata.idComanda).then(setLiniiFactura);
    } else {
      setLiniiFactura([]);
    }
  }, [comandaSelectata]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/facturare/next-number`)
      .then(res => res.text())
      .then(text => setNumarFactura(text))
      .catch(err => console.error("Eroare preluare numar factura urmator:", err));
  }, []);

  const comenziFiltrate = useMemo(() => {
    const termen = cautare.trim().toLowerCase();
    return [...comenziGata]
      .filter((c) => !termen || c.nrComanda.toLowerCase().includes(termen) || c.client.toLowerCase().includes(termen))
      .sort((a, b) => {
        const valA = a[sortField === 'valoare' ? 'totalEstimat' : sortField === 'data' ? 'dataComanda' : 'nrComanda'];
        const valB = b[sortField === 'valoare' ? 'totalEstimat' : sortField === 'data' ? 'dataComanda' : 'nrComanda'];
        return sortDir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
  }, [cautare, comenziGata, sortDir, sortField]);

  // Calculăm suma totală a comenzilor gata de facturare
  const totalValoareFacturabila = useMemo(() => {
    return comenziGata.reduce((acc, c) => acc + (c.totalEstimat || 0), 0);
  }, [comenziGata]);

  const { subtotal, valoareDiscount, valoareTVA, totalPlata, dataScadenta } = useMemo(() => {
    const sub = liniiFactura.reduce((acc, l) => acc + (l.cantitate * l.pretUnitar), 0);
    const disc = sub * (discountProcent / 100);
    const subDupaDiscount = sub - disc;
    const tva = subDupaDiscount * 0.19;

    const scadenta = new Date();
    scadenta.setDate(scadenta.getDate() + termenPlata);

    return { 
      subtotal: sub, 
      valoareDiscount: disc,
      valoareTVA: tva, 
      totalPlata: subDupaDiscount + tva, 
      dataScadenta: scadenta.toISOString().split('T')[0] 
    };
  }, [liniiFactura, discountProcent, termenPlata]);

  const handleEmitereFactura = async () => {
    if (!comandaSelectata || !numarFactura) return toast.error('Completarea datelor este obligatorie.');
    if (discountProcent < 0 || discountProcent > 100) return toast.error('Discountul trebuie să fie între 0 și 100%.');
    if (!comandaSelectata.idClient) return toast.error('Comanda selectată nu are un client valid asociat.');

    try {
      // 1. Emitem factura către API
      const resFactura = await fetch(`${API_BASE_URL}/facturare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numar: Number(numarFactura),
          serie: serieFactura,
          idClient: comandaSelectata.idClient,
          idComanda: comandaSelectata.idComanda,
          scadenta: new Date(dataScadenta).toISOString(),
          discountProcent: discountProcent,
          iteme: liniiFactura.map(l => ({ 
            descriere: l.denumire, 
            cantitate: l.cantitate, 
            pretUnitar: l.pretUnitar,
            idPiesa: l.idPiesa,
            idKit: l.idKit,
            idManopera: l.idManopera
          }))
        })
      });

      if (!resFactura.ok) throw new Error("Eroare HTTP " + resFactura.status);

      // 2. Actualizăm statusul comenzii la "FACTURAT" în baza de date
      await fetch(`${API_BASE_URL}/operational/comenzi/${comandaSelectata.idComanda}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'FACTURAT' })
      });

      // 3. Actualizăm stocul și istoricul pentru piese și kit-uri (via Backend)
      for (const item of liniiFactura) {
        try {
          if (item.tip === 'Piesa' && item.idPiesa) {
            await recordConsumPiesa({
              idPiesa: item.idPiesa,
              idComanda: comandaSelectata.idComanda,
              cantitate: item.cantitate,
              dataComanda: new Date().toISOString(),
              numeAngajat: "Sistem Facturare"
            });
          }
        } catch (err) {
          console.error(`Eroare actualizare stoc pentru ${item.tip} ${item.idLinie}:`, err);
        }
      }

      toast.success(`Factura ${serieFactura}-${numarFactura} a fost salvată!`);
      setComandaSelectata(null);
      fetch(`${API_BASE_URL}/facturare/next-number`)
        .then(res => res.text())
        .then(text => setNumarFactura(text))
        .catch(err => console.error(err));
      await incarcaComenzi();
    } catch (error) {
      console.error("Eroare la emiterea facturii:", error); // Rezolvare eroare ESLint
      toast.error('Eroare la salvarea facturii.');
    }
  };

  return {
    loading, comenziGata, comenziFiltrate, totalValoareFacturabila,
    comandaSelectata, setComandaSelectata,
    cautare, setCautare, sortField, sortDir,
    handleSort: (f: FacturareSortField) => { setSortField(f); setSortDir(prev => prev === 'asc' ? 'desc' : 'asc'); },
    serieFactura, setSerieFactura, numarFactura, setNumarFactura,
    termenPlata, setTermenPlata, discountProcent, setDiscountProcent,
    liniiFactura, subtotal, valoareDiscount, valoareTVA, totalPlata, dataScadenta,
    handleEmitereFactura
  };
}
