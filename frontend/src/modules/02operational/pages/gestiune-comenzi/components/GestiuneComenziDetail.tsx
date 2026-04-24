import { calculeazaRezumatPozitii } from "../../../calculations";
import StatusBadge from "../../../shared-components/StatusBadge";
import type { DetaliiComandaSelectata } from "../gestiuneComenzi.helpers";
import { formatData, formatSuma } from "../gestiuneComenzi.helpers";

const badgePrioritate = (
  prioritate?: string,
) => {
  if (!prioritate) return null;
  const stiluri: Record<string, string> = {
    Scazuta: "border-slate-200 bg-slate-100 text-slate-700",
    Normala: "border-indigo-200 bg-indigo-50 text-indigo-700",
    Ridicata: "border-amber-200 bg-amber-50 text-amber-700",
    Urgenta: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${stiluri[prioritate] || stiluri.Normala}`}
    >
      {prioritate}
    </span>
  );
};

interface GestiuneComenziDetailProps extends DetaliiComandaSelectata {
  onInchide: () => void;
}

export default function GestiuneComenziDetail({
  asiguratorSelectat,
  clientSelectat,
  comandaSelectata,
  dosarSelectat,
  mecanicSelectat,
  pozitiiComandaSelectata,
  rezumatSelectat,
  vehiculSelectat,
  onInchide,
}: GestiuneComenziDetailProps) {
  // Am scos conditia stricta de `clientSelectat`. Acum blocam randarea doar 
  // daca lipseste complet comanda, ceea ce e normal.
  if (!comandaSelectata) return null;

  // Extragem numele sigur, tratând și cazul în care e firmă (`denumireCompanie`) 
  // sau datele sunt complet lipsă din cauza mock-urilor.
  const numeClient = clientSelectat
    ? (clientSelectat.nume || (clientSelectat as any).denumireCompanie || "Client Necunoscut")
    : "Client Necunoscut";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">
                {comandaSelectata.nrComanda}
              </h3>
              {badgePrioritate(comandaSelectata.prioritate)}
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Deschisă: {formatData(comandaSelectata.dataDeschidere)}
            </p>
          </div>
          <button
            type="button"
            onClick={onInchide}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-4">
          <StatusBadge status={comandaSelectata.status} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Client
            </p>
            <p className="mt-2 text-lg font-bold text-slate-800">
              {numeClient}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {clientSelectat?.telefon || "-"}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Vehicul
            </p>
            <p className="mt-2 text-sm font-bold text-slate-800">
              {vehiculSelectat?.nrInmatriculare || "Fără număr"}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {vehiculSelectat ? `${vehiculSelectat.marca} ${vehiculSelectat.model}` : "Fără detalii"}
            </p>
          </div>
        </div>

        <div className="border-b border-slate-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Operațional
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Mecanic alocat</p>
              <p className="font-semibold text-slate-700">
                {mecanicSelectat?.nume || "Nealocat"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Termen promis</p>
              <p className="font-semibold text-slate-700">
                {formatData(comandaSelectata.termenPromis)}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500">Simptome reclamate</p>
              <p className="text-sm font-medium text-slate-700">
                {comandaSelectata.simptomeReclamate || "-"}
              </p>
            </div>
          </div>
        </div>

        {comandaSelectata.tipPlata === "Asigurare" && dosarSelectat ? (
          <div className="border-b border-slate-100 bg-blue-50/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
              Dosar Daună
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Număr dosar</p>
                <p className="font-semibold text-slate-800">
                  {dosarSelectat.nrDosar}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Asigurator</p>
                <p className="font-semibold text-slate-800">
                  {asiguratorSelectat?.denumire || "Necunoscut"}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {pozitiiComandaSelectata.length > 0 ? (
          <ul className="divide-y divide-slate-100 p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Piese și Manoperă
            </p>
            {pozitiiComandaSelectata.map((pozitie) => {
              const valori = calculeazaRezumatPozitii([pozitie]);
              return (
                <li key={pozitie.idPozitieCmd} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {pozitie.descriere}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {pozitie.cantitate} {pozitie.unitateMasura} ×{" "}
                        {formatSuma(pozitie.pretVanzare)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">
                        {formatSuma(valori.total)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-8 text-center text-sm text-slate-400">
            Nicio poziție adăugată pe deviz.
          </div>
        )}
      </div>

      <div className="mt-auto shrink-0 bg-slate-800 p-5 text-white">
        <div className="mb-2 flex justify-between text-xs text-slate-400">
          <span>Subtotal</span>
          <span className="font-medium text-white">
            {formatSuma(rezumatSelectat.subtotal)}
          </span>
        </div>
        <div className="mb-3 flex justify-between border-b border-slate-700 pb-3 text-xs text-slate-400">
          <span>TVA (19%)</span>
          <span className="font-medium text-white">
            {formatSuma(rezumatSelectat.tva)}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Total
          </span>
          <span className="text-2xl font-black tracking-tight text-emerald-400">
            {formatSuma(rezumatSelectat.total)}
          </span>
        </div>
      </div>
    </div>
  );
}