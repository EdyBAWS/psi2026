// Tabelul este componenta vizuală a listei de comenzi.
// El nu filtrează și nu sortează singur datele; primește deja o listă pregătită
// de pagina părinte și doar o afișează.
import StatusBadge from "../../components/StatusBadge";
import type {
  ComandaFiltrataContext,
  GestiuneSortDir,
  GestiuneSortField,
} from "../gestiuneComenzi.helpers";
import { formatData, formatSuma } from "../gestiuneComenzi.helpers";

const sortLabels: Record<GestiuneSortField, string> = {
  data: "Dată",
  nrComanda: "Comandă",
  status: "Status",
  valoare: "Valoare Deviz",
  vehicul: "Client / Vehicul",
};

function SortIcon({
  field,
  sortDir,
  sortField,
}: {
  field: GestiuneSortField;
  sortDir: GestiuneSortDir;
  sortField: GestiuneSortField;
}) {
  // Iconul nu face sortarea; doar reflectă starea curentă a sortării.
  const active = sortField === field;

  return (
    <svg
      className={`ml-1.5 inline-block h-3.5 w-3.5 transition-transform duration-300 ${
        active ? "text-indigo-500" : "text-slate-300 group-hover:text-slate-400"
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {active && sortDir === "asc" ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 15l7-7 7 7"
        />
      ) : active && sortDir === "desc" ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M19 9l-7 7-7-7"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
        />
      )}
    </svg>
  );
}

interface GestiuneComenziTableProps {
  comenzi: ComandaFiltrataContext[];
  idComandaSelectata: number | null;
  onSelecteazaComanda: (idComanda: number | null) => void;
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
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        {/* Structura clasică de tabel HTML este:
            `table` -> `thead` / `tbody` -> `tr` -> `th` / `td`. */}
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              {(
                [
                  "nrComanda",
                  "data",
                  "vehicul",
                  "status",
                  "valoare",
                ] as GestiuneSortField[]
              ).map((field) => (
                <th
                  key={field}
                  className={`group cursor-pointer select-none px-6 py-4 transition-colors hover:bg-slate-100 ${
                    field === "valoare" ? "text-right" : ""
                  }`}
                  // Când utilizatorul apasă pe antetul unei coloane,
                  // trimitem înapoi numele câmpului după care trebuie făcută sortarea.
                  onClick={() => onSort(field)}
                >
                  {sortLabels[field]}
                  <SortIcon
                    field={field}
                    sortField={sortField}
                    sortDir={sortDir}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comenzi.map(({ client, comanda, intarziata, vehicul }) => {
              const esteSelectata = idComandaSelectata === comanda.idComanda;

              return (
                <tr
                  key={comanda.idComanda}
                  className={`group/row relative cursor-pointer align-middle transition-all duration-200 ease-out ${
                    esteSelectata
                      ? "bg-indigo-50/60 shadow-[inset_4px_0_0_0_rgba(99,102,241,1)]"
                      : "hover:-translate-y-px hover:bg-slate-50/80 hover:shadow-sm"
                  }`}
                  // Aici nu modificăm rândul local.
                  // Spunem doar părintelui ce comandă a fost selectată.
                  onClick={() =>
                    onSelecteazaComanda(
                      esteSelectata ? null : comanda.idComanda,
                    )
                  }
                >
                  <td className="px-6 py-4">
                    <p
                      className={`font-bold ${esteSelectata ? "text-indigo-800" : "text-slate-800"}`}
                    >
                      {comanda.nrComanda}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-600">
                      {formatData(comanda.dataDeschidere)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] font-bold text-indigo-700">
                      {vehicul ? vehicul.nrInmatriculare : "-"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {client?.nume ?? "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {/* Într-o singură coloană combinăm și badge-ul de status,
                        și avertizarea de întârziere, pentru un rezumat rapid. */}
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusBadge status={comanda.status} />
                      {intarziata ? (
                        <span className="text-[10px] font-bold uppercase text-rose-600">
                          Termen depășit
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-base font-bold text-slate-800">
                      {formatSuma(comanda.totalEstimat)}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {comanda.tipPlata}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
