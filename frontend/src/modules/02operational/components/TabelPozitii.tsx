// Tabelul de poziții gestionează liniile editabile din comanda de service.
// Utilizatorul alege articole dintr-un catalog simplificat, apoi poate ajusta
// cantitatea, discountul și observațiile pentru deviz.
// Pentru un coleg începător, componenta poate fi înțeleasă astfel:
// - primește lista curentă de poziții
// - modifică o poziție sau adaugă/șterge una
// - trimite lista actualizată înapoi prin `onChange`
import { calculeazaRezumatPozitii, calculeazaValoriPozitie } from '../calculations';
import { creeazaPozitieDraft } from '../formState';
import type {
  CatalogKit,
  CatalogManopera,
  CatalogPiesa,
  PozitieComandaDraft,
  TipPozitie,
} from '../types';

interface TabelPozitiiProps {
  catalogKituri: CatalogKit[];
  catalogManopere: CatalogManopera[];
  catalogPiese: CatalogPiesa[];
  pozitii: PozitieComandaDraft[];
  onChange: (pozitii: PozitieComandaDraft[]) => void;
}

type CatalogOption = {
  id: number;
  cod: string;
  denumire: string;
  unitateMasura: PozitieComandaDraft['unitateMasura'];
  pretVanzare: number;
  cotaTVA: number;
  disponibilitateStoc: boolean;
};

const tipuriPozitie: TipPozitie[] = ['Manopera', 'Piesa', 'Kit'];

const formatSuma = (valoare: number) =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 2,
  }).format(valoare);

export default function TabelPozitii({
  catalogKituri,
  catalogManopere,
  catalogPiese,
  pozitii,
  onChange,
}: TabelPozitiiProps) {
  // Rezumatul este calculat la fiecare randare pe baza pozițiilor primite.
  // Așa, totalurile rămân mereu sincronizate cu ce este în tabel.
  const rezumat = calculeazaRezumatPozitii(pozitii);

  // În funcție de tipul poziției, alegem catalogul corect.
  // Returnăm toate formele într-o structură comună (`CatalogOption`)
  // pentru a putea afișa aceeași interfață în tabel.
  const obtineCatalog = (tipPozitie: TipPozitie): CatalogOption[] => {
    if (tipPozitie === 'Piesa') {
      return catalogPiese.map((item) => ({
        id: item.idPiesa,
        cod: item.cod,
        denumire: item.denumire,
        unitateMasura: item.unitateMasura,
        pretVanzare: item.pretVanzare,
        cotaTVA: item.cotaTVA,
        disponibilitateStoc: item.disponibilitateStoc,
      }));
    }

    if (tipPozitie === 'Kit') {
      return catalogKituri.map((item) => ({
        id: item.idKit,
        cod: item.cod,
        denumire: item.denumire,
        unitateMasura: item.unitateMasura,
        pretVanzare: item.pretVanzare,
        cotaTVA: item.cotaTVA,
        disponibilitateStoc: item.disponibilitateStoc,
      }));
    }

    return catalogManopere.map((item) => ({
      id: item.idManopera,
      cod: item.cod,
      denumire: item.denumire,
      unitateMasura: item.unitateMasura,
      pretVanzare: item.tarif,
      cotaTVA: item.cotaTVA,
      disponibilitateStoc: true,
    }));
  };

  const actualizeazaPozitie = (
    draftId: string,
    modificari: Partial<PozitieComandaDraft>,
  ) => {
    // Căutăm doar rândul care trebuie schimbat și îl reconstruim cu noile valori.
    onChange(
      pozitii.map((pozitie) =>
        pozitie._draftId === draftId ? { ...pozitie, ...modificari } : pozitie,
      ),
    );
  };

  const schimbaTipPozitie = (draftId: string, tipPozitie: TipPozitie) => {
    // Când se schimbă tipul poziției, resetăm și articolul ales din catalog.
    // Facem asta pentru a evita combinații invalide, de tip "piesă veche rămasă pe manoperă".
    const unitateMasura = tipPozitie === 'Manopera' ? 'ore' : tipPozitie === 'Kit' ? 'kit' : 'buc';

    actualizeazaPozitie(draftId, {
      tipPozitie,
      catalogId: null,
      codArticol: '',
      descriere: '',
      unitateMasura,
      pretVanzare: 0,
      cotaTVA: 19,
      discountProcent: 0,
      disponibilitateStoc: tipPozitie === 'Manopera',
      observatiiPozitie: '',
    });
  };

  const selecteazaArticol = (
    draftId: string,
    tipPozitie: TipPozitie,
    catalogId: number | null,
  ) => {
    // Alegerea unui articol completează automat câmpurile derivate:
    // cod, denumire, unitate, preț, TVA și stoc.
    const articol = obtineCatalog(tipPozitie).find((item) => item.id === catalogId) ?? null;

    actualizeazaPozitie(draftId, {
      catalogId,
      codArticol: articol?.cod ?? '',
      descriere: articol?.denumire ?? '',
      unitateMasura: articol?.unitateMasura ?? (tipPozitie === 'Manopera' ? 'ore' : 'buc'),
      pretVanzare: articol?.pretVanzare ?? 0,
      cotaTVA: articol?.cotaTVA ?? 19,
      disponibilitateStoc: articol?.disponibilitateStoc ?? (tipPozitie === 'Manopera'),
    });
  };

  const stergePozitie = (draftId: string) => {
    onChange(pozitii.filter((pozitie) => pozitie._draftId !== draftId));
  };

  return (
    // `return (...)` spune ce interfață întoarce această componentă.
    // JSX-ul arată ca HTML, dar permite și expresii JavaScript între acolade.
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* `div` este un container generic folosit pentru gruparea vizuală. */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {/* `h4` este un titlu, iar `p` este un paragraf explicativ. */}
          <h4 className="text-lg font-bold text-slate-800">Poziții estimate</h4>
          <p className="mt-1 text-sm text-slate-500">
            Selectează articole din catalog și personalizează devizul inițial.
          </p>
        </div>

        <button
          type="button"
          // `[...pozitii, creeazaPozitieDraft()]` înseamnă:
          // "copie a listei actuale + încă un element nou".
          onClick={() => onChange([...pozitii, creeazaPozitieDraft()])}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Adaugă poziție
        </button>
      </div>

      {/* Acesta este un operator ternar:
          dacă nu există poziții, afișăm mesajul de gol;
          altfel, afișăm tabelul. */}
      {pozitii.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-slate-500">
          Nu există poziții în estimare. Adaugă prima poziție pentru a continua.
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Structura de bază a unui tabel HTML este:
              `table` -> `thead` / `tbody` -> `tr` -> `th` / `td`.
              `thead` este capul tabelului, iar `tbody` este corpul lui. */}
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                {/* `th` înseamnă "table header" și descrie numele coloanei. */}
                <th className="px-4 py-4">Tip</th>
                <th className="px-4 py-4">Articol</th>
                <th className="px-4 py-4">Cod / UM</th>
                <th className="px-4 py-4 text-right">Cant.</th>
                <th className="px-4 py-4 text-right">Preț</th>
                <th className="px-4 py-4 text-right">Disc. %</th>
                <th className="px-4 py-4 text-right">TVA %</th>
                <th className="px-4 py-4">Stoc</th>
                <th className="px-4 py-4 text-right">Total</th>
                <th className="px-4 py-4">Observații</th>
                <th className="px-4 py-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* `map(...)` trece prin toată lista și întoarce câte un rând pentru fiecare poziție. */}
              {pozitii.map((pozitie) => {
                const catalogDisponibil = obtineCatalog(pozitie.tipPozitie);
                const valoriLinie = calculeazaValoriPozitie(pozitie);

                return (
                  // `key` este identificatorul stabil al rândului pentru React.
                  <tr key={pozitie._draftId} className="align-top">
                    {/* `td` este o celulă normală din tabel. */}
                    <td className="px-4 py-4">
                      <select
                        value={pozitie.tipPozitie}
                        onChange={(event) =>
                          schimbaTipPozitie(
                            pozitie._draftId,
                            // `as TipPozitie` este o conversie de tip pentru TypeScript.
                            event.target.value as TipPozitie,
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {tipuriPozitie.map((tipPozitie) => (
                          <option key={tipPozitie} value={tipPozitie}>
                            {tipPozitie}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        // `?? ''` înseamnă:
                        // dacă `catalogId` este null/undefined, folosim stringul gol.
                        value={pozitie.catalogId ?? ''}
                        // Lista de articole se schimbă dinamic în funcție de tipul ales pe rând.
                        onChange={(event) =>
                          selecteazaArticol(
                            pozitie._draftId,
                            pozitie.tipPozitie,
                            // Valoarea citită din input vine ca text și o convertim la număr.
                            event.target.value === '' ? null : Number(event.target.value),
                          )
                        }
                        className="min-w-56 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Selectează articol</option>
                        {/* Aici construim toate opțiunile dropdown-ului pe baza listei din catalog. */}
                        {catalogDisponibil.map((articol) => (
                          <option key={articol.id} value={articol.id}>
                            {articol.denumire}
                          </option>
                        ))}
                      </select>
                      {/* `||` oferă o valoare de rezervă dacă descrierea este goală. */}
                      <p className="mt-2 max-w-xs text-xs text-slate-500">{pozitie.descriere || 'Selectează un articol din catalog.'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-700">{pozitie.codArticol || '-'}</p>
                      <p className="mt-1 text-xs text-slate-500 uppercase">{pozitie.unitateMasura}</p>
                    </td>
                    <td className="px-4 py-4">
                      {/* `input` este câmpul în care utilizatorul scrie o valoare.
                          `value={...}` îl face controlat de React. */}
                      <input
                        type="number"
                        min="0"
                        step={pozitie.tipPozitie === 'Manopera' ? '0.1' : '1'}
                        value={pozitie.cantitate}
                        onChange={(event) =>
                          actualizeazaPozitie(pozitie._draftId, {
                            cantitate: event.target.value === '' ? 0 : Number(event.target.value),
                          })
                        }
                        className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pozitie.pretVanzare}
                        onChange={(event) =>
                          actualizeazaPozitie(pozitie._draftId, {
                            pretVanzare:
                              event.target.value === '' ? 0 : Number(event.target.value),
                          })
                        }
                        className="w-28 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={pozitie.discountProcent}
                        onChange={(event) =>
                          actualizeazaPozitie(pozitie._draftId, {
                            discountProcent:
                              event.target.value === '' ? 0 : Number(event.target.value),
                          })
                        }
                        className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={pozitie.cotaTVA}
                        onChange={(event) =>
                          actualizeazaPozitie(pozitie._draftId, {
                            cotaTVA: event.target.value === '' ? 0 : Number(event.target.value),
                          })
                        }
                        className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      {/* `span` este un container mic, potrivit pentru badge-uri scurte ca acesta. */}
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          pozitie.disponibilitateStoc
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {pozitie.disponibilitateStoc ? 'În stoc' : 'La comandă'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-700">
                      {/* Între acolade afișăm rezultatul unei funcții JavaScript. */}
                      {formatSuma(valoriLinie.total)}
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={pozitie.observatiiPozitie}
                        onChange={(event) =>
                          actualizeazaPozitie(pozitie._draftId, {
                            observatiiPozitie: event.target.value,
                          })
                        }
                        placeholder="Ex: clientul aprobă piesă aftermarket"
                        className="min-w-52 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => stergePozitie(pozitie._draftId)}
                        className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Șterge
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
        {/* Acest rezumat îl ajută pe utilizator să vadă imediat impactul
            modificărilor din fiecare rând asupra totalului comenzii. */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subtotal</p>
            <p className="mt-2 text-lg font-bold text-slate-800">{formatSuma(rezumat.subtotal)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">TVA</p>
            <p className="mt-2 text-lg font-bold text-slate-800">{formatSuma(rezumat.tva)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total deviz</p>
            <p className="mt-2 text-lg font-bold text-slate-800">{formatSuma(rezumat.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
