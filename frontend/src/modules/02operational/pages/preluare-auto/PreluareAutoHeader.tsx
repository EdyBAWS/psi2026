import { AlertCircle, CheckCircle2, Car, Wrench, ShieldAlert, Info } from "lucide-react";
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

  return null;
}
