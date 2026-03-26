// Aceasta este pagina principală a fluxului operațional.
import { calculeazaRezumatPozitii, comandaEsteActiva } from '../calculations';
import FormComanda from '../components/FormComanda';
import SelectorDosar from '../components/SelectorDosar';
import SelectorVehicul from '../components/SelectorVehicul';
import { suntPozitiiValide, valideazaPreluare } from '../validations';
import {
  creeazaPozitieDraft,
  detaliiPreluareInitiale,
  stareDosarInitiala,
  type DetaliiPreluareForm,
  type StareDosarAsigurare,
} from '../formState';
import { useState } from 'react';
import type {
  Asigurator,
  CatalogKit,
  CatalogManopera,
  CatalogPiesa,
  Client,
  ComandaService,
  DosarDauna,
  Mecanic,
  PozitieComanda,
  PozitieComandaDraft,
  Vehicul,
} from '../types';

export interface SalvarePreluarePayload {
  comanda: ComandaService;
  dosarNou: DosarDauna | null;
  pozitiiNoi: PozitieComanda[];
}

interface PreluareAutoProps {
  asiguratori: Asigurator[];
  catalogKituri: CatalogKit[];
  catalogManopere: CatalogManopera[];
  catalogPiese: CatalogPiesa[];
  clienti: Client[];
  comenzi: ComandaService[];
  dosare: DosarDauna[];
  mecanici: Mecanic[];
  pozitii: PozitieComanda[];
  vehicule: Vehicul[];
  onSalveazaPreluare: (payload: SalvarePreluarePayload) => void;
}

const formatSuma = (valoare: number) =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 2,
  }).format(valoare);

const formatData = (valoare: Date) => valoare.toLocaleDateString('ro-RO');

const urmatorulId = <T,>(items: T[], selector: (item: T) => number) =>
  items.length === 0 ? 1 : Math.max(...items.map(selector)) + 1;

const genereazaNumarDocument = (prefix: string, id: number) =>
  `${prefix}-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;

const esteNumarCompletat = (valoare: number | ''): valoare is number => valoare !== '';

const accesoriiCaLista = (valoare: string) =>
  valoare
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const tipPlataImplicit = (client: Client | null) =>
  client?.tipClient === 'Flota' ? 'Flota' : 'Client Direct';

export default function PreluareAuto({
  asiguratori,
  catalogKituri,
  catalogManopere,
  catalogPiese,
  clienti,
  comenzi,
  dosare,
  mecanici,
  pozitii,
  vehicule,
  onSalveazaPreluare,
}: PreluareAutoProps) {
  const [idVehiculSelectat, setIdVehiculSelectat] = useState<number | null>(null);
  const [esteLucrareAsigurare, setEsteLucrareAsigurare] = useState(false);
  const [stareDosar, setStareDosar] = useState<StareDosarAsigurare>(stareDosarInitiala);
  const [detaliiPreluare, setDetaliiPreluare] = useState<DetaliiPreluareForm>(detaliiPreluareInitiale);
  const [idMecanicSelectat, setIdMecanicSelectat] = useState<number | null>(null);
  const [pozitiiDraft, setPozitiiDraft] = useState<PozitieComandaDraft[]>([creeazaPozitieDraft()]);

  const vehiculSelectat = vehicule.find((vehicul) => vehicul.idVehicul === idVehiculSelectat) ?? null;
  const clientSelectat = clienti.find((client) => client.idClient === vehiculSelectat?.idClient) ?? null;
  const rezumatPozitii = calculeazaRezumatPozitii(pozitiiDraft);
  
  const nrComandaPreview = genereazaNumarDocument('CMD', urmatorulId(comenzi, (comanda) => comanda.idComanda));
  const nrDosarPreview = genereazaNumarDocument('DAUNA', urmatorulId(dosare, (dosar) => dosar.idDosar));

  const comandaActivaExistenta = vehiculSelectat === null ? null : comenzi.find(
    (comanda) => comanda.idVehicul === vehiculSelectat.idVehicul && comandaEsteActiva(comanda.status)
  ) ?? null;

  const { dosarValid, mesajeAvertizare, mesajeBlocare, poateSalva } = valideazaPreluare({
    comandaActivaExistenta,
    detaliiPreluare,
    esteLucrareAsigurare,
    idMecanicSelectat,
    pozitiiDraft,
    stareDosar,
    totalEstimat: rezumatPozitii.total,
    vehiculSelectat,
  });

  const reseteazaFlux = () => {
    const tipPlata = tipPlataImplicit(clientSelectat);
    setIdVehiculSelectat(null);
    setEsteLucrareAsigurare(false);
    setStareDosar(stareDosarInitiala);
    setDetaliiPreluare({ ...detaliiPreluareInitiale, tipPlata });
    setIdMecanicSelectat(null);
    setPozitiiDraft([creeazaPozitieDraft()]);
  };

  const handleSelecteazaVehicul = (idVehicul: number | null) => {
    const vehicul = vehicule.find((item) => item.idVehicul === idVehicul) ?? null;
    const client = clienti.find((item) => item.idClient === vehicul?.idClient) ?? null;

    setIdVehiculSelectat(idVehicul);
    setEsteLucrareAsigurare(false);
    setStareDosar(stareDosarInitiala);
    setDetaliiPreluare((previous) => ({
      ...previous,
      tipPlata: tipPlataImplicit(client),
    }));
  };

  const handleSchimbaFluxAsigurare = (activ: boolean) => {
    setEsteLucrareAsigurare(activ);

    if (!activ || idVehiculSelectat === null) {
      setStareDosar(stareDosarInitiala);
      setDetaliiPreluare((previous) => ({
        ...previous,
        tipPlata: tipPlataImplicit(clientSelectat),
      }));
      return;
    }

    const dosareVehicul = dosare.filter((dosar) => dosar.idVehicul === idVehiculSelectat);
    setStareDosar({
      ...stareDosarInitiala,
      mod: dosareVehicul.length > 0 ? 'existent' : 'nou',
      idDosarSelectat: dosareVehicul[0]?.idDosar ?? null,
    });
    setDetaliiPreluare((previous) => ({ ...previous, tipPlata: 'Asigurare' }));
  };

  const handleDetaliiChange = (modificari: Partial<DetaliiPreluareForm>) => {
    setDetaliiPreluare((previous) => ({ ...previous, ...modificari }));
  };

  const handleSalveaza = () => {
    if (!vehiculSelectat || idMecanicSelectat === null || !poateSalva) return;

    const idComandaNoua = urmatorulId(comenzi, (comanda) => comanda.idComanda);
    const dataDeschidere = new Date();
    const statusInitial = pozitiiDraft.some((pozitie) => !pozitie.disponibilitateStoc)
        ? 'Asteapta piese' : 'In asteptare diagnoza';

    let dosarNou: DosarDauna | null = null;
    let idDosarFinal: number | null = null;

    if (esteLucrareAsigurare) {
      if (stareDosar.mod === 'existent') {
        idDosarFinal = stareDosar.idDosarSelectat;
      } else if (
        stareDosar.idAsigurator !== null &&
        esteNumarCompletat(stareDosar.sumaAprobata) &&
        esteNumarCompletat(stareDosar.franciza)
      ) {
        const idDosarNou = urmatorulId(dosare, (dosar) => dosar.idDosar);
        dosarNou = {
          idDosar: idDosarNou,
          idClient: vehiculSelectat.idClient,
          idVehicul: vehiculSelectat.idVehicul,
          idAsigurator: stareDosar.idAsigurator,
          nrDosar: genereazaNumarDocument('DAUNA', idDosarNou),
          numarReferintaAsigurator: stareDosar.numarReferintaAsigurator,
          tipPolita: stareDosar.tipPolita,
          dataDeschidere,
          dataConstatare: new Date(`${stareDosar.dataConstatare}T10:00:00`),
          sumaAprobata: stareDosar.sumaAprobata,
          franciza: stareDosar.franciza,
          statusAprobare: stareDosar.statusAprobare,
          inspectorDauna: stareDosar.inspectorDauna,
          observatiiDauna: stareDosar.observatiiDauna,
        };
        idDosarFinal = dosarNou.idDosar;
      }
    }

    const comandaNoua: ComandaService = {
      idComanda: idComandaNoua,
      idVehicul: vehiculSelectat.idVehicul,
      idDosar: esteLucrareAsigurare ? idDosarFinal : null,
      idMecanic: idMecanicSelectat,
      nrComanda: genereazaNumarDocument('CMD', idComandaNoua),
      dataDeschidere,
      dataFinalizare: null,
      status: statusInitial,
      totalEstimat: rezumatPozitii.total,
      kilometrajPreluare: detaliiPreluare.kilometrajPreluare as number,
      nivelCombustibil: detaliiPreluare.nivelCombustibil,
      simptomeReclamate: detaliiPreluare.simptomeReclamate.trim(),
      observatiiPreluare: detaliiPreluare.observatiiPreluare.trim(),
      observatiiCaroserie: detaliiPreluare.observatiiCaroserie.trim(),
      accesoriiPredate: accesoriiCaLista(detaliiPreluare.accesoriiPredate),
      termenPromis: new Date(`${detaliiPreluare.termenPromis}T17:00:00`),
      prioritate: detaliiPreluare.prioritate,
      tipPlata: esteLucrareAsigurare ? 'Asigurare' : detaliiPreluare.tipPlata,
    };

    const urmatorulIdPozitie = urmatorulId(pozitii, (pozitie) => pozitie.idPozitieCmd);
    const pozitiiNoi: PozitieComanda[] = pozitiiDraft.map((pozitie, index) => {
      const idPozitieCmd = urmatorulIdPozitie + index;
      return {
        idPozitieCmd,
        idComanda: idComandaNoua,
        idPiesa: pozitie.tipPozitie === 'Piesa' ? pozitie.catalogId : null,
        idKit: pozitie.tipPozitie === 'Kit' ? pozitie.catalogId : null,
        idManopera: pozitie.tipPozitie === 'Manopera' ? pozitie.catalogId : null,
        tipPozitie: pozitie.tipPozitie,
        codArticol: pozitie.codArticol,
        descriere: pozitie.descriere,
        unitateMasura: pozitie.unitateMasura,
        cantitate: pozitie.cantitate,
        pretVanzare: pozitie.pretVanzare,
        discountProcent: pozitie.discountProcent,
        cotaTVA: pozitie.cotaTVA,
        disponibilitateStoc: pozitie.disponibilitateStoc,
        observatiiPozitie: pozitie.observatiiPozitie.trim(),
      };
    });

    onSalveazaPreluare({ comanda: comandaNoua, dosarNou, pozitiiNoi });
    reseteazaFlux();
  };

  // --- LOGICA DINAMICĂ PENTRU PAȘI ---
  const pasiFlux = esteLucrareAsigurare
    ? ['Selectare auto', 'Simptome', 'Dosar Daună', 'Deviz', 'Confirmare']
    : ['Selectare auto', 'Simptome', 'Deviz', 'Confirmare'];

  let pasCurent = 1;
  if (vehiculSelectat) {
    pasCurent = 2; // Suntem la Simptome
    if (detaliiPreluare.simptomeReclamate) {
      if (esteLucrareAsigurare) {
        pasCurent = 3; // Dosar
        if (dosarValid) {
          pasCurent = 4; // Deviz
          if (suntPozitiiValide(pozitiiDraft)) pasCurent = 5; // Confirmare
        }
      } else {
        pasCurent = 3; // Deviz (pentru că nu avem dosar)
        if (suntPozitiiValide(pozitiiDraft)) pasCurent = 4; // Confirmare
      }
    }
  }

  // Helpers pentru a ști ce anume trebuie marcat cu roșu
  const lipsescSimptomeSauMecanic = vehiculSelectat && (!detaliiPreluare.simptomeReclamate || idMecanicSelectat === null || !suntPozitiiValide(pozitiiDraft));
  const lipsesteDosar = vehiculSelectat && esteLucrareAsigurare && !dosarValid;

  return (
    <section className="space-y-6">
      
      {/* ANTET INTELIGENT STICKY CU ERORI INCLUSE */}
      <div 
        className={`bg-white/95 backdrop-blur-md border transition-all duration-300 z-40 ${
          vehiculSelectat 
            ? 'sticky top-0 shadow-md border-indigo-100 rounded-2xl px-5 py-4 mb-6' 
            : 'relative shadow-sm border-slate-100 rounded-2xl p-8'
        }`}
      >
        {!vehiculSelectat ? (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-800">Preluare auto</h3>
              <p className="mt-1 text-sm text-slate-500">
                Alege un vehicul pentru a începe fluxul de recepție și a genera devizul inițial.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Următoarea comandă: <strong>{nrComandaPreview}</strong>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                PRELUARE
              </span>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase text-indigo-600 tracking-wider hidden sm:block">
                  Pas {pasCurent}: <span className="text-slate-600">{pasiFlux[pasCurent - 1]}</span>
                </span>
                <div className="flex gap-1">
                  {pasiFlux.map((_, index) => (
                    <div 
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index + 1 === pasCurent 
                          ? 'w-6 bg-indigo-500 shadow-sm shadow-indigo-200' 
                          : index + 1 < pasCurent 
                            ? 'w-2 bg-emerald-400' 
                            : 'w-2 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 shadow-sm">
                {vehiculSelectat.nrInmatriculare}
              </span>
              
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium tracking-wide border shadow-sm ${
                esteLucrareAsigurare 
                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                Plătitor: <strong className="uppercase">{esteLucrareAsigurare ? 'Asigurator' : 'Client'}</strong>
              </span>

              {esteLucrareAsigurare && stareDosar.tipPolita && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border shadow-sm bg-blue-50 text-blue-700 border-blue-200">
                  Dosar: {stareDosar.tipPolita}
                </span>
              )}

              {rezumatPozitii.total > 0 && (
                <span className="font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm ml-auto">
                  Total: {formatSuma(rezumatPozitii.total)}
                </span>
              )}
            </div>

            {/* SECȚIUNEA NOUĂ DE ERORI DIRECT ÎN ANTET */}
            {mesajeBlocare.length > 0 && (
              <div className="mt-2 pt-3 border-t border-slate-100/60 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wide mr-1">
                  Câmpuri obligatorii lipsă:
                </span>
                {mesajeBlocare.map((mesaj) => (
                  <span key={mesaj} className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-xs font-medium shadow-sm">
                    {mesaj}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <SelectorVehicul
        clienti={clienti}
        comenzi={comenzi}
        idVehiculSelectat={idVehiculSelectat}
        onSelecteaza={handleSelecteazaVehicul}
        vehicule={vehicule}
      />

      {vehiculSelectat ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Context client și vehicul</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-800">{vehiculSelectat.marca} {vehiculSelectat.model}</h3>
              <dl className="mt-5 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
                <div><dt className="font-semibold text-slate-700">Client</dt><dd className="mt-1">{clientSelectat?.nume ?? `#${vehiculSelectat.idClient}`}</dd></div>
                <div><dt className="font-semibold text-slate-700">Telefon</dt><dd className="mt-1">{clientSelectat?.telefon ?? '-'}</dd></div>
                <div><dt className="font-semibold text-slate-700">Tip client</dt><dd className="mt-1">{clientSelectat?.tipClient ?? '-'}</dd></div>
                <div><dt className="font-semibold text-slate-700">Serie șasiu</dt><dd className="mt-1 break-all">{vehiculSelectat.serieSasiu}</dd></div>
                {clientSelectat?.denumireCompanie && (
                  <div className="md:col-span-2"><dt className="font-semibold text-slate-700">Companie</dt><dd className="mt-1">{clientSelectat.denumireCompanie}</dd></div>
                )}
              </dl>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tip intervenție</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-800">
                    {esteLucrareAsigurare ? 'Lucrare cu asigurare' : 'Lucrare client / flotă'}
                  </h3>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100">
                  <span className="text-sm font-semibold text-slate-700">Daună</span>
                  <input
                    type="checkbox"
                    checked={esteLucrareAsigurare}
                    onChange={(event) => handleSchimbaFluxAsigurare(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>
              </div>

              {comandaActivaExistenta && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800 mb-4 flex-1">
                  Există deja comanda activă <strong>{comandaActivaExistenta.nrComanda}</strong> pentru acest vehicul, cu status <strong>{comandaActivaExistenta.status}</strong> și termen promis <strong>{formatData(comandaActivaExistenta.termenPromis)}</strong>.
                </div>
              )}
            </div>
          </div>

          {mesajeAvertizare.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
              <h4 className="text-sm font-bold uppercase tracking-wide text-amber-900">Avertizări operaționale</h4>
              <ul className="mt-3 space-y-2 text-sm text-amber-800">
                {mesajeAvertizare.map((mesaj) => <li key={mesaj}>• {mesaj}</li>)}
              </ul>
            </div>
          )}

          {/* CASETĂ ROȘIE PENTRU DOSAR DACĂ E INCOMPLET */}
          {esteLucrareAsigurare && (
            <div className={`transition-all duration-300 rounded-2xl ${lipsesteDosar ? 'border-2 border-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.15)] bg-rose-50/20' : ''}`}>
              <SelectorDosar
                asiguratori={asiguratori}
                dosare={dosare}
                nrDosarPreview={nrDosarPreview}
                value={stareDosar}
                vehicul={vehiculSelectat}
                onChange={setStareDosar}
              />
            </div>
          )}

          {/* CASETĂ ROȘIE PENTRU FORMULAR/MECANIC DACĂ E INCOMPLET */}
          <div className={`transition-all duration-300 rounded-2xl ${lipsescSimptomeSauMecanic ? 'border-2 border-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.15)] bg-rose-50/20 p-0.5' : ''}`}>
            <FormComanda
              blocheazaTipPlataAsigurare={esteLucrareAsigurare}
              catalogKituri={catalogKituri}
              catalogManopere={catalogManopere}
              catalogPiese={catalogPiese}
              detaliiPreluare={detaliiPreluare}
              idMecanicSelectat={idMecanicSelectat}
              mecanici={mecanici}
              nrComandaPreview={nrComandaPreview}
              pozitii={pozitiiDraft}
              subtotalEstimat={rezumatPozitii.subtotal}
              totalEstimat={rezumatPozitii.total}
              tvaEstimat={rezumatPozitii.tva}
              vehicul={vehiculSelectat}
              onDetaliiChange={handleDetaliiChange}
              onMecanicChange={setIdMecanicSelectat}
              onPozitiiChange={setPozitiiDraft}
            />
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between mb-20">
            <div className="space-y-1 text-sm text-slate-500 max-w-2xl">
              <p>Comanda va porni cu status adaptat realității: dacă lipsește stocul, intră automat în <strong>Așteaptă piese</strong>, altfel în <strong> În așteptare diagnoză</strong>.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reseteazaFlux}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Resetează
              </button>
              <button
                type="button"
                onClick={handleSalveaza}
                disabled={!poateSalva}
                className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none transition-all"
              >
                Deschide comanda
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500 font-medium">
          Caută și selectează un vehicul pentru a continua cu recepția.
        </div>
      )}
    </section>
  );
}