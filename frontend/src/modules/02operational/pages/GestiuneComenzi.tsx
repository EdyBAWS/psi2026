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
    Scazuta: 'bg-slate-100 text-slate-700 border-slate-200',
    Normala: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Ridicata: 'bg-amber-50 text-amber-700 border-amber-200',
    Urgenta: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span className={`inline-flex rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${stiluri[prioritate]}`}>
      {prioritate}
    </span>
  );
};

type SortField = 'nrComanda' | 'data' | 'vehicul' | 'status' | 'valoare';
type SortDir = 'asc' | 'desc';

const SortIcon = ({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) => {
  const active = sortField === field;
  return (
    <svg 
      className={`w-3.5 h-3.5 ml-1.5 inline-block transition-transform duration-300 ${active ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-400'}`} 
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      {active && sortDir === 'asc' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /> : 
       active && sortDir === 'desc' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /> :
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />}
    </svg>
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

  const [sortField, setSortField] = useState<SortField>('data');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

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

      const potrivireStatus = filtruStatus === 'Toate' || comanda.status === filtruStatus;
      const potrivireMecanic = filtruMecanic === 'toate' || comanda.idMecanic === filtruMecanic;
      const potrivirePlata = filtruPlata === 'Toate' || comanda.tipPlata === filtruPlata;
      const potrivireIntarziere = !doarIntarziate || comandaEsteIntarziata(comanda.status, comanda.termenPromis);

      return potrivireCautare && potrivireStatus && potrivireMecanic && potrivirePlata && potrivireIntarziere;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'data') {
        comparison = a.dataDeschidere.getTime() - b.dataDeschidere.getTime();
      } else if (sortField === 'nrComanda') {
        comparison = a.nrComanda.localeCompare(b.nrComanda);
      } else if (sortField === 'vehicul') {
        const vehiculA = vehicule.find(v => v.idVehicul === a.idVehicul)?.nrInmatriculare || '';
        const vehiculB = vehicule.find(v => v.idVehicul === b.idVehicul)?.nrInmatriculare || '';
        comparison = vehiculA.localeCompare(vehiculB);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'valoare') {
        comparison = a.totalEstimat - b.totalEstimat;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

  const comandaSelectata = idComandaSelectata !== null 
    ? comenziFiltrate.find((comanda) => comanda.idComanda === idComandaSelectata) ?? null
    : null;

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
    <section className="space-y-8 pb-10 relative">
      
      {/* Stiluri CSS locale foarte eficiente pentru animația de intrare */}
      <style>{`
        @keyframes slideFadeIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fisa-intrare {
          animation: slideFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* 1. FIȘA DETALIATĂ A COMENZII SELECTATE */}
      {comandaSelectata && vehiculSelectat && clientSelectat && (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200 flex flex-col overflow-hidden relative z-10 mb-8 animate-fisa-intrare">
          
          <div className="bg-slate-900 p-6 text-white relative">
            <button 
              onClick={() => setIdComandaSelectata(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 hover:rotate-90 hover:scale-110"
              title="Închide fișa"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pr-10">
              <div>
                <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Fișă Comandă Service</span>
                <h2 className="text-3xl font-black mt-1 tracking-tight">{comandaSelectata.nrComanda}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-slate-400 text-sm">
                    Deschisă la {formatData(comandaSelectata.dataDeschidere)}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 text-sm">
                    Termen: <strong className={comandaEsteIntarziata(comandaSelectata.status, comandaSelectata.termenPromis) ? 'text-rose-400' : 'text-slate-300'}>{formatData(comandaSelectata.termenPromis)}</strong>
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={comandaSelectata.status} />
                {badgePrioritate(comandaSelectata.prioritate)}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50/50 flex flex-col xl:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-1 bg-indigo-500 rounded-full" />
                    <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Vehicul</h4>
                  </div>
                  <p className="font-black text-xl text-indigo-700">{vehiculSelectat.nrInmatriculare}</p>
                  <p className="text-sm font-medium text-slate-600 mt-1">{vehiculSelectat.marca} {vehiculSelectat.model} <span className="text-slate-400 ml-1">({vehiculSelectat.an})</span></p>
                  <p className="text-xs text-slate-400 mt-1 break-all">VIN: {vehiculSelectat.serieSasiu}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500 font-medium">
                    <span>Km: {comandaSelectata.kilometrajPreluare}</span>
                    <span>Rezervor: {comandaSelectata.nivelCombustibil}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                    <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Plătitor: {comandaSelectata.tipPlata}</h4>
                  </div>
                  <p className="font-bold text-lg text-slate-800">{clientSelectat.nume}</p>
                  <p className="text-sm text-slate-600 mt-1">{clientSelectat.telefon}</p>
                  {clientSelectat.denumireCompanie && (
                    <p className="text-xs font-semibold text-slate-500 mt-2 bg-slate-100 inline-block px-2 py-1 rounded">
                      {clientSelectat.denumireCompanie}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dosarSelectat && asiguratorSelectat ? (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 transition-all hover:bg-blue-50">
                    <h4 className="font-bold text-blue-900 text-sm mb-1">Dosar Daună {dosarSelectat.tipPolita}</h4>
                    <p className="text-sm text-blue-800 font-medium">
                      {dosarSelectat.nrDosar} <span className="text-blue-400 mx-1">•</span> {asiguratorSelectat.denumire}
                    </p>
                    <span className="inline-flex rounded-md bg-white border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase mt-3">
                      {dosarSelectat.statusAprobare}
                    </span>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lucrare Standard</span>
                      <p className="text-sm text-slate-600 font-medium mt-0.5">Fără dosar de daună atașat</p>
                    </div>
                  </div>
                )}

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mecanic Alocat</span>
                  <p className="text-sm text-slate-800 font-bold mt-1">{mecanicSelectat?.nume ?? 'Nealocat încă'}</p>
                  <div className="mt-3 pt-3 border-t border-slate-50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Observații recepție</span>
                    <p className="text-xs text-slate-600 mt-1 italic">{comandaSelectata.observatiiPreluare || 'Nicio observație'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Simptome / Cerințe reclamate</span>
                <p className="text-sm text-slate-700 font-medium mt-1.5 leading-relaxed">{comandaSelectata.simptomeReclamate}</p>
              </div>
            </div>

            <div className="xl:w-112.5 flex flex-col bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h4 className="font-bold text-slate-800 text-sm">Deviz Lucrare</h4>
                <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{pozitiiComandaSelectata.length} poziții</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                {pozitiiComandaSelectata.length > 0 ? (
                  <ul className="space-y-1.5">
                    {pozitiiComandaSelectata.map((pozitie) => {
                      const valori = calculeazaRezumatPozitii([pozitie]);
                      return (
                        <li key={pozitie.idPozitieCmd} className="p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-700 text-sm">{pozitie.descriere}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-400 font-mono">{pozitie.codArticol}</span>
                                <span className={`inline-flex items-center justify-center w-2 h-2 rounded-full ${pozitie.disponibilitateStoc ? 'bg-emerald-400' : 'bg-amber-400'}`} title={pozitie.disponibilitateStoc ? 'În stoc' : 'Necesar comandă'} />
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-800 text-sm">{formatSuma(valori.total)}</p>
                              <p className="text-xs text-slate-500 mt-1">{pozitie.cantitate} {pozitie.unitateMasura}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">Nicio poziție adăugată pe deviz.</div>
                )}
              </div>
              
              <div className="bg-slate-800 p-5 text-white shrink-0 mt-auto">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatSuma(rezumatSelectat.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-3 border-b border-slate-700 pb-3">
                  <span>TVA (19%)</span>
                  <span className="text-white font-medium">{formatSuma(rezumatSelectat.tva)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-black tracking-tight text-emerald-400">
                    {formatSuma(rezumatSelectat.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HEADER ȘI FILTRE */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-800">
              Registru comenzi service
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Urmărește și gestionează stadiul lucrărilor și detaliile fiecărui deviz.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col px-4 border-r border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total comenzi</span>
              <span className="text-xl font-black text-slate-700">{comenzi.length}</span>
            </div>
            <div className="flex flex-col px-4 border-r border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active</span>
              <span className="text-xl font-black text-indigo-600">{totalComenziActive}</span>
            </div>
            <div className="flex flex-col pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Întârziate</span>
              <span className="text-xl font-black text-rose-600">{totalIntarziate}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_repeat(4,0.7fr)] bg-slate-50 p-3 rounded-xl border border-slate-100">
          <input
            type="text"
            value={cautare}
            onChange={(event) => setCautare(event.target.value)}
            placeholder="Caută comandă, auto, client..."
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-shadow"
          />

          <select
            value={filtruStatus}
            onChange={(event) => setFiltruStatus(event.target.value as StatusComanda | 'Toate')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none transition-shadow"
          >
            {statusuriFiltrare.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filtruMecanic}
            onChange={(event) => setFiltruMecanic(event.target.value === 'toate' ? 'toate' : Number(event.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none transition-shadow"
          >
            <option value="toate">Toți mecanicii</option>
            {mecanici.map((mecanic) => (
              <option key={mecanic.idMecanic} value={mecanic.idMecanic}>{mecanic.nume}</option>
            ))}
          </select>

          <select
            value={filtruPlata}
            onChange={(event) => setFiltruPlata(event.target.value as ComandaService['tipPlata'] | 'Toate')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none transition-shadow"
          >
            <option value="Toate">Toate plățile</option>
            <option value="Client Direct">Client Direct</option>
            <option value="Flota">Flotă</option>
            <option value="Asigurare">Asigurare</option>
          </select>

          <label className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={doarIntarziate}
              onChange={(event) => setDoarIntarziate(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            Întârziate
          </label>
        </div>
      </div>

      {/* 3. TABELUL LISTĂ COMENZI */}
      {comenziFiltrate.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500 font-medium">
          Nu există comenzi care să corespundă filtrelor aplicate.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                    onClick={() => handleSort('nrComanda')}
                  >
                    Comandă <SortIcon field="nrComanda" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                    onClick={() => handleSort('data')}
                  >
                    Dată <SortIcon field="data" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                    onClick={() => handleSort('vehicul')}
                  >
                    Client / Vehicul <SortIcon field="vehicul" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                    onClick={() => handleSort('status')}
                  >
                    Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group text-right select-none"
                    onClick={() => handleSort('valoare')}
                  >
                    Valoare Deviz <SortIcon field="valoare" sortField={sortField} sortDir={sortDir} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comenziFiltrate.map((comanda) => {
                  const vehicul = vehicule.find((item) => item.idVehicul === comanda.idVehicul) ?? null;
                  const client = clienti.find((item) => item.idClient === vehicul?.idClient) ?? null;
                  const intarziata = comandaEsteIntarziata(comanda.status, comanda.termenPromis);
                  const esteSelectata = comandaSelectata?.idComanda === comanda.idComanda;

                  return (
                    <tr
                      key={comanda.idComanda}
                      className={`cursor-pointer align-middle transition-all duration-200 ease-out relative group/row ${
                        esteSelectata 
                          ? 'bg-indigo-50/60 shadow-[inset_4px_0_0_0_rgba(99,102,241,1)]' 
                          : 'hover:bg-slate-50/80 hover:-translate-y-px hover:shadow-sm'
                      }`}
                      onClick={() => {
                        // Deselectare și scrol automat înapoi sus pentru UX fluid
                        setIdComandaSelectata(esteSelectata ? null : comanda.idComanda);
                        if (!esteSelectata) {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      <td className="px-6 py-4">
                        <p className={`font-bold transition-colors ${esteSelectata ? 'text-indigo-800' : 'text-slate-800'}`}>
                          {comanda.nrComanda}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-600">{formatData(comanda.dataDeschidere)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-indigo-700 text-[13px]">{vehicul ? vehicul.nrInmatriculare : '-'}</p>
                        <p className="text-xs text-slate-600 mt-1 font-medium">{client?.nume ?? '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <StatusBadge status={comanda.status} />
                          {intarziata && <span className="text-[10px] font-bold uppercase text-rose-600">Termen Depășit</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-slate-800 text-base">{formatSuma(comanda.totalEstimat)}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-1">{comanda.tipPlata}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}