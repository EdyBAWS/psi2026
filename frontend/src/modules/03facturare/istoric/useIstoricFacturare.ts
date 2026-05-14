// src/modules/03facturare/useIstoric.ts
import { useState, useEffect, useMemo } from 'react';
import { usePageSessionState } from '../../../lib/pageState';
import { API_BASE_URL } from '../../../lib/api';

export function useIstoric() {
  const [istoric, setIstoric] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = usePageSessionState('istoric-facturare-search', '');
  const [filtruTip, setFiltruTip] = usePageSessionState<string>('istoric-facturare-tip', 'Toate');

  useEffect(() => {
    // Apel către backend-ul real (GET) pentru a prelua facturile din baza de date
    const incarcaIstoricReal = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/facturare`);
        if (!response.ok) {
          throw new Error('Eroare la preluarea facturilor de la server');
        }
        
        const facturiReale = await response.json();

        // Transformăm datele din baza de date în formatul pe care îl așteaptă interfața ta
        // Transformăm datele din baza de date în formatul pe care îl așteaptă interfața ta
        // Transformăm datele din baza de date în formatul pe care îl așteaptă interfața ta
        const dateFormatate = facturiReale.map((factura: any) => {
          const dateObj = new Date(factura.scadenta); 
          const dataStr = dateObj.toLocaleDateString('ro-RO');
          const oraStr = dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

          // Determinăm tipul de operațiune și detaliile pe baza seriei
          // Determinăm tipul de operațiune și detaliile
          let tipOp = 'Facturare Comandă';
          let detalii = 'Emisă din modulul de facturare';
          
          if (factura.serie === 'PEN') {
            tipOp = 'Penalizare';
            detalii = factura.iteme?.[0]?.descriere || 'Penalizare pentru întârziere plată';
          } else if (factura.serie === 'STO') {
            tipOp = 'Storno';
            detalii = factura.iteme?.[0]?.descriere || 'Factură stornată parțial/total';
          } else if (factura.serie === 'DSC') {
            tipOp = 'Discount Extra';
            detalii = factura.iteme?.[0]?.descriere || 'Discount comercial aplicat';
          }

          return {
            id: factura.idFactura,
            client: factura.client?.nume || factura.client?.numeFirma || `Client ID: ${factura.idClient}`,
            numarDocument: `${factura.serie}-${factura.numar}`,
            tipOperatiune: tipOp,
            valoare: factura.totalGeneral || 0,
            // Aici este modificarea cheie: combinăm data și ora într-o singură variabilă
            dataOra: `${dataStr} - ${oraStr}`,
            detalii: detalii,
            utilizator: 'Admin',
            facturaRaw: factura
          };
        });

        setIstoric(dateFormatate);
      } catch (error) {
        console.error("Eroare la încărcarea istoricului real:", error);
        setIstoric([]); // Dacă pică serverul, arătăm o listă goală în loc să dăm crash aplicației
      } finally {
        setLoading(false);
      }
    };

    incarcaIstoricReal();
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

