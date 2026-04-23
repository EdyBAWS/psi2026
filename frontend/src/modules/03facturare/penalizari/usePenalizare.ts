// src/modules/03facturare/penalizari/usePenalizare.ts
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { FacturareService } from '../facturare.service';

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

  // 1. Încărcarea datelor async
  useEffect(() => {
    Promise.all([
      FacturareService.fetchClienti(),
      FacturareService.fetchFacturiRestante()
    ]).then(([clientiData, facturiData]) => {
      setClientiBD(clientiData);
      setFacturiRestanteBD(facturiData);
      setLoading(false);
    });
  }, []);

  // 2. Procesarea datelor după încărcare
  const clientiCuRestante = useMemo(() => {
    return clientiBD
      .filter((client) => facturiRestanteBD.some((factura) => factura.idClient === client.idClient))
      .map((client) => ({
        idClient: client.idClient,
        nume: client.denumireCompanie ?? client.nume,
        soldDebitor: facturiRestanteBD
          .filter((factura) => factura.idClient === client.idClient)
          .reduce((total, factura) => total + factura.restDePlata, 0),
        CUI: client.email, // Ajustat conform mock-ului inițial
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
      await FacturareService.emitePenalizare({
        idFactura: factura.idFactura,
        zileIntarziere: calculePenalizare.zileIntarziere,
        procent: procentPenalizare,
        valoare: calculePenalizare.valoarePenalizare,
        numarFactura: numarFacturaPenalizare
      });

      toast.success(
        `Factura de penalizare PEN-${numarFacturaPenalizare} a fost emisă pentru ${calculePenalizare.valoarePenalizare.toFixed(2)} RON.`
      );

      setIdFacturaSelectata('');
      setNumarFacturaPenalizare('');
    } catch (error) {
      toast.error('Eroare la emiterea facturii de penalizare.');
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