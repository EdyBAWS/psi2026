// src/modules/02operational/pages/gestiune-comenzi/components/GestiuneComenziTable.tsx
import StatusBadge from "../../../shared-components/StatusBadge";
import type {
  ComandaFiltrataContext,
  GestiuneSortDir,
  GestiuneSortField,
} from "../gestiuneComenzi.helpers";
import { formatData, formatSuma } from "../gestiuneComenzi.helpers";

const sortLabels: Record<GestiuneSortField, string> = {
  data: "Dată",
  numarComanda: "Comandă",
  status: "Status",
  valoare: "Valoare Deviz",
  vehicul: "Client / Vehicul",
};

interface GestiuneComenziTableProps {
  comenzi: ComandaFiltrataContext[];
  idComandaSelectata: number | null;
  onSelecteazaComanda: (id: number | null) => void;
  onSort: (field: GestiuneSortField) => void;
  sortDir: GestiuneSortDir;
  sortField: GestiuneSortField;
}

export default function GestiuneComenziTable({
  comenzi,
  idComandaSelectata,
  onSelecteazaComanda,
  onSort,
  sortDir,
  sortField,
}: GestiuneComenziTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b">
          <tr>
            <th className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => onSort("numarComanda")}>
              {sortLabels.numarComanda} {sortField === "numarComanda" && (sortDir === "asc" ? "↑" : "↓")}
            </th>
            <th className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => onSort("data")}>
              {sortLabels.data} {sortField === "data" && (sortDir === "asc" ? "↑" : "↓")}
            </th>
            <th className="px-6 py-4">Vehicul / Client</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => onSort("valoare")}>
              {sortLabels.valoare} {sortField === "valoare" && (sortDir === "asc" ? "↑" : "↓")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {comenzi.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Nicio comandă găsită.</td></tr>
          ) : (
            comenzi.map(({ client, comanda, intarziata, vehicul }) => (
              <tr 
                key={comanda.idComanda} 
                onClick={() => onSelecteazaComanda(idComandaSelectata === comanda.idComanda ? null : comanda.idComanda)}
                className={`cursor-pointer transition-all duration-500 hover:bg-slate-50 ${idComandaSelectata === comanda.idComanda ? 'bg-indigo-50 shadow-[inset_0_0_0_2px_rgba(79,70,229,0.2)] animate-[pulse_2s_ease-in-out_infinite]' : ''}`}
              >
                <td className="px-6 py-4 font-bold text-slate-800">{comanda.numarComanda}</td>
                <td className="px-6 py-4 text-slate-500">{formatData(comanda.dataDeschidere)}</td>
                <td className="px-6 py-4">
                  <p className="text-[13px] font-bold text-indigo-700">{vehicul ? vehicul.numarInmatriculare : "-"}</p>
                  <p className="mt-1 text-xs font-medium text-slate-600">{client?.nume ?? "-"}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-start gap-1.5">
                    <StatusBadge status={comanda.status ?? "In asteptare diagnoza"} />
                    {intarziata && <span className="text-[10px] font-bold uppercase text-rose-600">Termen depășit</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-base font-bold text-slate-800">{formatSuma(comanda.totalEstimat ?? 0)}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{comanda.tipPlata || "-"}</p>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}