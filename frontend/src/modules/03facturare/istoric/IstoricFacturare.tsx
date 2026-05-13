// src/modules/03facturare/IstoricFacturare.tsx
import { ArrowDownWideNarrow, FileText, TriangleAlert, Eye, Download, X } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { StatCard } from '../../../componente/ui/StatCard';
import { useIstoric } from '../istoric/useIstoricFacturare';
import { generareFacturaPDF } from '../utils/pdfGenerator';

export default function IstoricFacturare() {
  const {
    istoric, loading, tranzactiiFiltrate,
    searchTerm, setSearchTerm, filtruTip, setFiltruTip,
    totalFacturari, totalPenalizari
  } = useIstoric();

  const [facturaSelectata, setFacturaSelectata] = useState<any>(null);

  const getBadgeColor = (tip: string) => {
    switch (tip) {
      case 'Facturare Comandă': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Penalizare': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Storno': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Discount Extra': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Se încarcă istoricul...</div>;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Istoric Facturare</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Monitorizarea documentelor emise în modulul de facturare.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Documente Emise
          </p>
          <p className="text-2xl font-bold text-indigo-600">{tranzactiiFiltrate.length}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <StatCard label="Documente emise" value={istoric.length} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Facturări" value={totalFacturari} tone="success" />
        <StatCard label="Penalizări" value={totalPenalizari} tone="warning" icon={<TriangleAlert className="h-4 w-4" />} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex-1 relative">
          <svg className="w-5 h-5 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Caută după client sau număr document..."
            className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-medium text-slate-700"
            value={filtruTip}
            onChange={(e) => setFiltruTip(e.target.value)}
          >
            <option value="Toate">Toate Operațiunile</option>
            <option value="Facturare Comandă">Doar Facturări</option>
            <option value="Penalizare">Doar Penalizări</option>
            <option value="Storno">Doar Stornări</option>
            <option value="Discount Extra">Doar Discounturi</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => { setSearchTerm(''); setFiltruTip('Toate'); }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <ArrowDownWideNarrow className="h-4 w-4" />
          Reset
        </button>
      </div>

      {tranzactiiFiltrate.length === 0 ? (
        <EmptyState
          title="Nu există tranzacții pentru filtrele curente"
          description="Încearcă să resetezi căutarea sau filtrul de tip operațiune."
          actionLabel="Resetează filtrele"
          onAction={() => { setSearchTerm(''); setFiltruTip('Toate'); }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full bg-white text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800 text-white font-medium">
              <tr>
                <th className="py-4 px-6">Dată & Oră</th>
                <th className="py-4 px-6">Tip Operațiune</th>
                <th className="py-4 px-6">Document</th>
                <th className="py-4 px-6">Client</th>
                <th className="py-4 px-6 text-right">Valoare (RON)</th>
                <th className="py-4 px-6 text-center">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tranzactiiFiltrate.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-slate-500 font-medium">{trx.dataOra}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeColor(trx.tipOperatiune)}`}>
                      {trx.tipOperatiune}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800">{trx.numarDocument}</td>
                  <td className="py-4 px-6 font-semibold text-slate-700">{trx.client}</td>
                  <td className={`py-4 px-6 text-right font-bold ${trx.valoare < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {trx.valoare > 0 ? '+' : ''}{trx.valoare.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {trx.facturaRaw && (
                      <button
                        onClick={() => setFacturaSelectata(trx.facturaRaw)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Eye className="w-4 h-4" /> Vezi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Factura Modal */}
      {facturaSelectata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Factura {facturaSelectata.serie}-{facturaSelectata.numar}
              </h3>
              <button 
                onClick={() => setFacturaSelectata(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detalii Emitere</p>
                  <p className="text-sm text-slate-800"><strong>Data emiterii:</strong> {new Date(facturaSelectata.dataEmiterii).toLocaleDateString('ro-RO')}</p>
                  <p className="text-sm text-slate-800"><strong>Data scadenței:</strong> {new Date(facturaSelectata.scadenta).toLocaleDateString('ro-RO')}</p>
                  <p className="text-sm text-slate-800"><strong>Total General:</strong> {facturaSelectata.totalGeneral.toFixed(2)} RON</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detalii Client</p>
                  <p className="text-sm font-bold text-slate-800">{facturaSelectata.client?.nume || facturaSelectata.client?.numeFirma || 'Client Necunoscut'}</p>
                  <p className="text-sm text-slate-600">CUI/CNP: {facturaSelectata.client?.CUI || facturaSelectata.client?.CNP || '-'}</p>
                  <p className="text-sm text-slate-600">Telefon: {facturaSelectata.client?.telefon || '-'}</p>
                  <p className="text-sm text-slate-600">Adresă: {facturaSelectata.client?.adresa || '-'}</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold text-slate-700">Produs / Serviciu</th>
                      <th className="py-3 px-4 font-semibold text-slate-700 text-center">Cantitate</th>
                      <th className="py-3 px-4 font-semibold text-slate-700 text-right">Preț Unitar</th>
                      <th className="py-3 px-4 font-semibold text-slate-700 text-right">Valoare</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(facturaSelectata.iteme || []).map((item: any) => (
                      <tr key={item.idItem}>
                        <td className="py-3 px-4 text-slate-800">{item.descriere}</td>
                        <td className="py-3 px-4 text-slate-800 text-center">{item.cantitate}</td>
                        <td className="py-3 px-4 text-slate-800 text-right">{item.pretUnitar.toFixed(2)} RON</td>
                        <td className="py-3 px-4 text-slate-800 text-right font-medium">{(item.cantitate * item.pretUnitar).toFixed(2)} RON</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right text-slate-500 font-medium">Subtotal (fără TVA):</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">{facturaSelectata.totalFaraTVA.toFixed(2)} RON</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right text-slate-500 font-medium">TVA (19%):</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">{facturaSelectata.tva.toFixed(2)} RON</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right font-bold text-slate-800">TOTAL DE PLATĂ:</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-600">{facturaSelectata.totalGeneral.toFixed(2)} RON</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button
                onClick={() => setFacturaSelectata(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Închide
              </button>
              <button
                onClick={() => generareFacturaPDF(facturaSelectata)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descarcă PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}