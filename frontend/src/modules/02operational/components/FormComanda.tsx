// Componenta afișează antetul comenzii și deleagă tabelul de poziții către
// `TabelPozitii`. Ea nu salvează nimic singură, ci primește și trimite
// starea către pagina părinte.
import TabelPozitii from './TabelPozitii';
import type { Mecanic, PozitieComandaDraft, Vehicul } from '../types';

interface FormComandaProps {
  idMecanicSelectat: number | null;
  mecanici: Mecanic[];
  nrComandaPreview: string;
  pozitii: PozitieComandaDraft[];
  totalEstimat: number;
  vehicul: Vehicul;
  onMecanicChange: (idMecanic: number | null) => void;
  onPozitiiChange: (pozitii: PozitieComandaDraft[]) => void;
}

const formatSuma = (valoare: number) =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 2,
  }).format(valoare);

export default function FormComanda({
  idMecanicSelectat,
  mecanici,
  nrComandaPreview,
  pozitii,
  totalEstimat,
  vehicul,
  onMecanicChange,
  onPozitiiChange,
}: FormComandaProps) {
  return (
    <div className="space-y-5">
      {/* Antetul explică pe ce vehicul se deschide comanda și ce total s-a acumulat. */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Comandă pregătită
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-800">{nrComandaPreview}</h3>
            <p className="mt-2 text-sm text-slate-500">
              Vehicul selectat: {vehicul.marca} {vehicul.model} · {vehicul.nrInmatriculare}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status inițial
              </p>
              <p className="mt-2 text-lg font-bold text-slate-800">Deschis</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total estimat
              </p>
              <p className="mt-2 text-lg font-bold text-slate-800">{formatSuma(totalEstimat)}</p>
            </div>
          </div>
        </div>

        {/* Zona de selecție a mecanicului și regulile minime ale MVP-ului. */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Mecanic responsabil
            </label>
            <select
              value={idMecanicSelectat ?? ''}
              onChange={(event) =>
                onMecanicChange(event.target.value === '' ? null : Number(event.target.value))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selectează mecanic</option>
              {mecanici.map((mecanic) => (
                <option key={mecanic.idMecanic} value={mecanic.idMecanic}>
                  {mecanic.nume} · {mecanic.specialitate}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold text-slate-700">Reguli MVP</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-500">
              <li>Comanda se salvează doar cu vehicul selectat.</li>
              <li>Trebuie ales un mecanic responsabil.</li>
              <li>Fiecare poziție trebuie completată înainte de salvare.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabelul gestionează efectiv liniile de piese/manoperă. */}
      <TabelPozitii pozitii={pozitii} onChange={onPozitiiChange} />
    </div>
  );
}
