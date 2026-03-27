// Componenta afișează doar controalele de filtrare și sortare.
// Toată starea reală stă în pagina părinte, iar acest formular trimite
// schimbările înapoi prin callback-uri.
import { Button } from '../../../../componente/ui/Button';
import type { ComandaService, Mecanic, StatusComanda } from '../../types';
import {
  descriereSortare,
  statusuriFiltrare,
  type GestiuneSortDir,
  type GestiuneSortField,
} from '../gestiuneComenzi.helpers';

interface GestiuneComenziFiltersProps {
  cautare: string;
  doarIntarziate: boolean;
  filtruMecanic: number | 'toate';
  filtruPlata: ComandaService['tipPlata'] | 'Toate';
  filtruStatus: StatusComanda | 'Toate';
  mecanici: Mecanic[];
  onCautareChange: (value: string) => void;
  onDoarIntarziateChange: (value: boolean) => void;
  onFiltruMecanicChange: (value: number | 'toate') => void;
  onFiltruPlataChange: (value: ComandaService['tipPlata'] | 'Toate') => void;
  onFiltruStatusChange: (value: StatusComanda | 'Toate') => void;
  onReset: () => void;
  sortDir: GestiuneSortDir;
  sortField: GestiuneSortField;
}

export default function GestiuneComenziFilters({
  cautare,
  doarIntarziate,
  filtruMecanic,
  filtruPlata,
  filtruStatus,
  mecanici,
  onCautareChange,
  onDoarIntarziateChange,
  onFiltruMecanicChange,
  onFiltruPlataChange,
  onFiltruStatusChange,
  onReset,
  sortDir,
  sortField,
}: GestiuneComenziFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Primul bloc conține filtrele efective.
          Fiecare control schimbă o valoare din starea paginii principale. */}
      <div className="grid gap-4 xl:grid-cols-[1.4fr_repeat(4,0.7fr)] rounded-xl border border-slate-100 bg-slate-50 p-3">
        <input
          type="text"
          value={cautare}
          onChange={(event) => onCautareChange(event.target.value)}
          placeholder="Caută comandă, auto, client..."
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 transition-shadow focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />

        <select
          value={filtruStatus}
          onChange={(event) => onFiltruStatusChange(event.target.value as StatusComanda | 'Toate')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-shadow focus:border-indigo-400 focus:outline-none"
        >
          {statusuriFiltrare.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={filtruMecanic}
          onChange={(event) =>
            onFiltruMecanicChange(
              event.target.value === 'toate' ? 'toate' : Number(event.target.value),
            )
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-shadow focus:border-indigo-400 focus:outline-none"
        >
          <option value="toate">Toți mecanicii</option>
          {mecanici.map((mecanic) => (
            <option key={mecanic.idMecanic} value={mecanic.idMecanic}>
              {mecanic.nume}
            </option>
          ))}
        </select>

        <select
          value={filtruPlata}
          onChange={(event) =>
            onFiltruPlataChange(event.target.value as ComandaService['tipPlata'] | 'Toate')
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-shadow focus:border-indigo-400 focus:outline-none"
        >
          <option value="Toate">Toate plățile</option>
          <option value="Client Direct">Client Direct</option>
          <option value="Flota">Flotă</option>
          <option value="Asigurare">Asigurare</option>
        </select>

        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          <input
            type="checkbox"
            checked={doarIntarziate}
            onChange={(event) => onDoarIntarziateChange(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
          />
          Întârziate
        </label>
      </div>

      {/* Al doilea bloc explică sortarea curentă și oferă reset rapid. */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-500">{descriereSortare(sortField, sortDir)}</p>
        <Button variant="outline" size="sm" onClick={onReset}>
          Resetează filtrele
        </Button>
      </div>
    </div>
  );
}
