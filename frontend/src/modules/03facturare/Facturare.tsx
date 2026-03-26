import { useState } from 'react';
import { ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../componente/ui/Button';
import { Card, CardContent, CardHeader } from '../../componente/ui/Card';
import { EmptyState } from '../../componente/ui/EmptyState';
import { PageHeader } from '../../componente/ui/PageHeader';
import type { ComandaService } from '../02operational/types';

// Modulul de facturare pornește de la comenzile deja închise operațional
// și le transformă în acțiuni comerciale.
// În versiunea actuală nu emitem documente reale, ci simulăm acest pas în UI.
interface FacturareProps {
  comenzi: ComandaService[];
}

export default function Facturare({ comenzi }: FacturareProps) {
  // Facturarea preia comenzile care au trecut de execuție și sunt gata pentru
  // livrare sau deja marcate ca livrate.
  const comenziGata = comenzi.filter(
    (comanda) => comanda.status === 'Gata de livrare' || comanda.status === 'Livrat',
  );

  // Stocăm ce comenzi primesc discount (ex: { 2: true } înseamnă comanda cu ID 2 are discount)
  const [discounturi, setDiscounturi] = useState<Record<number, boolean>>({});

  const toggleDiscount = (idComanda: number) => {
    setDiscounturi((prev) => ({
      ...prev,
      [idComanda]: !prev[idComanda],
    }));
  };

  const emiteFactura = (comanda: ComandaService) => {
    const areDiscount = discounturi[comanda.idComanda];
    const totalEstimat = comanda.totalEstimat;
    const totalFinal = areDiscount ? totalEstimat * 0.9 : totalEstimat; // Ex: 10% discount

    // Folosim toast în loc de `alert(...)` ca să păstrăm fluxul mai fluid
    // și să nu blocăm utilizatorul după fiecare acțiune.
    toast.success(
      `Factură generată pentru ${comanda.nrComanda}. Total: ${totalFinal.toFixed(2)} RON ${areDiscount ? '(Discount 10% aplicat)' : ''}`,
    );
  };

  return (
    <Card>
      <CardHeader className="p-6 pb-0">
        <PageHeader
          className="mb-0"
          title="Facturare Comenzi (Așteptare)"
          description='Aici apar automat comenzile de service care au primit statusul "Gata de livrare" sau "Livrat" în modulul Operațional.'
        />
      </CardHeader>
      <CardContent className="p-6 pt-6">
        {comenziGata.length === 0 ? (
          <EmptyState
            icon={<ReceiptText className="h-5 w-5" />}
            title="Nicio comandă eligibilă"
            description="Trimite comenzile finalizate din Operațional pentru a le putea factura aici."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full bg-white text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Nr. Comandă</th>
              <th className="py-3 px-4">Vehicul (ID)</th>
              <th className="py-3 px-4 text-right">Total Estimat</th>
              <th className="py-3 px-4 text-center">Aplică Discount</th>
              <th className="py-3 px-4 text-center">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comenziGata.map((comanda) => (
                <tr key={comanda.idComanda} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">{comanda.nrComanda}</td>
                  <td className="py-3 px-4 text-slate-500">{comanda.idVehicul}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-700">{comanda.totalEstimat.toFixed(2)} RON</td>
                  <td className="py-3 px-4 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        checked={discounturi[comanda.idComanda] || false}
                        onChange={() => toggleDiscount(comanda.idComanda)}
                      />
                      <span className="ml-2 text-xs text-slate-500">Da</span>
                    </label>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      onClick={() => emiteFactura(comanda)}
                      size="sm"
                    >
                      Emite Factură
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
