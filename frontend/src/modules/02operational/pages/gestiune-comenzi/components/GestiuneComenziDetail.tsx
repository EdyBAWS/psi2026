import { useEffect, useState } from "react";
import { calculeazaRezumatPozitii } from "../../../calculations";
import StatusBadge from "../../../shared-components/StatusBadge";
import { type DetaliiComandaSelectata, formatSuma } from "../gestiuneComenzi.helpers";
import type { CatalogKit, CatalogManopera, CatalogPiesa, ComandaService, Mecanic, PozitieComanda, PozitieComandaDraft, StatusComanda } from "../../../types";
import TabelPozitii from "../../../shared-components/TabelPozitii";
import { User, Car, Clock, ShieldCheck, Save, X, Edit3, Settings2, Trash2 } from "lucide-react";

interface GestiuneComenziDetailProps extends DetaliiComandaSelectata {
  mecanici: Mecanic[];
  catalogPiese: CatalogPiesa[];
  catalogManopere: CatalogManopera[];
  catalogKituri: CatalogKit[];
  onActualizeazaComanda: (idComanda: number, modificari: Partial<ComandaService>) => Promise<void>;
  onActualizeazaPozitii: (idComanda: number, pozitii: PozitieComandaDraft[]) => Promise<void>;
  onStergeComanda: (idComanda: number) => Promise<void>;
  onInchide: () => void;
}

const formatInputDate = (valoare: Date | string | null | undefined) => {
  if (!valoare) return "";
  const date = typeof valoare === "string" ? new Date(valoare) : valoare;
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const toDraft = (p: PozitieComanda): PozitieComandaDraft => ({
  _draftId: Math.random().toString(36).substring(7),
  tipPozitie: p.tipPozitie,
  catalogId: p.idPiesa || p.idKit || p.idManopera,
  codArticol: p.codArticol,
  descriere: p.descriere,
  unitateMasura: p.unitateMasura,
  cantitate: p.cantitate,
  pretVanzare: p.pretVanzare,
  discountProcent: p.discountProcent,
  cotaTVA: p.cotaTVA,
  disponibilitateStoc: p.disponibilitateStoc,
  observatiiPozitie: p.observatiiPozitie
});

export default function GestiuneComenziDetail({
  clientSelectat,
  comandaSelectata,
  mecanici,
  catalogPiese,
  catalogManopere,
  catalogKituri,
  mecaniciSelectati,
  pozitiiComandaSelectata,
  rezumatSelectat,
  vehiculSelectat,
  onActualizeazaComanda,
  onActualizeazaPozitii,
  onStergeComanda,
  onInchide,
}: GestiuneComenziDetailProps) {
  const [editareStatus, setEditareStatus] = useState(false);
  const [editareArticole, setEditareArticole] = useState(false);

  const [status, setStatus] = useState<StatusComanda>("In asteptare diagnoza");
  const [idMecanici, setIdMecanici] = useState<number[]>([]);
  const [termenPromis, setTermenPromis] = useState("");
  const [salvareInCurs, setSalvareInCurs] = useState(false);

  const [pozitiiLocale, setPozitiiLocale] = useState<PozitieComandaDraft[]>([]);

  useEffect(() => {
    if (!comandaSelectata) return;
    setStatus(comandaSelectata.status ?? "In asteptare diagnoza");
    setIdMecanici(comandaSelectata.idMecanici ?? (comandaSelectata.idMecanic ? [comandaSelectata.idMecanic] : []));
    setTermenPromis(formatInputDate(comandaSelectata.termenPromis));
    setPozitiiLocale(pozitiiComandaSelectata.map(toDraft));
    setEditareStatus(false);
    setEditareArticole(false);
  }, [comandaSelectata, pozitiiComandaSelectata]);

  if (!comandaSelectata) return null;

  const handleSalveazaStatus = async () => {
    setSalvareInCurs(true);
    try {
      await onActualizeazaComanda(comandaSelectata.idComanda, {
        status,
        idMecanici,
        termenPromis: termenPromis ? new Date(`${termenPromis}T00:00:00`) : undefined,
      });
      setEditareStatus(false);
    } finally {
      setSalvareInCurs(false);
    }
  };

  const handleSalveazaArticole = async () => {
    setSalvareInCurs(true);
    try {
      await onActualizeazaPozitii(comandaSelectata.idComanda, pozitiiLocale);
      setEditareArticole(false);
    } finally {
      setSalvareInCurs(false);
    }
  };

  const handleSterge = async () => {
    if (!window.confirm("Ești sigur că vrei să ștergi definitiv această comandă? Această acțiune este ireversibilă.")) return;
    
    setSalvareInCurs(true);
    try {
      await onStergeComanda(comandaSelectata.idComanda);
      onInchide();
    } finally {
      setSalvareInCurs(false);
    }
  };

  const isFacturat = comandaSelectata.status === "Facturat";
  const isAnulat = comandaSelectata.status === "Anulat";

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Header - Mai curat */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-8 py-6">
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{comandaSelectata.numarComanda}</h3>
              <StatusBadge status={comandaSelectata.status ?? "In asteptare diagnoza"} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Detalii Comandă Reparație</p>
          </div>
        </div>
        <button
          id="btn-close-comanda-detail"
          onClick={onInchide}
          className="group flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Stânga */}
        <div className="w-[360px] shrink-0 border-r border-slate-100 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Client & Vehicul */}
          <section className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Informații Generale</div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">{clientSelectat?.nume || "Client Necunoscut"}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">{clientSelectat?.tipClient}</p>
                </div>
              </div>
              <div className="h-px bg-slate-50" />
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-indigo-600 tracking-tight uppercase">{vehiculSelectat?.numarInmatriculare}</p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">{vehiculSelectat?.marca} {vehiculSelectat?.model}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Status & Operativ */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status & Echipa</div>
              {!isFacturat && (
                <button
                  id="btn-edit-status"
                  onClick={() => setEditareStatus(!editareStatus)}
                  className="text-[10px] font-black uppercase text-indigo-600 hover:underline"
                >
                  {editareStatus ? "Anulează" : "Modifică"}
                </button>
              )}
            </div>

            <div className={`rounded-2xl border transition-all ${editareStatus ? "border-indigo-200 bg-white p-6 shadow-md" : "border-slate-100 bg-white p-6 shadow-sm"}`}>
              {editareStatus ? (
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Status</label>
                    <select
                      id="select-status-comanda"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as StatusComanda)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="In asteptare diagnoza">În așteptare diagnoză</option>
                      <option value="Asteapta aprobare client">Așteaptă aprobare client</option>
                      <option value="In asteptare piese">În așteptare piese</option>
                      <option value="In lucru">În lucru</option>
                      <option value="Finalizat">Finalizat</option>
                      <option value="Anulat">Anulat</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Termen Finalizare</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="date"
                        value={termenPromis}
                        onChange={(e) => setTermenPromis(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Mecanici</label>
                    <div className="flex flex-wrap gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 min-h-[44px]">
                      {idMecanici.map(id => {
                        const m = mecanici.find(m => m.idMecanic === id);
                        return m ? (
                          <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white text-indigo-700 text-[10px] font-black border border-indigo-100">
                            {m.nume}
                            <button onClick={() => setIdMecanici(prev => prev.filter(mid => mid !== id))} className="text-slate-400 hover:text-rose-600 transition-colors">×</button>
                          </span>
                        ) : null;
                      })}
                      <select
                        value=""
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          if (id && !idMecanici.includes(id)) setIdMecanici(prev => [...prev, id]);
                        }}
                        className="flex-1 min-w-[80px] bg-transparent text-[10px] font-bold focus:outline-none"
                      >
                        <option value="">+ Adaugă</option>
                        {mecanici.filter(m => !idMecanici.includes(m.idMecanic)).map(m => (
                          <option key={m.idMecanic} value={m.idMecanic}>{m.nume}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    id="btn-save-status"
                    onClick={handleSalveazaStatus}
                    disabled={salvareInCurs}
                    className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-black text-white hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:bg-slate-200 shadow-lg shadow-indigo-100"
                  >
                    {salvareInCurs ? "Actualizare..." : "Salvează"}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase text-slate-400">Termen Promis</p>
                    <p className="text-sm font-bold text-slate-700">{termenPromis ? new Date(termenPromis).toLocaleDateString('ro-RO') : "Nespecificat"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Echipă Alocată</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mecaniciSelectati.length > 0 ? mecaniciSelectati.map(m => (
                        <div key={m.idMecanic} className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600">
                          {m.nume}
                        </div>
                      )) : <p className="text-xs text-slate-400 italic">Niciun mecanic alocat</p>}
                    </div>
                  </div>
                </div>
              )}

              {isAnulat && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <button
                    onClick={handleSterge}
                    disabled={salvareInCurs}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 py-3 text-sm font-black text-rose-600 hover:bg-rose-100 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {salvareInCurs ? "Se șterge..." : "Șterge Comanda"}
                  </button>
                  <p className="mt-2 text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider">
                    Comanda poate fi ștearsă deoarece este anulată
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Zona Principală */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">Articole Deviz</h4>
              <p className="text-xs font-bold text-slate-400">Piese de schimb și manoperă service</p>
            </div>
            {!isFacturat && (
              <button
                onClick={() => setEditareArticole(!editareArticole)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all ${editareArticole
                  ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100"
                  }`}
              >
                {editareArticole ? <><X className="h-4 w-4" /> Anulează Editarea</> : <><Edit3 className="h-4 w-4" /> Editează Deviz</>}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {editareArticole ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <TabelPozitii
                  catalogKituri={catalogKituri}
                  catalogManopere={catalogManopere}
                  catalogPiese={catalogPiese}
                  pozitii={pozitiiLocale}
                  onChange={setPozitiiLocale}
                />
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSalveazaArticole}
                    disabled={salvareInCurs}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-4 text-base font-black text-white hover:bg-slate-800 active:scale-[0.98] transition-all disabled:bg-slate-300"
                  >
                    <Save className="h-5 w-5" />
                    {salvareInCurs ? "Se salvează..." : "Salvează Devizul"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="px-6 py-4">Articol</th>
                        <th className="px-6 py-4 text-center">Cant.</th>
                        <th className="px-6 py-4 text-right">Preț Unitar</th>
                        <th className="px-6 py-4 text-right">Valoare</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pozitiiComandaSelectata.length > 0 ? pozitiiComandaSelectata.map((pozitie: PozitieComanda) => {
                        const valori = calculeazaRezumatPozitii([pozitie]);
                        return (
                          <tr key={pozitie.idPozitieCmd} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-5">
                              <p className="font-bold text-slate-800">{pozitie.descriere}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[9px] font-black uppercase tracking-wider ${pozitie.tipPozitie === 'Manopera' ? 'text-orange-600' : 'text-blue-600'}`}>
                                  {pozitie.tipPozitie}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">{pozitie.codArticol}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center font-bold text-slate-600">{pozitie.cantitate} {pozitie.unitateMasura}</td>
                            <td className="px-6 py-5 text-right font-medium text-slate-500">{formatSuma(pozitie.pretVanzare)}</td>
                            <td className="px-6 py-5 text-right">
                              <p className="font-black text-slate-800">{formatSuma(valori.total)}</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-0.5">TVA inclus</p>
                            </td>
                          </tr>
                        );
                      }) : null}
                    </tbody>
                  </table>
                  {pozitiiComandaSelectata.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                      <Settings2 className="h-10 w-10 opacity-20 mb-4" />
                      <p className="text-sm font-bold">Devizul este gol</p>
                      <button
                        onClick={() => setEditareArticole(true)}
                        className="mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
                      >
                        Adaugă piese/manoperă
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Scurt și la obiect */}
          <div className="bg-slate-900 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Deviz (TVA inclus)</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{formatSuma(editareArticole ? calculeazaRezumatPozitii(pozitiiLocale).total : rezumatSelectat.total)}</span>
                <span className="text-sm font-bold text-slate-400">RON</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
