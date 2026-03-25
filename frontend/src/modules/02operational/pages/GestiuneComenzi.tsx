// Pagina de gestiune afișează comenzile deja create în modulul operațional.
// Pentru a reflecta mai bine utilizarea reală, include filtre, indicii de
// prioritate și o zonă de detalii pentru comanda selectată.
import { useState } from 'react';
import { calculeazaRezumatPozitii, comandaEsteActiva, comandaEsteIntarziata } from '../calculations';
import StatusBadge from '../components/StatusBadge';
import type {
  Asigurator,
  Client,
  ComandaService,
  DosarDauna,
  Mecanic,
  PozitieComanda,
  StatusComanda,
  Vehicul,
} from '../types';

interface GestiuneComenziProps {
  asiguratori: Asigurator[];
  clienti: Client[];
  comenzi: ComandaService[];
  dosare: DosarDauna[];
  mecanici: Mecanic[];
  pozitii: PozitieComanda[];
  vehicule: Vehicul[];
}

const statusuriFiltrare: Array<StatusComanda | 'Toate'> = [
  'Toate',
  'In asteptare diagnoza',
  'Asteapta aprobare client',
  'Asteapta piese',
  'In Lucru',
  'Gata de livrare',
  'Livrat',
  'Facturat',
  'Anulat',
];

const formatSuma = (valoare: number) =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 2,
  }).format(valoare);

const formatData = (valoare: Date | null) =>
  valoare ? valoare.toLocaleDateString('ro-RO') : 'Nefinalizată';

const badgePrioritate = (prioritate: ComandaService['prioritate']) => {
  const stiluri = {
    Scazuta: 'bg-slate-100 text-slate-700',
    Normala: 'bg-indigo-50 text-indigo-700',
    Ridicata: 'bg-amber-50 text-amber-700',
    Urgenta: 'bg-rose-50 text-rose-700',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stiluri[prioritate]}`}>
      {prioritate}
    </span>
  );
};

export default function GestiuneComenzi({
  asiguratori,
  clienti,
  comenzi,
  dosare,
  mecanici,
  pozitii,
  vehicule,
}: GestiuneComenziProps) {
  const [cautare, setCautare] = useState('');
  const [filtruStatus, setFiltruStatus] = useState<StatusComanda | 'Toate'>('Toate');
  const [filtruMecanic, setFiltruMecanic] = useState<number | 'toate'>('toate');
  const [filtruPlata, setFiltruPlata] = useState<ComandaService['tipPlata'] | 'Toate'>('Toate');
  const [doarIntarziate, setDoarIntarziate] = useState(false);
  const [idComandaSelectata, setIdComandaSelectata] = useState<number | null>(null);

  const comenziFiltrate = comenzi
    .filter((comanda) => {
      const vehicul = vehicule.find((item) => item.idVehicul === comanda.idVehicul) ?? null;
      const client = clienti.find((item) => item.idClient === vehicul?.idClient) ?? null;
      const termen = cautare.trim().toLowerCase();
      const potrivireCautare =
        termen === '' ||
        [
          comanda.nrComanda,
          vehicul?.nrInmatriculare ?? '',
          vehicul?.marca ?? '',
          vehicul?.model ?? '',
          client?.nume ?? '',
          client?.denumireCompanie ?? '',
        ].some((camp) => camp.toLowerCase().includes(termen));

      const potrivireStatus =
        filtruStatus === 'Toate' || comanda.status === filtruStatus;
      const potrivireMecanic =
        filtruMecanic === 'toate' || comanda.idMecanic === filtruMecanic;
      const potrivirePlata =
        filtruPlata === 'Toate' || comanda.tipPlata === filtruPlata;
      const potrivireIntarziere =
        !doarIntarziate || comandaEsteIntarziata(comanda.status, comanda.termenPromis);

      return (
        potrivireCautare &&
        potrivireStatus &&
        potrivireMecanic &&
        potrivirePlata &&
        potrivireIntarziere
      );
    })
    .slice()
    .sort((left, right) => right.dataDeschidere.getTime() - left.dataDeschidere.getTime());

  const comandaSelectata =
    comenziFiltrate.find((comanda) => comanda.idComanda === idComandaSelectata) ??
    comenziFiltrate[0] ??
    null;

  const pozitiiComandaSelectata = comandaSelectata
    ? pozitii.filter((pozitie) => pozitie.idComanda === comandaSelectata.idComanda)
    : [];
  const rezumatSelectat = calculeazaRezumatPozitii(pozitiiComandaSelectata);
  const vehiculSelectat = comandaSelectata
    ? vehicule.find((item) => item.idVehicul === comandaSelectata.idVehicul) ?? null
    : null;
  const clientSelectat = vehiculSelectat
    ? clienti.find((item) => item.idClient === vehiculSelectat.idClient) ?? null
    : null;
  const mecanicSelectat = comandaSelectata
    ? mecanici.find((item) => item.idMecanic === comandaSelectata.idMecanic) ?? null
    : null;
  const dosarSelectat = comandaSelectata
    ? dosare.find((item) => item.idDosar === comandaSelectata.idDosar) ?? null
    : null;
  const asiguratorSelectat = dosarSelectat
    ? asiguratori.find((item) => item.idAsigurator === dosarSelectat.idAsigurator) ?? null
    : null;

  const totalComenziActive = comenzi.filter((comanda) => comandaEsteActiva(comanda.status)).length;
  const totalIntarziate = comenzi.filter((comanda) =>
    comandaEsteIntarziata(comanda.status, comanda.termenPromis),
  ).length;

  return (
    <section className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-800">
              Gestiune comenzi service
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Filtrează comenzile active, vezi termenele depășite și inspectează
              rapid detaliile de recepție și deviz.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total comenzi
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{comenzi.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Active
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{totalComenziActive}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Termen depășit
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{totalIntarziate}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_repeat(4,0.7fr)]">
          <input
            type="text"
            value={cautare}
            onChange={(event) => setCautare(event.target.value)}
            placeholder="Caută după comandă, număr, client, vehicul"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={filtruStatus}
            onChange={(event) =>
              setFiltruStatus(event.target.value as StatusComanda | 'Toate')
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statusuriFiltrare.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={filtruMecanic}
            onChange={(event) =>
              setFiltruMecanic(
                event.target.value === 'toate' ? 'toate' : Number(event.target.value),
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="toate">Toți mecanicii</option>
            {mecanici.map((mecanic) => (
              <option key={mecanic.idMecanic} value={mecanic.idMecanic}>
                {mecanic.nume}
              </option>
            ))}
          </select>

          <select
            value={filtruPlata}
            onChange={(event) =>
              setFiltruPlata(event.target.value as ComandaService['tipPlata'] | 'Toate')
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Toate">Toate plățile</option>
            <option value="Client Direct">Client Direct</option>
            <option value="Flota">Flotă</option>
            <option value="Asigurare">Asigurare</option>
          </select>

          <label className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={doarIntarziate}
              onChange={(event) => setDoarIntarziate(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Doar întârziate
          </label>
        </div>
      </div>

      {comenziFiltrate.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
          Nu există comenzi care să corespundă filtrelor aplicate.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Comandă</th>
                    <th className="px-5 py-4">Client / Vehicul</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Prioritate</th>
                    <th className="px-5 py-4">Termen</th>
                    <th className="px-5 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comenziFiltrate.map((comanda) => {
                    const vehicul =
                      vehicule.find((item) => item.idVehicul === comanda.idVehicul) ?? null;
                    const client =
                      clienti.find((item) => item.idClient === vehicul?.idClient) ?? null;
                    const intarziata = comandaEsteIntarziata(
                      comanda.status,
                      comanda.termenPromis,
                    );
                    const esteSelectata =
                      comandaSelectata?.idComanda === comanda.idComanda;

                    return (
                      <tr
                        key={comanda.idComanda}
                        className={`cursor-pointer align-top transition-colors ${
                          esteSelectata ? 'bg-indigo-50/70' : 'hover:bg-slate-50/70'
                        }`}
                        onClick={() => setIdComandaSelectata(comanda.idComanda)}
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">{comanda.nrComanda}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Deschisă în {formatData(comanda.dataDeschidere)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {comanda.tipPlata}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {client?.nume ?? 'Client indisponibil'}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {vehicul ? `${vehicul.nrInmatriculare} · ${vehicul.marca} ${vehicul.model}` : 'Vehicul indisponibil'}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={comanda.status} />
                        </td>
                        <td className="px-5 py-4">{badgePrioritate(comanda.prioritate)}</td>
                        <td className="px-5 py-4">
                          <p className={`font-semibold ${intarziata ? 'text-rose-700' : 'text-slate-700'}`}>
                            {formatData(comanda.termenPromis)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {intarziata ? 'Depășit' : 'În termen'}
                          </p>
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
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            {comandaSelectata && vehiculSelectat && clientSelectat ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Detalii comandă
                  </p>
                  <h4 className="mt-2 text-2xl font-bold text-slate-800">
                    {comandaSelectata.nrComanda}
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge status={comandaSelectata.status} />
                    {badgePrioritate(comandaSelectata.prioritate)}
                    {comandaEsteIntarziata(
                      comandaSelectata.status,
                      comandaSelectata.termenPromis,
                    ) ? (
                      <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                        Termen depășit
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Client</p>
                    <p className="mt-1 text-sm text-slate-600">{clientSelectat.nume}</p>
                    <p className="mt-1 text-xs text-slate-500">{clientSelectat.telefon}</p>
                    <p className="mt-1 text-xs text-slate-500">{clientSelectat.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Vehicul</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {vehiculSelectat.marca} {vehiculSelectat.model}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {vehiculSelectat.nrInmatriculare} · VIN {vehiculSelectat.serieSasiu}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Recepție</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Kilometraj: {comandaSelectata.kilometrajPreluare} km
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Combustibil: {comandaSelectata.nivelCombustibil}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Termen promis: {formatData(comandaSelectata.termenPromis)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Execuție</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Mecanic: {mecanicSelectat?.nume ?? 'Nealocat'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Plată: {comandaSelectata.tipPlata}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Finalizare: {formatData(comandaSelectata.dataFinalizare)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Simptome reclamate</p>
                  <p className="mt-2 text-sm text-slate-600">{comandaSelectata.simptomeReclamate}</p>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">Observații preluare</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {comandaSelectata.observatiiPreluare || 'Fără observații suplimentare.'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">Observații caroserie</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {comandaSelectata.observatiiCaroserie || 'Nu au fost notate observații.'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">Accesorii predate</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {comandaSelectata.accesoriiPredate.length > 0 ? (
                      comandaSelectata.accesoriiPredate.map((accesoriu) => (
                        <span
                          key={accesoriu}
                          className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          {accesoriu}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">Nu au fost notate accesorii.</span>
                    )}
                  </div>
                </div>

                {dosarSelectat ? (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-sm font-semibold text-indigo-800">Dosar de daună</p>
                    <p className="mt-2 text-sm text-indigo-700">
                      {dosarSelectat.nrDosar} · {asiguratorSelectat?.denumire ?? 'Asigurator'}
                    </p>
                    <p className="mt-1 text-xs text-indigo-700">
                      {dosarSelectat.tipPolita} · {dosarSelectat.statusAprobare} · aprobat{' '}
                      {formatSuma(dosarSelectat.sumaAprobata)}
                    </p>
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Poziții comandă</p>
                    <p className="text-xs text-slate-500">
                      {pozitiiComandaSelectata.length} poziții
                    </p>
                  </div>
                  <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Cod</th>
                          <th className="px-4 py-3">Descriere</th>
                          <th className="px-4 py-3 text-right">Cant.</th>
                          <th className="px-4 py-3 text-right">Disc.</th>
                          <th className="px-4 py-3">Stoc</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pozitiiComandaSelectata.map((pozitie) => {
                          const valori = calculeazaRezumatPozitii([pozitie]);
                          return (
                            <tr key={pozitie.idPozitieCmd}>
                              <td className="px-4 py-3 font-semibold text-slate-700">
                                {pozitie.codArticol}
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-medium text-slate-700">{pozitie.descriere}</p>
                                {pozitie.observatiiPozitie ? (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {pozitie.observatiiPozitie}
                                  </p>
                                ) : null}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-600">
                                {pozitie.cantitate} {pozitie.unitateMasura}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-600">
                                {pozitie.discountProcent}%
                              </td>
                              <td className="px-4 py-3">
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
                              <td className="px-4 py-3 text-right font-semibold text-slate-700">
                                {formatSuma(valori.total)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Subtotal
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {formatSuma(rezumatSelectat.subtotal)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      TVA
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {formatSuma(rezumatSelectat.tva)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {formatSuma(rezumatSelectat.total)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
