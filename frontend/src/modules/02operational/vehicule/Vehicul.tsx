// Placeholder de compatibilitate.
// Modulul nou folosește `pages/PreluareAuto.tsx`, iar acest fișier rămâne doar
// pentru a explica unde a fost mutată logica veche.
// Îl păstrăm pentru a evita confuzii sau importuri rupte în cazul în care alte părți
// din proiect se mai uită încă spre vechea structură.
export default function Vehicul() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800">
        Compatibilitate vehicule
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Fluxul de selecție a vehiculului este gestionat în noul modul
        <strong> Operațional </strong>
        prin pagina de preluare auto.
      </p>
    </div>
  );
}

