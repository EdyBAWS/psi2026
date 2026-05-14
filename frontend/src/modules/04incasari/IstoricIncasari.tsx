import { useEffect, useState } from 'react';
import { PageHeader } from '../../componente/ui/PageHeader';
import { StatCard } from '../../componente/ui/StatCard';
import { BanknoteArrowDown, Calendar, Search } from 'lucide-react';
import { IncasariService } from './incasari.service';
import { formatData, formatSuma } from './useIncasari';

export default function IstoricIncasari() {
  const [loading, setLoading] = useState(true);
  const [istoricIncasari, setIstoricIncasari] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [highlightId, setHighlightId] = useState<number | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('highlight-incasare-id');
    if (id) {
      setHighlightId(Number(id));
      // Ștergem din session storage pentru a nu evidenția la refresh
      setTimeout(() => {
        sessionStorage.removeItem('highlight-incasare-id');
        setHighlightId(null);
      }, 5000); // 5 secunde de highlight
    }
  }, []);

  useEffect(() => {
    IncasariService.fetchIncasariIstoric().then(data => {
      setIstoricIncasari(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const incasariFiltrate = istoricIncasari.filter(inc => {
    const s = search.toLowerCase();
    return (
      inc.client?.toLowerCase().includes(s) ||
      inc.referinta?.toLowerCase().includes(s) ||
      inc.modalitate?.toLowerCase().includes(s)
    );
  });

  const totalIncasat = istoricIncasari.reduce((sum, inc) => sum + (Number(inc.suma) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        Se încarcă istoricul de încasări...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <BanknoteArrowDown className="w-64 h-64 text-indigo-900" />
        </div>
        <div className="relative z-10">
        <PageHeader
          title="Istoric Încasări"
          description="Vizualizează toate încasările înregistrate în sistem."
        />
        <div className="flex flex-wrap gap-4 mt-2">
          <StatCard
            label="Total Încasări"
            value={istoricIncasari.length}
            icon={<BanknoteArrowDown className="h-4 w-4" />}
          />
          <StatCard
            label="Suma Totală Încasată"
            value={formatSuma(totalIncasat)}
            tone="success"
            icon={<BanknoteArrowDown className="h-4 w-4" />}
          />
        </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Caută după client, referință, mod plată..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Referință</th>
                <th className="px-6 py-4">Mod Plată</th>
                <th className="px-6 py-4">Facturi Stinse</th>
                <th className="px-6 py-4 text-right">Sumă</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incasariFiltrate.length > 0 ? (
                incasariFiltrate.map((incasare) => (
                  <tr 
                    key={incasare.idIncasare} 
                    className={`hover:bg-slate-50/50 transition-all duration-1000 ${
                      highlightId === incasare.idIncasare 
                        ? 'bg-amber-50 shadow-[inset_0_0_0_2px_rgba(245,158,11,0.2)] scale-[1.01] z-10' 
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {formatData(incasare.dataIncasare)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {incasare.client}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {incasare.referinta || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {incasare.modalitate}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {incasare.alocari?.map((a: any) => `${a.serie}-${a.numar}`).join(', ') || '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {formatSuma(incasare.suma)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nu s-au găsit încasări care să corespundă criteriilor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

