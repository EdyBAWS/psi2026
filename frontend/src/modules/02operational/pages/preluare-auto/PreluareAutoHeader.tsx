import { AlertCircle, CheckCircle2, Car, Wrench, ShieldAlert } from "lucide-react";
import { PageHeader } from "../../../../componente/ui/PageHeader";
import { StatCard } from "../../../../componente/ui/StatCard";

interface PreluareAutoHeaderProps {
  esteLucrareAsigurare: boolean; mesajeBlocare: string[]; numarComandaPreview: string; pasiFlux: string[];
  pasCurent: number; rezumatTotal: string | null; stareDosarTipPolita: string | null;
  vehiculSelectat: { numarInmatriculare: string } | null;
  stats: { vehiculeDisponibile: number; comenziActive: number; dosareDauna: number; };
}

export default function PreluareAutoHeader({ esteLucrareAsigurare, mesajeBlocare, numarComandaPreview, pasiFlux, pasCurent, rezumatTotal, stareDosarTipPolita, vehiculSelectat, stats }: PreluareAutoHeaderProps) {
  
  if (!vehiculSelectat) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-4"><span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Modul Operațional</span></div>
        <PageHeader title="Preluare Auto și Recepție" description="Deschide o comandă nouă prin selectarea unui vehicul din baza de date." />
        <div className="flex flex-wrap gap-4 mt-6">
          <StatCard label="Vehicule Disponibile" value={stats.vehiculeDisponibile} icon={<Car />} />
          <StatCard label="Comenzi Active" value={stats.comenziActive} tone="warning" icon={<Wrench />} />
          <StatCard label="Dosare Daună" value={stats.dosareDauna} tone="info" icon={<ShieldAlert />} />
        </div>
      </div>
    );
  }

  return (
    <div className="sticky -mt-6 top-[-40px] z-40 flex flex-col justify-between gap-4 rounded-b-2xl border-b border-x border-indigo-100 bg-white/95 px-5 py-3 shadow-lg backdrop-blur-md lg:flex-row lg:items-center">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-white shadow-lg shadow-indigo-200">
          <Car className="h-4 w-4" />
          <span className="text-sm font-black tracking-widest uppercase">{vehiculSelectat.numarInmatriculare}</span>
        </div>
        <div className="hidden h-8 w-px bg-slate-200 md:block" />
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Pas {pasCurent}/{pasiFlux.length} - {numarComandaPreview}</p>
          <p className="text-sm font-bold text-slate-700">{pasiFlux[pasCurent - 1]}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {esteLucrareAsigurare && <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-blue-700 text-[10px] font-bold uppercase">Dosar {stareDosarTipPolita}</div>}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-emerald-700 text-[10px] font-bold uppercase">Deviz <span className="ml-1 text-sm font-black">{rezumatTotal || "0,00 RON"}</span></div>
        <div className="relative ml-2">
          {mesajeBlocare.length > 0 ? (
            <div className="group relative">
              <AlertCircle className="h-6 w-6 text-rose-500 cursor-help" />
              <div className="absolute top-full right-0 mt-2 w-64 scale-0 z-50 origin-top-right rounded-xl bg-slate-800 p-3 text-[11px] text-white shadow-2xl transition-all group-hover:scale-100">
                <p className="font-bold text-rose-300 mb-1">Erori:</p>
                {mesajeBlocare.map((m, i) => <p key={i}>• {m}</p>)}
              </div>
            </div>
          ) : <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
        </div>
      </div>
    </div>
  );
}