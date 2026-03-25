// Tabelul de poziții gestionează liniile editabile din comanda de service.
// Aici utilizatorul adaugă piesele/manopera, iar componenta părinte primește
// lista actualizată la fiecare schimbare.
import type { PozitieComandaDraft, TipPozitie } from '../types';
import { creeazaPozitieDraft } from '../formState';

interface TabelPozitiiProps {
  pozitii: PozitieComandaDraft[];
  onChange: (pozitii: PozitieComandaDraft[]) => void;
}

const tipuriPozitie: TipPozitie[] = ['Manopera', 'Piesa', 'Kit'];

const formatSuma = (valoare: number) =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 2,
  }).format(valoare);

// Totalul unei linii este derivat imediat din cantitate, preț și TVA,
// pentru ca utilizatorul să vadă instant impactul fiecărei modificări.
const calculeazaTotalLinie = (pozitie: PozitieComandaDraft) =>
  Number(
    (pozitie.cantitate * pozitie.pretVanzare * (1 + pozitie.cotaTVA / 100)).toFixed(2),
  );

export default function TabelPozitii({ pozitii, onChange }: TabelPozitiiProps) {
  // Actualizăm doar linia modificată, păstrând restul listei neschimbată.
  const actualizeazaPozitie = (
    draftId: string,
    modificari: Partial<PozitieComandaDraft>,
  ) => {
    onChange(
      pozitii.map((pozitie) =>
        pozitie._draftId === draftId ? { ...pozitie, ...modificari } : pozitie,
      ),
    );
  };

  // Ștergerea elimină linia doar din starea locală a formularului;
  // pozițiile persistente se construiesc abia la salvarea comenzii.
  const stergePozitie = (draftId: string) => {
    onChange(pozitii.filter((pozitie) => pozitie._draftId !== draftId));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h4 className="text-lg font-bold text-slate-800">Poziții estimate</h4>
          <p className="mt-1 text-sm text-slate-500">
            Adaugă piesele, kiturile și manopera inițială pentru comandă.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onChange([...pozitii, creeazaPozitieDraft()])}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Adaugă poziție
        </button>
      </div>

      {pozitii.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-slate-500">
          Nu există poziții în estimare. Adaugă prima poziție pentru a continua.
        </div>
      ) : (
        // Tabelul este complet controlat din părinte: fiecare input face update
        // în lista de draft-uri trimisă prin props.
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-4">Tip</th>
                <th className="px-4 py-4">Descriere</th>
                <th className="px-4 py-4 text-right">Cantitate</th>
                <th className="px-4 py-4 text-right">Preț vânzare</th>
                <th className="px-4 py-4 text-right">TVA %</th>
                <th className="px-4 py-4 text-right">Total linie</th>
                <th className="px-4 py-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pozitii.map((pozitie) => (
                <tr key={pozitie._draftId} className="align-top">
                  <td className="px-4 py-4">
                    <select
                      value={pozitie.tipPozitie}
                      onChange={(event) =>
                        actualizeazaPozitie(pozitie._draftId, {
                          tipPozitie: event.target.value as TipPozitie,
                        })
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
                    <input
                      type="text"
                      value={pozitie.descriere}
                      onChange={(event) =>
                        actualizeazaPozitie(pozitie._draftId, {
                          descriere: event.target.value,
                        })
                      }
                      placeholder="Ex: Revizie completă, set discuri, vopsitorie"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={pozitie.cantitate}
                      onChange={(event) =>
                        actualizeazaPozitie(pozitie._draftId, {
                          cantitate:
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
                      step="0.01"
                      value={pozitie.pretVanzare}
                      onChange={(event) =>
                        actualizeazaPozitie(pozitie._draftId, {
                          pretVanzare:
                            event.target.value === '' ? 0 : Number(event.target.value),
                        })
                      }
                      className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                          cotaTVA:
                            event.target.value === '' ? 0 : Number(event.target.value),
                        })
                      }
                      className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-700">
                    {formatSuma(calculeazaTotalLinie(pozitie))}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
