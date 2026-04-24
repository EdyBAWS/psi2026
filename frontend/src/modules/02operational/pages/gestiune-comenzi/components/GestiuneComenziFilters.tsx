// src/modules/02operational/pages/gestiune-comenzi/components/GestiuneComenziFilters.tsx
import { Search, RotateCcw } from "lucide-react";
import type { ComandaService, Mecanic, StatusComanda } from "../../../types";
import { descriereSortare, statusuriFiltrare, type GestiuneSortDir, type GestiuneSortField } from "../gestiuneComenzi.helpers";

interface GestiuneComenziFiltersProps {
  cautare: string;
  doarIntarziate: boolean;
  filtruMecanic: number | "toate";
  filtruPlata: ComandaService["tipPlata"] | "Toate";
  filtruStatus: StatusComanda | "Toate";
  mecanici: Mecanic[];
  onCautareChange: (value: string) => void;
  onDoarIntarziateChange: (value: boolean) => void;
  onFiltruMecanicChange: (value: number | "toate") => void;
  onFiltruPlataChange: (value: ComandaService["tipPlata"] | "Toate") => void;
  onFiltruStatusChange: (value: StatusComanda | "Toate") => void;
  onReset: () => void;
  sortDir: GestiuneSortDir;
  sortField: GestiuneSortField;
}

export default function GestiuneComenziFilters(props: GestiuneComenziFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        <div className="relative xl:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={props.cautare}
            onChange={(e) => props.onCautareChange(e.target.value)}
            placeholder="Căutare rapidă..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <select
          value={props.filtruStatus}
          onChange={(e) => props.onFiltruStatusChange(e.target.value as any)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {statusuriFiltrare.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={props.filtruMecanic}
          onChange={(e) => props.onFiltruMecanicChange(e.target.value === "toate" ? "toate" : Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="toate">Toți mecanicii</option>
          {props.mecanici.map((m) => <option key={m.idMecanic} value={m.idMecanic}>{m.nume}</option>)}
        </select>

        <select
          value={props.filtruPlata}
          onChange={(e) => props.onFiltruPlataChange(e.target.value as any)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="Toate">Toate plățile</option>
          <option value="Client Direct">Client Direct</option>
          <option value="Flota">Flotă</option>
          <option value="Asigurare">Asigurare</option>
        </select>

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            checked={props.doarIntarziate}
            onChange={(e) => props.onDoarIntarziateChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
          />
          <span className={props.doarIntarziate ? "text-rose-600" : ""}>Depășite</span>
        </label>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {descriereSortare(props.sortField, props.sortDir)}
        </p>
        <button 
          onClick={props.onReset}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Resetează filtrele
        </button>
      </div>
    </div>
  );
}