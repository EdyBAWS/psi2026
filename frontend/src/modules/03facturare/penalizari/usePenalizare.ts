// src/modules/03facturare/penalizari/usePenalizare.ts
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

export function usePenalizare() {
  const [clientiBD, setClientiBD] = useState<any[]>([]);
  const [facturiRestanteBD, setFacturiRestanteBD] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [idClientSelectat, setIdClientSelectat] = useState<number | ''>('');
  const [idFacturaSelectata, setIdFacturaSelectata] = useState<number | ''>('');

  const [searchTermClient, setSearchTermClient] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const [dataCalcul, setDataCalcul] = useState<string>(new Date().toISOString().split('T')[0]);
  const [procentPenalizare, setProcentPenalizare] = useState<number>(1);
  const [numarFacturaPenalizare, setNumarFacturaPenalizare] = useState<string>('');

  // 1. Încărcarea datelor reale (Clienți + Facturi) din backend-ul NestJS
  useEffect(() => {
    const fetchToateDatele = async () => {
      try {
        const [resClienti, resFacturi] = await Promise.all([
          fetch('http://localhost:3000/entitati/clienti'),
          fetch('http://localhost:3000/facturare')
        ]);

        const dataClienti = resClienti.ok ? await resClienti.json() : [];
        const dataFacturi = resFacturi.ok ? await resFacturi.json() : [];

        // Mapăm clienții pentru a se potrivi cu logica ta existentă
        const clientiMapati = dataClienti.map((c: any) => ({
          idClient: c.id || c.idClient,
          nume: c.numeFirma || c.nume || 'Client Necunoscut',
          email: c.email || c.cui || 'N/A' // UI-ul folosește email-ul în loc de CUI în structura veche
        }));

        // Mapăm facturile
        // Mapăm facturile
        const facturiMapate = dataFacturi.map((f: any) => {
          // Tăiem data exact în formatul YYYY-MM-DD cerut de input-ul HTML
          const dataFormatata = f.scadenta 
            ? new Date(f.scadenta).toISOString().split('T')[0] 
            : '';

          return {
            idFactura: f.idFactura || f.id,
            idClient: f.idClient,
            numar: `${f.serie}-${f.numar}`,
            restDePlata: f.totalGeneral || 0,
            dataScadenta: dataFormatata
          };
        });

        setClientiBD(clientiMapati);
        setFacturiRestanteBD(facturiMapate);
      } catch (error) {
        console.error('Eroare la preluarea datelor:', error);
        toast.error('A apărut o eroare la încărcarea datelor din baza de date.');
      } finally {
        setLoading(false);
      }
    };

    fetchToateDatele();
  }, []);

  // 2. Procesarea datelor
  const clientiCuRestante = useMemo(() => {
    return clientiBD
      .filter((client) => facturiRestanteBD.some((factura) => factura.idClient === client.idClient))
      .map((client) => ({
        idClient: client.idClient,
        nume: client.nume,
        soldDebitor: facturiRestanteBD
          .filter((factura) => factura.idClient === client.idClient)
          .reduce((total, factura) => total + factura.restDePlata, 0),
        CUI: client.email,
      }));
  }, [clientiBD, facturiRestanteBD]);

  const clientiFiltrati = useMemo(() => {
    if (!searchTermClient) return clientiCuRestante;
    const term = searchTermClient.toLowerCase();
    return clientiCuRestante.filter(
      (client) =>
        client.nume.toLowerCase().includes(term) || client.CUI.toLowerCase().includes(term)
    );
  }, [clientiCuRestante, searchTermClient]);

  const facturiClient = useMemo(
    () => facturiRestanteBD.filter((factura) => factura.idClient === idClientSelectat),
    [idClientSelectat, facturiRestanteBD]
  );

  const factura = useMemo(
    () => facturiClient.find((item) => item.idFactura === idFacturaSelectata) || null,
    [idFacturaSelectata, facturiClient]
  );

  const handleSelectClient = (client: any) => {
    setIdClientSelectat(client.idClient);
    setSearchTermClient(`${client.nume} (${client.CUI})`);
    setIsClientDropdownOpen(false);
    setIdFacturaSelectata('');
  };

  const calculePenalizare = useMemo(() => {
    if (!factura) return { zileIntarziere: 0, valoarePenalizare: 0 };

    const scadenta = new Date(factura.dataScadenta);
    const calcul = new Date(dataCalcul);

    const diferentaTimp = calcul.getTime() - scadenta.getTime();
    const zileIntarziere = Math.ceil(diferentaTimp / (1000 * 3600 * 24));

    const zileValide = zileIntarziere > 0 ? zileIntarziere : 0;
    const valoare = factura.restDePlata * (procentPenalizare / 100) * zileValide;

    return { zileIntarziere: zileValide, valoarePenalizare: valoare };
  }, [factura, dataCalcul, procentPenalizare]);

  const handleGenereazaPenalizare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factura || calculePenalizare.zileIntarziere <= 0) {
      toast.error('Nu există zile de întârziere pentru a putea emite o penalizare.');
      return;
    }
    if (!numarFacturaPenalizare) {
      toast.error('Introdu un număr pentru factura de penalizare.');
      return;
    }

    try {
      // Trimitem penalizarea către backend ca pe o factură specială (Seria PEN)
      const payloadPenalizare = {
        numar: Number(numarFacturaPenalizare),
        serie: "PEN",
        idClient: idClientSelectat,
        scadenta: new Date().toISOString(), // Facturile de penalizare se plătesc imediat
        iteme: [
          {
            descriere: `Penalizare întârziere (${calculePenalizare.zileIntarziere} zile) pt. factura ${factura.numar}`,
            cantitate: 1,
            pretUnitar: calculePenalizare.valoarePenalizare
          }
        ]
      };

      const response = await fetch('http://localhost:3000/facturare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadPenalizare),
      });

      if (!response.ok) {
        throw new Error('Eroare de la server');
      }

      toast.success(
        `Factura de penalizare PEN-${numarFacturaPenalizare} a fost emisă și salvată cu succes!`
      );

      // Resetăm formularul
      setIdFacturaSelectata('');
      setNumarFacturaPenalizare('');
    } catch (error) {
      console.error(error);
      toast.error('Eroare la salvarea penalizării pe server.');
    }
  };

  return {
    loading,
    clientiFiltrati, facturiClient, factura,
    idClientSelectat, setIdClientSelectat,
    idFacturaSelectata, setIdFacturaSelectata,
    searchTermClient, setSearchTermClient,
    isClientDropdownOpen, setIsClientDropdownOpen,
    dataCalcul, setDataCalcul,
    procentPenalizare, setProcentPenalizare,
    numarFacturaPenalizare, setNumarFacturaPenalizare,
    calculePenalizare,
    handleSelectClient, handleGenereazaPenalizare
  };
}