// src/modules/04incasari/useIncasari.ts
import { useState, useEffect, useMemo, type ChangeEvent, type FormEvent } from 'react';
import { toast } from 'sonner';
import { usePageSessionState } from '../../lib/pageState';
import { IncasariService } from './incasari.service';
import type { FacturaMock } from '../../mock/types';

export interface FacturaAlocabila extends FacturaMock {
  sumaAlocata: number | '';
}

export interface ClientPlata {
  idClient: number;
  identificatorFiscal: string;
  nume: string;
}

export const METODE_PLATA = [
  { id: 'Transfer Bancar', label: 'OP / Bancă' },
  { id: 'POS', label: 'Card (POS)' },
  { id: 'Cash', label: 'Numerar / Bon' },
] as const;

export type ModalitatePlata = (typeof METODE_PLATA)[number]['id'];

export function dataAziISO() {
  return new Date().toISOString().split('T')[0];
}

export function formatSuma(valoare: number) {
  return `${valoare.toFixed(2)} RON`;
}

export function formatData(data: string) {
  return new Date(data).toLocaleDateString('ro-RO');
}

export function useIncasari() {
  const [loading, setLoading] = useState(true);
  const [facturiRestanteBD, setFacturiRestanteBD] = useState<FacturaMock[]>([]);
  const [istoricIncasariBD, setIstoricIncasariBD] = useState<any[]>([]);

  const [searchClient, setSearchClient] = usePageSessionState('incasari-search-client', '');
  const [showDropdown, setShowDropdown] = useState(false);

  const [idClientSelectat, setIdClientSelectat] = useState<number | null>(null);
  const [sumaIncasata, setSumaIncasata] = useState<number | ''>('');
  const [modalitate, setModalitate] = usePageSessionState<ModalitatePlata>('incasari-modalitate', 'Transfer Bancar');
  const [dataIncasare, setDataIncasare] = useState<string>(dataAziISO());
  const [referinta, setReferinta] = useState('');
  const [facturiRestante, setFacturiRestante] = useState<FacturaAlocabila[]>([]);

  useEffect(() => {
    Promise.all([
      IncasariService.fetchFacturiRestante(),
      IncasariService.fetchIncasariIstoric()
    ]).then(([facturi, incasari]) => {
      setFacturiRestanteBD(facturi);
      setIstoricIncasariBD(incasari);
      setLoading(false);
    });
  }, []);

  const clientiDisponibili = useMemo(() => {
    return Array.from(
      facturiRestanteBD.reduce((map, factura) => {
        if (!map.has(factura.idClient)) {
          map.set(factura.idClient, {
            idClient: factura.idClient,
            identificatorFiscal: factura.idClient < 1000 ? `ID client #${factura.idClient}` : `Client #${factura.idClient}`,
            nume: factura.client,
          });
        }
        return map;
      }, new Map<number, ClientPlata>())
    ).map(([, client]) => client);
  }, [facturiRestanteBD]);

  const clientiFiltrati = useMemo(() => {
    const termen = searchClient.trim().toLowerCase();
    if (termen === '') return clientiDisponibili;
    return clientiDisponibili.filter((client) =>
      [client.nume, client.identificatorFiscal].some((camp) =>
        camp.toLowerCase().includes(termen),
      ),
    );
  }, [searchClient, clientiDisponibili]);

  const clientSelectat = useMemo(
    () => clientiDisponibili.find((client) => client.idClient === idClientSelectat) ?? null,
    [idClientSelectat, clientiDisponibili],
  );

  const totalDatorieClient = useMemo(
    () => facturiRestante.reduce((acc, factura) => acc + factura.restDePlata, 0),
    [facturiRestante],
  );

  const totalAlocat = useMemo(
    () => facturiRestante.reduce((acc, factura) => acc + (Number(factura.sumaAlocata) || 0), 0),
    [facturiRestante],
  );

  const sumaNum = Number(sumaIncasata) || 0;
  const baniRamasi = sumaNum - totalAlocat;
  const areEroareSume = baniRamasi < 0;
  const isReferintaObligatorie = modalitate === 'Transfer Bancar' || modalitate === 'POS';
  const referintaLipsa = isReferintaObligatorie && referinta.trim() === '';
  const facturiAlocate = facturiRestante.filter((factura) => Number(factura.sumaAlocata) > 0).length;

  const handleSelectClient = (client: ClientPlata) => {
    setIdClientSelectat(client.idClient);
    setSearchClient(client.nume);
    setShowDropdown(false);
    setSumaIncasata('');
    setReferinta('');

    const facturiClient = facturiRestanteBD
      .filter((factura) => factura.idClient === client.idClient)
      .map((factura) => ({ ...factura, sumaAlocata: '' as const }));

    setFacturiRestante(facturiClient);
  };

  const handleSchimbareCautare = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchClient(event.target.value);
    setShowDropdown(true);

    if (idClientSelectat !== null) {
      setIdClientSelectat(null);
      setFacturiRestante([]);
      setSumaIncasata('');
    }
  };

  const handleAlocareSuma = (idFactura: number, valoare: string) => {
    setFacturiRestante((previous) =>
      previous.map((factura) => {
        if (factura.idFactura !== idFactura) return factura;
        if (valoare === '') return { ...factura, sumaAlocata: '' as const };

        const valoareNumerica = Number(valoare);
        const clamped = Math.min(Math.max(0, valoareNumerica), factura.restDePlata);
        return { ...factura, sumaAlocata: Number.isFinite(clamped) ? clamped : '' };
      }),
    );
  };

  const aplicaSumaMaxima = (idFactura: number, restDePlata: number) => {
    handleAlocareSuma(idFactura, restDePlata.toString());
  };

  const resetaAlocari = () => {
    setFacturiRestante((previous) =>
      previous.map((factura) => ({ ...factura, sumaAlocata: '' as const })),
    );
  };

  const reseteazaFormular = () => {
    setIdClientSelectat(null);
    setSearchClient('');
    setSumaIncasata('');
    setReferinta('');
    setModalitate('Transfer Bancar');
    setDataIncasare(dataAziISO());
    setFacturiRestante([]);
  };

  const handleSalvare = async (event: FormEvent) => {
    event.preventDefault();

    if (idClientSelectat === null || sumaNum <= 0) {
      toast.error('Selectează clientul și introdu suma primită.');
      return;
    }
    if (facturiAlocate === 0) {
      toast.error('Alocă suma pe cel puțin o factură restantă.');
      return;
    }
    if (areEroareSume) {
      toast.error('Suma repartizată pe facturi depășește suma încasată.');
      return;
    }
    if (referintaLipsa) {
      toast.error(`Numărul documentului este obligatoriu pentru plata prin ${modalitate}.`);
      return;
    }

    try {
      await IncasariService.salveazaIncasare({
        idClient: idClientSelectat,
        sumaIncasata: sumaNum,
        metodaPlata: modalitate,
        referinta,
        data: dataIncasare,
        alocari: facturiRestante.filter(f => Number(f.sumaAlocata) > 0)
      });

      const mesajRest = baniRamasi > 0
        ? ` Au rămas ${formatSuma(baniRamasi)} nealocați pentru avans sau regularizare ulterioară.`
        : '';
      toast.success(`Încasarea pentru ${clientSelectat?.nume ?? 'client'} a fost salvată cu ${formatSuma(totalAlocat)} repartizați.${mesajRest}`);
      reseteazaFormular();
    } catch (error) {
      toast.error('Eroare la salvarea încasării.');
    }
  };

  return {
    loading, facturiRestanteBD, istoricIncasariBD,
    searchClient, setSearchClient, showDropdown, setShowDropdown,
    idClientSelectat, sumaIncasata, setSumaIncasata, modalitate, setModalitate,
    dataIncasare, setDataIncasare, referinta, setReferinta,
    clientiFiltrati, facturiRestante, totalDatorieClient, totalAlocat,
    sumaNum, baniRamasi, areEroareSume, isReferintaObligatorie, referintaLipsa, facturiAlocate,
    handleSelectClient, handleSchimbareCautare, handleAlocareSuma, aplicaSumaMaxima,
    resetaAlocari, handleSalvare
  };
}