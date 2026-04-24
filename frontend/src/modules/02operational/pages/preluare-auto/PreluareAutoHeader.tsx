// src/modules/02operational/pages/preluare-auto/PreluareAutoHeader.tsx
import { AlertCircle, CheckCircle2, Car, Wrench, ShieldAlert } from "lucide-react";
import { PageHeader } from "../../../../componente/ui/PageHeader";
import { StatCard } from "../../../../componente/ui/StatCard";

interface PreluareAutoHeaderProps {
  esteLucrareAsigurare: boolean;
  mesajeBlocare: string[];
  nrComandaPreview: string;
  pasiFlux: string[];
  pasCurent: number;
  rezumatTotal: string | null;
  stareDosarTipPolita: string | null;
  vehiculSelectat: { nrInmatriculare: string } | null;
  stats: {
    vehiculeDisponibile: number;
    comenziActive: number;
    dosareDauna: number;
  };
}

export default function PreluareAutoHeader({
  esteLucrareAsigurare,
  mesajeBlocare,
  pasiFlux,
  pasCurent,
  rezumatTotal,
  stareDosarTipPolita,
  vehiculSelectat,
  stats,
}: PreluareAutoHeaderProps) {
  
  // 1. STARE: NICIUN VEHICUL (Header stil unitar)
  if (!vehiculSelectat) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <PageHeader 
          title="Preluare Auto și Recepție" 
          description="Deschide o comandă nouă prin selectarea unui vehicul din baza de date sau adăugarea unuia nou."
        />
        <div className="flex flex-wrap gap-4 mt-6">
          <StatCard label="Vehicule Disponibile" value={stats.vehiculeDisponibile} icon={<Car />} />
          <StatCard label="Comenzi Active" value={stats.comenziActive} tone="warning" icon={<Wrench />} />
          <StatCard label="Dosare Daună" value={stats.dosareDauna} tone="info" icon={<ShieldAlert />} />
        </div>
      </div>
    );
  }

  // 2. STARE: VEHICUL SELECTAT (Bara Sticky Premium)
  return (
    <div className="sticky top-6 z-40 flex flex-col justify-between gap-4 rounded-2xl border border-indigo-100 bg-white/95 p-4 shadow-xl backdrop-blur-md lg:flex-row lg:items-center animate-in slide-in-from-top-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-white shadow-lg shadow-indigo-200">
          <Car className="h-4 w-4" />
          <span className="text-sm font-black tracking-widest uppercase">{vehiculSelectat.nrInmatriculare}</span>
        </div>
        <div className="hidden h-8 w-px bg-slate-200 md:block" />
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Pasul {pasCurent} din {pasiFlux.length}</p>
          <p className="text-sm font-bold text-slate-700">{pasiFlux[pasCurent - 1]}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {esteLucrareAsigurare && (
          <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-blue-700">
            <span className="text-[10px] font-bold uppercase">Dosar {stareDosarTipPolita}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-emerald-700">
          <span className="text-[10px] font-bold uppercase">Deviz</span>
          <span className="text-sm font-black">{rezumatTotal || "0,00 RON"}</span>
        </div>

        <div className="relative ml-2">
          {mesajeBlocare.length > 0 ? (
            <div className="group relative">
              <AlertCircle className="h-6 w-6 text-rose-500 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 scale-0 rounded-xl bg-slate-800 p-3 text-[11px] text-white shadow-2xl transition-all group-hover:scale-100">
                <p className="font-bold text-rose-300 mb-1">Erori de validare:</p>
                {mesajeBlocare.map((m, i) => <p key={i}>• {m}</p>)}
              </div>
            </div>
          ) : (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          )}
        </div>
      </div>
    </div>
  );
}