// src/modules/03facturare/oferte/useOferta.ts
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { FacturareService } from '../facturare.service';
import type { FacturaMock, LinieFacturaMock } from '../../../mock/types';

export function useOferta() {
  const [facturiEmise, setFacturiEmise] = useState<FacturaMock[]>([]);
  const [liniiFactura, setLiniiFactura] = useState<LinieFacturaMock[]>([]);
  const [loading, setLoading] = useState(true);

  const [idFacturaSelectata, setIdFacturaSelectata] = useState<number | ''>('');
  const [tipOperatiune, setTipOperatiune] = useState<'discount' | 'storno'>('discount');

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [tipDiscount, setTipDiscount] = useState<'procent' | 'valoare'>('procent');
  const [valoareDiscount, setValoareDiscount] = useState<number>(0);
  const [motivOperatiune, setMotivOperatiune] = useState('');
  const [liniiStorno, setLiniiStorno] = useState<number[]>([]);

  // 1. Încărcarea datelor inițiale
  useEffect(() => {
    FacturareService.fetchFacturiEmise().then((data) => {
      setFacturiEmise(data);
      setLoading(false);
    });
  }, []);

  // 2. Încărcarea liniilor când se selectează o factură
  useEffect(() => {
    if (idFacturaSelectata) {
      FacturareService.fetchLiniiFacturaEmisa(Number(idFacturaSelectata)).then(setLiniiFactura);
    } else {
      setLiniiFactura([]);
    }
  }, [idFacturaSelectata]);

  const facturiFiltrate = useMemo(() => {
    if (!searchTerm) return facturiEmise;
    const term = searchTerm.toLowerCase();
    return facturiEmise.filter(
      (factura) =>
        factura.numar.toLowerCase().includes(term) ||
        factura.client.toLowerCase().includes(term)
    );
  }, [searchTerm, facturiEmise]);

  const factura = useMemo(
    () => facturiEmise.find((item) => item.idFactura === idFacturaSelectata) || null,
    [idFacturaSelectata, facturiEmise]
  );

  const handleSelectFactura = (facturaGasita: FacturaMock) => {
    setIdFacturaSelectata(facturaGasita.idFactura);
    setSearchTerm(`${facturaGasita.numar} | ${facturaGasita.client}`);
    setIsDropdownOpen(false);
    setValoareDiscount(0);
    setLiniiStorno([]);
  };

  const toggleLinieStorno = (idLinie: number) => {
    setLiniiStorno((prev) =>
      prev.includes(idLinie) ? prev.filter((id) => id !== idLinie) : [...prev, idLinie]
    );
  };

  const calculeFinale = useMemo(() => {
    if (!factura) return null;

    let sumaScazuta = 0;

    if (tipOperatiune === 'discount') {
      sumaScazuta =
        tipDiscount === 'procent'
          ? factura.restDePlata * (valoareDiscount / 100)
          : valoareDiscount;
    } else {
      sumaScazuta = liniiFactura
        .filter((linie) => liniiStorno.includes(linie.idLinie))
        .reduce((acc, linie) => acc + (linie.cantitate * linie.pretUnitar), 0);
    }

    sumaScazuta = Math.min(sumaScazuta, factura.restDePlata);
    return { sumaScazuta, noulRestDePlata: factura.restDePlata - sumaScazuta };
  }, [factura, tipOperatiune, tipDiscount, valoareDiscount, liniiFactura, liniiStorno]);

  const handleSalvare = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!factura) {
      toast.error('Selectează o factură mai întâi.');
      return;
    }
    if (!motivOperatiune) {
      toast.error('Motivul sau codul campaniei este obligatoriu.');
      return;
    }

    try {
      // Apelăm service-ul pentru a salva datele
      await FacturareService.salveazaAjustare({
        idFactura: factura.idFactura,
        tipOperatiune,
        valoare: calculeFinale?.sumaScazuta,
        motiv: motivOperatiune,
        liniiStorno: tipOperatiune === 'storno' ? liniiStorno : undefined
      });

      if (tipOperatiune === 'discount') {
        toast.success(`Discount aplicat pe factura ${factura.numar}: -${calculeFinale?.sumaScazuta.toFixed(2)} RON.`);
      } else {
        if (liniiStorno.length === 0) {
          toast.error('Selectează cel puțin o linie pentru a emite factura storno.');
          return;
        }
        toast.success(`Factura storno a fost pregătită pentru ${liniiStorno.length} articole în valoare de ${calculeFinale?.sumaScazuta.toFixed(2)} RON.`);
      }

      // Reset Formular
      setIdFacturaSelectata('');
      setSearchTerm('');
      setMotivOperatiune('');
      setValoareDiscount(0);
      setLiniiStorno([]);
    } catch (error) {
      toast.error('Eroare la procesarea operațiunii.');
    }
  };

  return {
    loading,
    factura, facturiFiltrate, liniiFactura,
    idFacturaSelectata, setIdFacturaSelectata,
    tipOperatiune, setTipOperatiune,
    searchTerm, setSearchTerm,
    isDropdownOpen, setIsDropdownOpen,
    tipDiscount, setTipDiscount,
    valoareDiscount, setValoareDiscount,
    motivOperatiune, setMotivOperatiune,
    liniiStorno, setLiniiStorno,
    calculeFinale,
    handleSelectFactura, toggleLinieStorno, handleSalvare
  };
}