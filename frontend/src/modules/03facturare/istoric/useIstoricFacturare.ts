// src/modules/03facturare/useIstoric.ts
import { useState, useEffect, useMemo } from 'react';
import { FacturareService } from '../facturare.service';
import { usePageSessionState } from '../../../lib/pageState';

export function useIstoric() {
  const [istoric, setIstoric] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = usePageSessionState('istoric-facturare-search', '');
  const [filtruTip, setFiltruTip] = usePageSessionState<string>('istoric-facturare-tip', 'Toate');

  useEffect(() => {
    FacturareService.fetchIstoric().then((data) => {
      setIstoric(data);
      setLoading(false);
    });
  }, []);

  const tranzactiiFiltrate = useMemo(() => {
    return istoric.filter((trx) => {
      const matchSearch =
        trx.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.numarDocument.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTip = filtruTip === 'Toate' || trx.tipOperatiune === filtruTip;
      return matchSearch && matchTip;
    });
  }, [istoric, searchTerm, filtruTip]);

  const totalFacturari = istoric.filter((trx) => trx.tipOperatiune === 'Facturare Comandă').length;
  const totalPenalizari = istoric.filter((trx) => trx.tipOperatiune === 'Penalizare').length;

  return {
    istoric, loading, tranzactiiFiltrate,
    searchTerm, setSearchTerm, filtruTip, setFiltruTip,
    totalFacturari, totalPenalizari
  };
}