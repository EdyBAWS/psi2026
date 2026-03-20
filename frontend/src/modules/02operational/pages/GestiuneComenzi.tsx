import StatusBadge from '../components/StatusBadge';
import type {
  ComandaService,
  DosarDauna,
  Mecanic,
  PozitieComanda,
  Vehicul,
} from '../types';

interface GestiuneComenziProps {
  comenzi: ComandaService[];
  dosare: DosarDauna[];
  mecanici: Mecanic[];
  pozitii: PozitieComanda[];
  vehicule: Vehicul[];
}

const formatSuma = (valoare: number) =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 2,
  }).format(valoare);

const formatData = (valoare: Date | null) =>
  valoare ? valoare.toLocaleDateString('ro-RO') : 'Nefinalizată';

export default function GestiuneComenzi({
  comenzi,
  dosare,
  mecanici,
  pozitii,
  vehicule,
}: GestiuneComenziProps) {
  return (
    <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-800">
            Gestiune comenzi service
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Vizualizare rapidă a comenzilor deschise și a estimărilor inițiale din
            modulul operațional.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Total comenzi înregistrate: <strong>{comenzi.length}</strong>
        </div>
      </div>

      {comenzi.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
          Nu există comenzi înregistrate în modulul operațional.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Comandă</th>
                <th className="px-5 py-4">Vehicul</th>
                <th className="px-5 py-4">Mecanic</th>
                <th className="px-5 py-4">Dosar</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Poziții</th>
                <th className="px-5 py-4 text-right">Total estimat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comenzi
                .slice()
                .sort(
                  (left, right) =>
                    right.dataDeschidere.getTime() - left.dataDeschidere.getTime(),
                )
                .map((comanda) => {
                  const vehicul =
                    vehicule.find((item) => item.idVehicul === comanda.idVehicul) ?? null;
                  const dosar =
                    dosare.find((item) => item.idDosar === comanda.idDosar) ?? null;
                  const mecanic =
                    mecanici.find((item) => item.idMecanic === comanda.idMecanic) ?? null;
                  const numarPozitii = pozitii.filter(
                    (pozitie) => pozitie.idComanda === comanda.idComanda,
                  ).length;

                  return (
                    <tr key={comanda.idComanda} className="align-top hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{comanda.nrComanda}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Deschisă în {formatData(comanda.dataDeschidere)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Finalizare: {formatData(comanda.dataFinalizare)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {vehicul ? `${vehicul.marca} ${vehicul.model}` : 'Vehicul indisponibil'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {vehicul?.nrInmatriculare ?? 'Fără număr'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-700">
                          {mecanic?.nume ?? 'Nealocat'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {mecanic?.specialitate ?? 'Fără specialitate'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {dosar ? (
                          <>
                            <p className="font-semibold text-slate-700">{dosar.nrDosar}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatSuma(dosar.sumaAprobata)}
                            </p>
                          </>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                            Fără dosar
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={comanda.status} />
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-700">
                        {numarPozitii}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-800">
                        {formatSuma(comanda.totalEstimat)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
