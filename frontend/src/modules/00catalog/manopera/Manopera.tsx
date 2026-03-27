import { useState } from 'react';
import { toast } from 'sonner';
import { StatCard } from '../../../componente/ui/StatCard';
import { manoperaCatalogMock } from '../../../mock/catalog';

// Acesta este un catalog local de operațiuni de manoperă.
// Fluxul este intenționat simplu: utilizatorul adaugă rapid un cod și o durată standard.
interface ManoperaItem {
  idManopera: number;
  codManopera: string;
  durataStd: number;
}

export default function Manopera() {
  const [listaManopera, setListaManopera] = useState<ManoperaItem[]>(manoperaCatalogMock);

  // State pentru a afișa/ascunde formularul
  const [arataFormular, setArataFormular] = useState(false);
  
  // State pentru câmpurile formularului
  const [codManopera, setCodManopera] = useState('');
  const [durataStd, setDurataStd] = useState('');

  const durataMedie =
    listaManopera.length === 0
      ? 0
      : listaManopera.reduce((total, item) => total + item.durataStd, 0) / listaManopera.length;

  const handleSalvare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codManopera || !durataStd) {
      toast.error('Te rog completează ambele câmpuri.');
      return;
    }

    // În MVP folosim un id temporar și stocăm totul local în listă.
    const nouaManopera: ManoperaItem = {
      idManopera: Date.now(), // Generăm un ID temporar
      codManopera: codManopera.toUpperCase(),
      durataStd: Number(durataStd),
    };

    // Toast-ul înlocuiește vechiul `alert(...)` și lasă utilizatorul să continue fluxul.
    setListaManopera([nouaManopera, ...listaManopera]);
    toast.success('Operațiunea de manoperă a fost adăugată.');
    setCodManopera('');
    setDurataStd('');
    setArataFormular(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Catalog Manoperă</h2>
          <p className="text-slate-500 mt-1 text-sm">Gestionarea timpilor standard de reparație</p>
        </div>
        <button 
          onClick={() => setArataFormular(!arataFormular)}
          className={`${arataFormular ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white'} hover:opacity-90 px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all`}
        >
          {arataFormular ? 'Anulează' : '+ Adaugă Operațiune'}
        </button>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <StatCard label="Operațiuni" value={listaManopera.length} />
        <StatCard label="Durată medie" value={`${durataMedie.toFixed(1)}h`} tone="info" />
        <StatCard
          label="Durată maximă"
          value={`${Math.max(...listaManopera.map((item) => item.durataStd), 0).toFixed(1)}h`}
          tone="warning"
        />
      </div>

      {/* Formularul de Adăugare (vizibil doar dacă arataFormular e true) */}
      {arataFormular && (
        <form onSubmit={handleSalvare} className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Cod Manoperă</label>
            <input 
              type="text" 
              value={codManopera}
              onChange={(e) => setCodManopera(e.target.value)}
              placeholder="ex: MAN-FILTRU"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Durată Standard (Ore)</label>
            <input 
              type="number" 
              step="0.1"
              value={durataStd}
              onChange={(e) => setDurataStd(e.target.value)}
              placeholder="ex: 1.5"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm transition-colors h-10.5">
            Salvează
          </button>
        </form>
      )}

      {/* Tabelul */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Cod Manoperă</th>
              <th className="py-3 px-4 text-right">Durată Standard (Ore)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listaManopera.map((item) => (
              <tr key={item.idManopera} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-800">{item.codManopera}</td>
                <td className="py-3 px-4 text-right text-indigo-600 font-bold">{item.durataStd.toFixed(2)}h</td>
              </tr>
            ))}
            {listaManopera.length === 0 && (
              <tr><td colSpan={2} className="py-4 text-center text-slate-500">Nu există date.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
