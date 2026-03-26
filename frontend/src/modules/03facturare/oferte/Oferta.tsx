import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../componente/ui/Button';
import { Card, CardContent, CardHeader } from '../../../componente/ui/Card';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { SelectField } from '../../../componente/ui/SelectField';

export default function Oferta() {
  // Pentru moment, simulăm câteva facturi deja emise anterior de modulul de facturare
  const facturiEmise = [
    { id: 101, numar: 'F-2026-001', dataEmitere: '2026-03-01', total: 1500, client: 'SC Auto Fleet SRL' },
    { id: 102, numar: 'F-2026-002', dataEmitere: '2026-03-05', total: 850, client: 'Ion Popescu' },
    { id: 103, numar: 'F-2026-005', dataEmitere: '2026-03-10', total: 3200, client: 'Vasile Dorel' },
  ];

  const [facturaSelectata, setFacturaSelectata] = useState('');
  const [tipOperatiune, setTipOperatiune] = useState('discount');

  const handleSalvare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facturaSelectata) {
      toast.error('Te rog selectează o factură din listă.');
      return;
    }
    
    if (tipOperatiune === 'discount') {
      toast.success(
        `S-a aplicat discount pentru factura ID ${facturaSelectata}.`,
      );
    } else {
      toast.success(
        `S-a generat factura storno promoțională pentru factura ID ${facturaSelectata}.`,
      );
    }
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="p-6 pb-0">
        <PageHeader
          className="mb-0"
          title="Gestiune Campanii & Oferte"
          description="Selectează o factură emisă pentru a aplica un discount extra sau pentru a emite o factură storno promoțională."
        />
      </CardHeader>
      <CardContent className="p-6 pt-6">
        <form onSubmit={handleSalvare} className="space-y-6">
          <SelectField
            label="Factura de Bază"
            value={facturaSelectata}
            onChange={(e) => setFacturaSelectata(e.target.value)}
            placeholder="-- Caută factură emisă --"
            options={facturiEmise.map((factura) => ({
              value: String(factura.id),
              label: `${factura.numar} - ${factura.client} (${factura.total} RON)`,
            }))}
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tipul Operațiunii
            </label>
            <div className="flex space-x-4">
              <label className="flex flex-1 cursor-pointer items-center space-x-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
              <input 
                type="radio" 
                name="tipOp" 
                value="discount" 
                checked={tipOperatiune === 'discount'}
                onChange={(e) => setTipOperatiune(e.target.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Aplicare Discount Extra</span>
            </label>
              <label className="flex flex-1 cursor-pointer items-center space-x-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
              <input 
                type="radio" 
                name="tipOp" 
                value="storno" 
                checked={tipOperatiune === 'storno'}
                onChange={(e) => setTipOperatiune(e.target.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Emitere Factură Storno</span>
            </label>
          </div>
        </div>

          <Button type="submit" fullWidth size="lg">
            Procesează Operațiunea
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
