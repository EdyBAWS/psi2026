// Placeholder de compatibilitate.
// În MVP, dosarul de daună nu are o pagină separată: el se completează direct
// în fluxul de preluare auto.
// Păstrăm fișierul pentru a arăta clar noua poziționare a funcționalității.
export default function DosarDauna() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800">
        Compatibilitate dosare daune
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Pentru MVP, dosarele de daună sunt selectate sau create direct în fluxul
        de preluare auto din modulul <strong>Operațional</strong>.
      </p>
    </div>
  );
}
