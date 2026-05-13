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
}

type CatalogOption = {
  id: number; tip: TipPozitie; cod: string; denumire: string;
  unitateMasura: PozitieComandaDraft["unitateMasura"];
  pretVanzare: number; cotaTVA: number; disponibilitateStoc: boolean;
  piese?: any[];
};

const formatSuma = (v: number) => new Intl.NumberFormat("ro-RO", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function TabelPozitii({ catalogKituri, catalogManopere, catalogPiese, pozitii, onChange }: TabelPozitiiProps) {
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
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden" ref={ref}>
      <div className="bg-slate-50 px-6 py-4 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 shadow-sm focus:ring-indigo-500" placeholder="Caută articol..." value={cautare} onChange={(e) => { setCautare(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} />
        </div>
        {open && cautare && (
          <div className="absolute z-50 left-6 right-6 mt-1 bg-white shadow-xl rounded-xl border divide-y overflow-hidden">
            {filtrat.map(i => (
              <div key={`${i.tip}-${i.id}`} onClick={() => handleAdd(i)} className="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between">
                <div><p className="text-[10px] font-bold text-indigo-500 uppercase">{i.tip} · {i.cod}</p><p className="text-sm font-semibold">{i.denumire}</p></div>
                <div className="text-right"><p className="text-sm font-bold">{formatSuma(i.pretVanzare)} RON</p></div>
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
          {pozitii.map(p => {
            const v = calculeazaValoriPozitie(p);
            return (
              <tr key={p._draftId} className="hover:bg-slate-50/50">
                <td className="px-4 py-3"><p className="font-bold">{p.descriere}</p><p className="text-[10px] text-slate-400">{p.codArticol} · {p.unitateMasura}</p></td>
                <td className="px-4 py-3 text-center font-bold">{p.cantitate}</td>
                <td className="px-4 py-3 text-right">{formatSuma(p.pretVanzare)}</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-600">{formatSuma(v.total)}</td>
                <td className="px-4 py-3 text-center"><button onClick={() => onChange(pozitii.filter(it => it._draftId !== p._draftId))} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="bg-slate-50 p-6 flex justify-end gap-8 border-t">
        <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase">Subtotal</p><p className="text-lg font-bold">{formatSuma(rezumat.subtotal)} RON</p></div>
        <div className="text-right border-l pl-8"><p className="text-xs font-bold text-indigo-500 uppercase">Total Deviz</p><p className="text-2xl font-black text-indigo-700">{formatSuma(rezumat.total)} RON</p></div>
      </div>
    </div>
  );
}