import { useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '../../componente/ui/Button';
import { facturiRestanteMock } from '../../mock/incasari';

interface FacturaRestanta {
  idFactura: number;
  idClient: number;
  client: string;
  numar: string;
  dataEmitere: string;
  restDePlata: number;
  sumaAlocata: number | '';
}

export default function Incasari() {
  const [clientSelectat, setClientSelectat] = useState<string>('');
  const [sumaIncasata, setSumaIncasata] = useState<number | ''>('');
  const [modalitate, setModalitate] = useState<string>('Transfer Bancar');

  const [facturiRestante, setFacturiRestante] = useState<FacturaRestanta[]>(
    facturiRestanteMock.map((factura) => ({
      idFactura: factura.idFactura,
      idClient: factura.idClient,
      client: factura.client,
      numar: factura.numar,
      dataEmitere: factura.dataEmitere,
      restDePlata: factura.restDePlata,
      sumaAlocata: '',
    })),
  );

  const clientiDisponibili = useMemo(
    () =>
      Array.from(
        new Map(
          facturiRestante.map((factura) => [
            factura.idClient,
            { idClient: factura.idClient, nume: factura.client },
          ]),
        ).values(),
      ),
    [facturiRestante],
  );

  const facturiFiltrate = useMemo(
    () =>
      facturiRestante.filter(
        (factura) => clientSelectat === '' || String(factura.idClient) === clientSelectat,
      ),
    [clientSelectat, facturiRestante],
  );

  const handleAlocareSuma = (idFactura: number, valoare: string) => {
    const valoareNumerica = valoare === '' ? '' : Number(valoare);
    setFacturiRestante((previous) =>
      previous.map((factura) =>
        factura.idFactura === idFactura ? { ...factura, sumaAlocata: valoareNumerica } : factura,
      ),
    );
  };

  const handleSalvare = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientSelectat || sumaIncasata === '') {
      toast.error('Te rog completează clientul și suma încasată.');
      return;
    }
    const totalAlocat = facturiRestante.reduce(
      (acc, factura) => acc + (Number(factura.sumaAlocata) || 0),
      0,
    );
    if (totalAlocat > Number(sumaIncasata)) {
      toast.error('Suma alocată depășește suma totală încasată.');
      return;
    }
    toast.success(
      `Tranzacție salvată. Total încasat: ${sumaIncasata} RON, alocat: ${totalAlocat} RON.`,
    );
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Înregistrare Încasare
        </h2>
        <p className="text-slate-500 mt-1">
          Stingerea creanțelor prin alocarea sumelor încasate pe facturi.
        </p>
      </div>

      <form onSubmit={handleSalvare} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Client (Plătitor)
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              value={clientSelectat}
              onChange={(e) => setClientSelectat(e.target.value)}
            >
              <option value="">-- Caută client --</option>
              {clientiDisponibili.map((client) => (
                <option key={client.idClient} value={client.idClient}>
                  {client.nume}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Suma Încasată
            </label>
            <div className="relative">
              <input
                type="number"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                value={sumaIncasata}
                onChange={(e) => setSumaIncasata(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
              />
              <span className="absolute right-4 top-3.5 text-slate-400 font-medium">RON</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Modalitate
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              value={modalitate}
              onChange={(e) => setModalitate(e.target.value)}
            >
              <option value="Transfer Bancar">Transfer Bancar</option>
              <option value="Cash">Numerar (Cash)</option>
              <option value="POS">Card (POS)</option>
            </select>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Repartizare pe Facturi Restante</h3>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold tracking-wide uppercase">
              {facturiFiltrate.length} Facturi găsite
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full bg-white text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Nr. Factură</th>
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-6">Data Emiterii</th>
                  <th className="py-4 px-6 text-right">Rest de Plată</th>
                  <th className="py-4 px-6 text-right w-56">Suma de Alocat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facturiFiltrate.map((factura) => (
                  <tr key={factura.idFactura} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 font-semibold text-slate-700">{factura.numar}</td>
                    <td className="py-4 px-6 text-slate-500">{factura.client}</td>
                    <td className="py-4 px-6 text-slate-500">{factura.dataEmitere}</td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-md">
                        {factura.restDePlata.toFixed(2)} RON
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <input
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all group-hover:border-indigo-200"
                        placeholder="0.00"
                        value={factura.sumaAlocata}
                        max={factura.restDePlata}
                        onChange={(e) => handleAlocareSuma(factura.idFactura, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <Button type="submit" size="lg">
            Finalizează Tranzacția
          </Button>
        </div>
      </form>
    </div>
  );
}
