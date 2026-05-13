// Componentă pur vizuală care traduce statusul comenzii într-un badge colorat.
// Logica de business a statusului rămâne în paginile care folosesc badge-ul.
// Cu alte cuvinte, aici decidem doar "cum arată" statusul, nu și "ce înseamnă".
import type { StatusComanda } from "../types";

interface StatusBadgeProps {
  status: StatusComanda;
}

const stiluri: Record<StatusComanda, string> = {
  "In asteptare diagnoza": "bg-slate-100 text-slate-700 border-slate-200",
  "Asteapta aprobare client": "bg-amber-50 text-amber-700 border-amber-200",
  "In asteptare piese": "bg-rose-50 text-rose-700 border-rose-200",
  "In lucru": "bg-sky-50 text-sky-700 border-sky-200",
  "Finalizat": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Facturat: "bg-violet-50 text-violet-700 border-violet-200",
  Anulat: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${stiluri[status]}`}
    >
      {status}
    </span>
  );
}
