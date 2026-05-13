import { useEffect, useState } from "react";
import { calculeazaRezumatPozitii } from "../../../calculations";
import StatusBadge from "../../../shared-components/StatusBadge";
import { type DetaliiComandaSelectata, formatSuma } from "../gestiuneComenzi.helpers";
import type { ComandaService, Mecanic, PozitieComanda, StatusComanda } from "../../../types";

interface GestiuneComenziDetailProps extends DetaliiComandaSelectata {
  mecanici: Mecanic[];
  onActualizeazaComanda: (idComanda: number, modificari: Partial<ComandaService>) => Promise<void>;
  onInchide: () => void;
}

const formatInputDate = (valoare: Date | string | null | undefined) => {
  if (!valoare) return "";
  const date = typeof valoare === "string" ? new Date(valoare) : valoare;
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

export default function GestiuneComenziDetail({
  clientSelectat,
  comandaSelectata,
  mecanici,
  mecanicSelectat,
  pozitiiComandaSelectata,
  rezumatSelectat,
  vehiculSelectat,
  onActualizeazaComanda,
  onInchide,
}: GestiuneComenziDetailProps) {
  const [editareActiva, setEditareActiva] = useState(false);
  const [status, setStatus] = useState<StatusComanda>("In asteptare diagnoza");
  const [idMecanic, setIdMecanic] = useState<number | null>(null);
  const [termenPromis, setTermenPromis] = useState("");
  const [salvareInCurs, setSalvareInCurs] = useState(false);

  useEffect(() => {
    if (!comandaSelectata) return;

    setStatus(comandaSelectata.status ?? "In asteptare diagnoza");
    setIdMecanic(comandaSelectata.idMecanic);
    setTermenPromis(formatInputDate(comandaSelectata.termenPromis));
    setEditareActiva(false);
  }, [comandaSelectata]);

  if (!comandaSelectata) return null;

  const handleSalveaza = async () => {
    setSalvareInCurs(true);
    try {
      await onActualizeazaComanda(comandaSelectata.idComanda, {
        status,
        idMecanic,
        termenPromis: termenPromis ? new Date(`${termenPromis}T00:00:00`) : undefined,
      });
      setEditareActiva(false);
    } finally {
      setSalvareInCurs(false);
    }
  };

  const isFacturat = comandaSelectata.status === "Facturat";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{comandaSelectata.numarComanda}</h3>
            <div className="mt-3"><StatusBadge status={comandaSelectata.status ?? "In asteptare diagnoza"} /></div>
          </div>
          <div className="flex items-center gap-2">
            {isFacturat ? (
              <span className="flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-600">
                🔒 Facturat
              </span>
            ) : (
              <button onClick={() => setEditareActiva((value) => !value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-700">
                {editareActiva ? "Renunță" : "Editează"}
              </button>
            )}
            <button onClick={onInchide} className="text-slate-400 font-bold">×</button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {editareActiva && !isFacturat ? (
          <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Status</label>
              <select value={status} onChange={(event) => setStatus(event.target.value as StatusComanda)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium">
                <option value="In asteptare diagnoza">În așteptare diagnoză</option>
                <option value="Asteapta aprobare client">Așteaptă aprobare client</option>
                <option value="In asteptare piese">În așteptare piese</option>
                <option value="In lucru">În lucru</option>
                <option value="Finalizat">Finalizat</option>
                <option value="Facturat" disabled>Facturat</option>
                <option value="Anulat">Anulat</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Mecanic</label>
              <select value={idMecanic ?? ""} onChange={(event) => setIdMecanic(event.target.value ? Number(event.target.value) : null)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium">
                <option value="">Nealocat</option>
                {mecanici.map((mecanic) => (
                  <option key={mecanic.idMecanic} value={mecanic.idMecanic}>{mecanic.nume}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">Termen promis</label>
              <input type="date" value={termenPromis} onChange={(event) => setTermenPromis(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium" />
            </div>
            <button onClick={handleSalveaza} disabled={salvareInCurs} className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300">
              {salvareInCurs ? "Se salvează..." : "Salvează modificările"}
            </button>
          </div>
        ) : null}
        <div><p className="text-[10px] font-bold uppercase text-slate-400">Client / Vehicul</p><p className="mt-1 font-bold text-slate-800">{clientSelectat?.nume || "Client Necunoscut"}</p><p className="text-sm text-indigo-600 font-semibold">{vehiculSelectat?.numarInmatriculare}</p></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-400">Piese și Manoperă</p><ul className="mt-3 divide-y divide-slate-100">{pozitiiComandaSelectata.map((pozitie: PozitieComanda) => { const valori = calculeazaRezumatPozitii([pozitie]); return (<li key={pozitie.idPozitieCmd} className="py-2 flex justify-between text-sm"><span>{pozitie.descriere}</span><span className="font-bold">{formatSuma(valori.total)}</span></li>); })}</ul></div>
        {mecanicSelectat && <div><p className="text-[10px] font-bold uppercase text-slate-400">Mecanic</p><p className="text-sm font-medium">{mecanicSelectat.nume}</p></div>}
      </div>
      <div className="bg-slate-800 p-5 text-white"><div className="flex justify-between items-end"><span className="text-sm font-bold uppercase text-slate-400">Total Deviz</span><span className="text-2xl font-black text-emerald-400">{formatSuma(rezumatSelectat.total)}</span></div></div>
    </div>
  );
}