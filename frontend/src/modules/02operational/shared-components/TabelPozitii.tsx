import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import {
  calculeazaRezumatPozitii,
  calculeazaValoriPozitie,
} from "../calculations";
import { creeazaPozitieDraft } from "../receptie/formState";
import type {
  CatalogKit,
  CatalogManopera,
  CatalogPiesa,
  PozitieComandaDraft,
  TipPozitie,
} from "../types";

interface TabelPozitiiProps {
  catalogKituri: CatalogKit[];
  catalogManopere: CatalogManopera[];
  catalogPiese: CatalogPiesa[];
  pozitii: PozitieComandaDraft[];
  onChange: (pozitii: PozitieComandaDraft[]) => void;
}

// Unificăm tipurile de catalog pentru a le putea căuta într-o singură listă
type CatalogOption = {
  id: number;
  tip: TipPozitie;
  cod: string;
  denumire: string;
  unitateMasura: PozitieComandaDraft["unitateMasura"];
  pretVanzare: number;
  cotaTVA: number;
  disponibilitateStoc: boolean;
};

const formatSuma = (valoare: number) =>
  new Intl.NumberFormat("ro-RO", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valoare);

export default function TabelPozitii({
  catalogKituri,
  catalogManopere,
  catalogPiese,
  pozitii,
  onChange,
}: TabelPozitiiProps) {
  const rezumat = calculeazaRezumatPozitii(pozitii);

  // --- LOGICĂ CĂUTARE ARTICOL (COMBOBOX) ---
  const [cautareArticol, setCautareArticol] = useState("");
  const [dropdownDeschis, setDropdownDeschis] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Închidem dropdown-ul când se dă click în afara lui
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownDeschis(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const catalogComplet = useMemo<CatalogOption[]>(() => {
    const piese: CatalogOption[] = catalogPiese.map((p) => ({
      id: p.idPiesa,
      tip: "Piesa",
      cod: p.cod,
      denumire: p.denumire,
      unitateMasura: p.unitateMasura,
      pretVanzare: p.pretVanzare,
      cotaTVA: p.cotaTVA,
      disponibilitateStoc: p.disponibilitateStoc,
    }));
    const kituri: CatalogOption[] = catalogKituri.map((k) => ({
      id: k.idKit,
      tip: "Kit",
      cod: k.cod,
      denumire: k.denumire,
      unitateMasura: k.unitateMasura,
      pretVanzare: k.pretVanzare,
      cotaTVA: k.cotaTVA,
      disponibilitateStoc: k.disponibilitateStoc,
    }));
    const manopere: CatalogOption[] = catalogManopere.map((m) => ({
      id: m.idManopera,
      tip: "Manopera",
      cod: m.cod,
      denumire: m.denumire,
      unitateMasura: m.unitateMasura,
      pretVanzare: m.tarif,
      cotaTVA: m.cotaTVA,
      disponibilitateStoc: true,
    }));
    return [...piese, ...kituri, ...manopere];
  }, [catalogPiese, catalogKituri, catalogManopere]);

  const articoleFiltrate = useMemo(() => {
    if (!cautareArticol.trim()) return [];
    const termen = cautareArticol.toLowerCase().trim();
    return catalogComplet
      .filter(
        (item) =>
          item.denumire.toLowerCase().includes(termen) ||
          item.cod.toLowerCase().includes(termen)
      )
      .slice(0, 15); // Afișăm doar primele 15 rezultate pentru performanță
  }, [cautareArticol, catalogComplet]);

  const handleAdaugaArticol = (articol: CatalogOption) => {
    // Generăm baza validă cu _draftId folosind funcția din formState
    const bazaDraft = creeazaPozitieDraft();
    
    // Suprascriem cu datele articolului selectat
    const nouaPozitie: PozitieComandaDraft = {
      ...bazaDraft,
      tipPozitie: articol.tip,
      catalogId: articol.id,
      codArticol: articol.cod,
      descriere: articol.denumire,
      unitateMasura: articol.unitateMasura,
      pretVanzare: articol.pretVanzare,
      cotaTVA: articol.cotaTVA,
      disponibilitateStoc: articol.disponibilitateStoc,
    };
    
    onChange([...pozitii, nouaPozitie]);
    setCautareArticol("");
    setDropdownDeschis(false);
  };

  // --- LOGICĂ MODIFICARE RÂNDURI ---
  const modificaPozitie = (
    draftId: string,
    modificari: Partial<PozitieComandaDraft>,
  ) => {
    onChange(
      pozitii.map((p) => (p._draftId === draftId ? { ...p, ...modificari } : p)),
    );
  };

  const stergePozitie = (draftId: string) => {
    onChange(pozitii.filter((p) => p._draftId !== draftId));
  };

  // Tailwind CSS magic care ascunde săgețile implicite de număr din browser (spin buttons)
  const inputClass =
    "w-full rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      
      {/* --- HEADER ȘI CĂUTARE --- */}
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">
          Deviz: Piese și Manoperă
        </h3>
        
        <div className="relative max-w-xl" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Caută articol după cod sau denumire..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500"
              value={cautareArticol}
              onChange={(e) => {
                setCautareArticol(e.target.value);
                setDropdownDeschis(true);
              }}
              onFocus={() => setDropdownDeschis(true)}
            />
          </div>

          {dropdownDeschis && cautareArticol && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              {articoleFiltrate.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                  {articoleFiltrate.map((articol) => (
                    <li
                      key={`${articol.tip}-${articol.id}`}
                      onClick={() => handleAdaugaArticol(articol)}
                      className="cursor-pointer px-4 py-3 hover:bg-indigo-50 transition-colors flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {articol.tip}
                          </span>
                          <span className="text-xs font-mono text-slate-500">{articol.cod}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 mt-1">{articol.denumire}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{formatSuma(articol.pretVanzare)} RON</p>
                        <p className={`text-[10px] font-bold uppercase mt-1 ${articol.disponibilitateStoc ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {articol.disponibilitateStoc ? 'Pe Stoc' : 'Fără Stoc'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">Niciun articol găsit.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- TABELUL --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <tr>
              <th className="w-20 px-4 py-3 text-center">Tip</th>
              <th className="w-28 px-4 py-3">Cod / UM</th>
              <th className="px-4 py-3">Denumire Articol</th>
              <th className="w-16 px-4 py-3 text-center">Stoc</th>
              <th className="w-24 px-4 py-3 text-center">Cant.</th>
              <th className="w-28 px-4 py-3 text-right">Preț Unitar</th>
              <th className="w-20 px-4 py-3 text-right">Disc. %</th>
              <th className="w-28 px-4 py-3 text-right">Total</th>
              <th className="w-12 px-4 py-3 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pozitii.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-sm text-slate-400">
                  Nu ai adăugat nicio poziție pe deviz.<br/>Folosește bara de căutare de mai sus pentru a găsi articole.
                </td>
              </tr>
            ) : (
              pozitii.map((pozitie) => {
                const valori = calculeazaValoriPozitie(pozitie);
                return (
                  <tr key={pozitie._draftId} className="hover:bg-slate-50/50 transition-colors">
                    {/* TIP */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block rounded bg-indigo-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        {pozitie.tipPozitie}
                      </span>
                    </td>
                    
                    {/* COD / UM */}
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-slate-600">{pozitie.codArticol}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase">{pozitie.unitateMasura}</p>
                    </td>
                    
                    {/* DENUMIRE */}
                    <td className="px-4 py-3 whitespace-normal min-w-[200px]">
                      <p className="font-semibold text-slate-800 line-clamp-2">{pozitie.descriere}</p>
                    </td>

                    {/* STOC */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold ${pozitie.disponibilitateStoc ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {pozitie.disponibilitateStoc ? 'DA' : 'NU'}
                      </span>
                    </td>

                    {/* CANTITATE */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        step={pozitie.unitateMasura === "ore" ? "0.5" : "1"}
                        value={pozitie.cantitate || ""}
                        onChange={(e) =>
                          modificaPozitie(pozitie._draftId, {
                            cantitate: Number(e.target.value),
                          })
                        }
                        className={inputClass}
                      />
                    </td>

                    {/* PREȚ UNITAR */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pozitie.pretVanzare || ""}
                        onChange={(e) =>
                          modificaPozitie(pozitie._draftId, {
                            pretVanzare: Number(e.target.value),
                          })
                        }
                        className={inputClass}
                      />
                    </td>

                    {/* DISCOUNT */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={pozitie.discountProcent || ""}
                        onChange={(e) =>
                          modificaPozitie(pozitie._draftId, {
                            discountProcent: Number(e.target.value),
                          })
                        }
                        className={inputClass}
                      />
                    </td>

                    {/* TOTAL CALCULAT */}
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-bold text-slate-800">{formatSuma(valori.total)}</p>
                    </td>

                    {/* ACȚIUNI */}
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => stergePozitie(pozitie._draftId)}
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* --- FOOTER / REZUMAT --- */}
      <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
        <div className="flex flex-col sm:flex-row justify-end gap-6">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subtotal</p>
            <p className="mt-1 text-lg font-bold text-slate-800">{formatSuma(rezumat.subtotal)} RON</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">TVA</p>
            <p className="mt-1 text-lg font-bold text-slate-800">{formatSuma(rezumat.tva)} RON</p>
          </div>
          <div className="text-right border-l border-slate-200 pl-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Total Deviz</p>
            <p className="mt-1 text-xl font-black text-indigo-700">{formatSuma(rezumat.total)} RON</p>
          </div>
        </div>
      </div>
    </div>
  );
}