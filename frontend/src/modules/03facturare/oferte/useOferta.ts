// src/modules/03facturare/oferte/useOferta.ts
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../lib/api';

// Tipurile pe care UI-ul le așteaptă
interface FacturaUI {
  idFactura: number;
  idClient: number;
  idComanda?: number;
  numar: string;
  client: string;
  restDePlata: number;
}

interface LinieUI {
  idLinie: number;
  denumire: string;
  cantitate: number;
  pretUnitar: number;
}

export function useOferta() {
  const [facturiEmise, setFacturiEmise] = useState<FacturaUI[]>([]);
  const [liniiFactura, setLiniiFactura] = useState<LinieUI[]>([]);
  const [loading, setLoading] = useState(true);

  const [idFacturaSelectata, setIdFacturaSelectata] = useState<number | ''>('');
  const [tipOperatiune, setTipOperatiune] = useState<'discount' | 'storno'>('discount');

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [tipDiscount, setTipDiscount] = useState<'procent' | 'valoare'>('procent');
  const [valoareDiscount, setValoareDiscount] = useState<number>(0);
  const [motivOperatiune, setMotivOperatiune] = useState('');
  const [liniiStorno, setLiniiStorno] = useState<number[]>([]);

  // 1. Încărcarea facturilor reale din baza de date
  useEffect(() => {
    const fetchFacturi = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/facturare`);
        if (!res.ok) throw new Error('Eroare rețea');
        const data = await res.json();
        
        const mappedData = data.map((f: any) => ({
          idFactura: f.idFactura,
          idClient: f.idClient,
          idComanda: f.idComanda,
          numar: `${f.serie}-${f.numar}`,
          client: f.client?.nume || f.client?.numeFirma || `Client ID: ${f.idClient}`,
          restDePlata: f.totalGeneral // Presupunem că tot totalul e de plată momentan
        }));
        
        setFacturiEmise(mappedData);
      } catch (error) {
        console.error('Eroare la aducerea facturilor', error);
        toast.error('Nu s-au putut încărca facturile.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFacturi();
  }, []);

  // 2. Încărcarea liniilor (itemelor) când se selectează o factură
  useEffect(() => {
    const fetchLinii = async () => {
      if (!idFacturaSelectata) {
        setLiniiFactura([]);
        return;
      }
      
      try {
        // Facem un GET pe ID-ul facturii curente
        const res = await fetch(`${API_BASE_URL}/facturare/${idFacturaSelectata}`);
        if (!res.ok) throw new Error('Eroare rețea');
        const facturaReala = await res.json();
        
        // Extragem itemele și le mapăm pentru tabelul tău de storno
        if (facturaReala.iteme && Array.isArray(facturaReala.iteme)) {
          const mappedLinii = facturaReala.iteme.map((item: any) => ({
            idLinie: item.idItem || Math.random(), // Folosim id-ul real dacă există
            denumire: item.descriere,
            cantitate: item.cantitate,
            pretUnitar: item.pretUnitar
          }));
          setLiniiFactura(mappedLinii);
        }
      } catch (error) {
        console.error('Eroare la aducerea detaliilor facturii', error);
      }
    };

    fetchLinii();
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

  const handleSelectFactura = (facturaGasita: FacturaUI) => {
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
    if (tipOperatiune === 'discount' && tipDiscount === 'procent' && valoareDiscount > 100) {
      toast.error('Discountul nu poate fi mai mare de 100%.');
      return;
    }

    try {
      // Aducem numărul următor de factură
      const resNumar = await fetch(`${API_BASE_URL}/facturare/next-number`);
      const nextNumar = await resNumar.text();

      const serieOperatiune = tipOperatiune === 'discount' ? 'DSC' : 'STO';
      
      let iteme = [];
      if (tipOperatiune === 'discount') {
        iteme = [{
          descriere: `Discount: ${motivOperatiune} pt factura ${factura.numar}`,
          cantitate: 1,
          pretUnitar: -(calculeFinale?.sumaScazuta || 0)
        }];
      } else {
        iteme = liniiFactura
          .filter(l => liniiStorno.includes(l.idLinie))
          .map(l => ({
            descriere: `Storno: ${l.denumire} - Motiv: ${motivOperatiune}`,
            cantitate: l.cantitate,
            pretUnitar: -l.pretUnitar // STORNO este negativ
          }));
      }

      const payload = {
        numar: Number(nextNumar),
        serie: serieOperatiune,
        idClient: factura.idClient,
        idComanda: factura.idComanda,
        scadenta: new Date().toISOString(),
        iteme
      };

      const res = await fetch(`${API_BASE_URL}/facturare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Eroare la salvarea pe server');

      if (tipOperatiune === 'discount') {
        toast.success(`Discount aplicat! A fost generată factura de reducere DSC-${nextNumar} pentru -${calculeFinale?.sumaScazuta.toFixed(2)} RON.`);
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
      console.error(error);
      toast.error('Eroare la procesarea operațiunii pe server.');
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

