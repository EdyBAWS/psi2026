import { calculeazaRezumatPozitii } from "../../../calculations";
import StatusBadge from "../../../shared-components/StatusBadge";
import type { DetaliiComandaSelectata } from "../gestiuneComenzi.helpers";
import { formatSuma } from "../gestiuneComenzi.helpers";
import type { PozitieComanda } from "../../../types";

interface GestiuneComenziDetailProps extends DetaliiComandaSelectata { onInchide: () => void; }

export default function GestiuneComenziDetail({ clientSelectat, comandaSelectata, mecanicSelectat, pozitiiComandaSelectata, rezumatSelectat, vehiculSelectat, onInchide }: GestiuneComenziDetailProps) {
  if (!comandaSelectata) return null;
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4"><div className="flex items-start justify-between"><h3 className="text-xl font-bold text-slate-800">{comandaSelectata.numarComanda}</h3><button onClick={onInchide} className="text-slate-400 font-bold">×</button></div><div className="mt-3"><StatusBadge status={comandaSelectata.status ?? "In asteptare diagnoza"} /></div></div>
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div><p className="text-[10px] font-bold uppercase text-slate-400">Client / Vehicul</p><p className="mt-1 font-bold text-slate-800">{clientSelectat?.nume || "Client Necunoscut"}</p><p className="text-sm text-indigo-600 font-semibold">{vehiculSelectat?.numarInmatriculare}</p></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-400">Piese și Manoperă</p><ul className="mt-3 divide-y divide-slate-100">{pozitiiComandaSelectata.map((pozitie: PozitieComanda) => { const valori = calculeazaRezumatPozitii([pozitie]); return (<li key={pozitie.idPozitieCmd} className="py-2 flex justify-between text-sm"><span>{pozitie.descriere}</span><span className="font-bold">{formatSuma(valori.total)}</span></li>); })}</ul></div>
        {mecanicSelectat && <div><p className="text-[10px] font-bold uppercase text-slate-400">Mecanic</p><p className="text-sm font-medium">{mecanicSelectat.nume}</p></div>}
      </div>
      <div className="bg-slate-800 p-5 text-white"><div className="flex justify-between items-end"><span className="text-sm font-bold uppercase text-slate-400">Total Deviz</span><span className="text-2xl font-black text-emerald-400">{formatSuma(rezumatSelectat.total)}</span></div></div>
    </div>
  );
}