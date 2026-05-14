import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { calculeazaRezumatPozitii, calculeazaValoriPozitie } from "../calculations";
import { creeazaPozitieDraft } from "../receptie/formState";
import type { CatalogKit, CatalogManopera, CatalogPiesa, PozitieComandaDraft, TipPozitie } from "../types";

interface TabelPozitiiProps {
  catalogKituri: CatalogKit[];
  catalogManopere: CatalogManopera[];
  catalogPiese: CatalogPiesa[];
  pozitii: PozitieComandaDraft[];
  onChange: (pozitii: PozitieComandaDraft[]) => void;
  areEroare?: boolean;
}

type CatalogOption = {
  id: number; tip: TipPozitie; cod: string; denumire: string;
  unitateMasura: PozitieComandaDraft["unitateMasura"];
  pretVanzare: number; cotaTVA: number; disponibilitateStoc: boolean;
  piese?: any[];
};

const formatSuma = (v: number) => new Intl.NumberFormat("ro-RO", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function TabelPozitii({ catalogKituri, catalogManopere, catalogPiese, pozitii, onChange, areEroare }: TabelPozitiiProps) {
  const rezumat = calculeazaRezumatPozitii(pozitii);
  const [cautare, setCautare] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn); return () => document.removeEventListener("mousedown", fn);
  }, []);

  const catalog = useMemo(() => {
    // FIX: Mapăm pretBaza și codPiesa
    const piese = catalogPiese.map(p => ({ 
      id: p.idPiesa, tip: "Piesa" as TipPozitie, cod: p.codPiesa, denumire: p.denumire, 
      unitateMasura: p.unitateMasura || "buc", pretVanzare: p.pretBaza, cotaTVA: p.cotaTVA || 19, disponibilitateStoc: p.disponibilitateStoc 
    }));
    const kituri = catalogKituri.map(k => ({ 
      id: k.idKit, tip: "Kit" as TipPozitie, cod: k.cod, denumire: k.denumire, 
      unitateMasura: k.unitateMasura, pretVanzare: k.pretVanzare, cotaTVA: k.cotaTVA, disponibilitateStoc: k.disponibilitateStoc,
      piese: k.piese 
    }));
    // FIX: Mapăm pretOra și codManopera
    const manopere = catalogManopere.map(m => ({ 
      id: m.idManopera, tip: "Manopera" as TipPozitie, cod: m.codManopera, denumire: m.denumire, 
      unitateMasura: "ore" as any, pretVanzare: m.pretOra, cotaTVA: m.cotaTVA || 19, disponibilitateStoc: true 
    }));
    return [...piese, ...kituri, ...manopere];
  }, [catalogPiese, catalogKituri, catalogManopere]);

  const filtrat = useMemo(() => {
    if (!cautare.trim()) return [];
    const t = cautare.toLowerCase().trim();
    return catalog.filter(i => i.denumire.toLowerCase().includes(t) || i.cod.toLowerCase().includes(t)).slice(0, 12);
  }, [cautare, catalog]);

  const updatePozitie = (draftId: string, camp: keyof PozitieComandaDraft, valoare: any) => {
    onChange(pozitii.map(p => p._draftId === draftId ? { ...p, [camp]: valoare } : p));
  };

  const handleAdd = (item: CatalogOption) => {
    if (item.tip === 'Kit' && item.piese) {
      const noiPozitii = item.piese.map((p: any) => ({
        ...creeazaPozitieDraft(),
        tipPozitie: "Piesa" as TipPozitie,
        catalogId: p.idPiesa,
        codArticol: p.piesa.codPiesa,
        descriere: p.piesa.denumire,
        unitateMasura: "buc" as any,
        cantitate: p.cantitate,
        pretVanzare: p.piesa.pretBaza, // Discount is not applied yet, could apply kit discount here if needed.
        cotaTVA: 19,
        disponibilitateStoc: true,
        observatiiPozitie: `Componentă ${item.denumire}`
      }));
      onChange([...pozitii, ...noiPozitii]);
    } else {
      onChange([...pozitii, { 
        ...creeazaPozitieDraft(), tipPozitie: item.tip, catalogId: item.id, codArticol: item.cod, 
        descriere: item.denumire, unitateMasura: item.unitateMasura, pretVanzare: item.pretVanzare, 
        cotaTVA: item.cotaTVA, disponibilitateStoc: item.disponibilitateStoc 
      }]);
    }
    setCautare(""); setOpen(false);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm" ref={ref}>
      <div className="bg-slate-50 px-6 py-4 relative rounded-t-2xl">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${(areEroare && pozitii.length === 0) ? "text-rose-500" : "text-slate-400"}`} />
          <input 
            type="text" 
            className={`w-full rounded-xl border py-3 pl-10 pr-4 shadow-sm focus:ring-2 focus:outline-none ${(areEroare && pozitii.length === 0) ? "border-rose-300 bg-rose-50 ring-2 ring-rose-500/50 focus:border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500 focus:border-indigo-300"}`} 
            placeholder="Caută articol..." 
            value={cautare} 
            onChange={(e) => { setCautare(e.target.value); setOpen(true); }} 
            onFocus={() => setOpen(true)} 
          />
        </div>
        {open && cautare && (
          <div className="absolute z-50 left-6 right-6 mt-1 bg-white shadow-xl rounded-xl border divide-y overflow-y-auto max-h-[400px]">
            {filtrat.map(i => (
              <div key={`${i.tip}-${i.id}`} onClick={() => handleAdd(i)} className="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center group">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight">{i.tip} · {i.cod}</p>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-900 transition-colors">{i.denumire}</p>
                  {i.tip !== 'Manopera' && (
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md w-fit border ${i.disponibilitateStoc ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
                      {i.disponibilitateStoc ? "În stoc" : "Lipsă stoc"}
                    </span>
                  )}
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-sm font-black text-slate-900">{formatSuma(i.pretVanzare)} RON</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Preț Unitar</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b">
          <tr><th className="px-4 py-3 text-left">Articol</th><th className="px-4 py-3 text-center">Cant.</th><th className="px-4 py-3 text-right">Preț</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3"></th></tr>
        </thead>
        <tbody className="divide-y">
          {pozitii.map((p, idx) => {
            const v = calculeazaValoriPozitie(p);
            return (
              <tr 
                key={p._draftId} 
                className="hover:bg-slate-50/50 animate-in fade-in slide-in-from-left-4 duration-300"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <td className="px-4 py-3"><p className="font-bold">{p.descriere}</p><p className="text-[10px] text-slate-400">{p.codArticol} · {p.unitateMasura}</p></td>
                <td className="px-4 py-3 text-center">
                  <input 
                    type="number" 
                    min="1" 
                    className="w-20 text-center rounded-lg border border-slate-200 py-1.5 px-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                    value={p.cantitate} 
                    onChange={(e) => updatePozitie(p._draftId, 'cantitate', Number(e.target.value))} 
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <input 
                      type="number" 
                      min="0" 
                      step="0.01"
                      className="w-28 text-right rounded-lg border border-slate-200 py-1.5 px-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                      value={p.pretVanzare} 
                      onChange={(e) => updatePozitie(p._draftId, 'pretVanzare', Number(e.target.value))} 
                    />
                    <span className="text-xs text-slate-500 font-medium">RON</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-bold text-indigo-600">{formatSuma(v.total)}</td>
                <td className="px-4 py-3 text-center"><button onClick={() => onChange(pozitii.filter(it => it._draftId !== p._draftId))} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="bg-slate-50 p-6 flex justify-end gap-8 border-t rounded-b-2xl">
        <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase">Subtotal</p><p className="text-lg font-bold">{formatSuma(rezumat.subtotal)} RON</p></div>
        <div className="text-right border-l pl-8"><p className="text-xs font-bold text-indigo-500 uppercase">Total Deviz</p><p className="text-2xl font-black text-indigo-700">{formatSuma(rezumat.total)} RON</p></div>
      </div>
    </div>
  );
}
