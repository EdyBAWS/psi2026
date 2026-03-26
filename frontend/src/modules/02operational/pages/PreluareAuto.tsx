// Aceasta este pagina principală a fluxului operațional.
// Ea coordonează toți pașii: selectarea vehiculului, datele de recepție,
// fluxul de asigurare, devizul inițial și validarea înainte de salvare.
// Dacă ar fi să explicăm simplu:
// - aici se află "creierul" fluxului de preluare
// - componentele copil doar editează bucăți din stare
// - această pagină decide când datele sunt complete și cum se salvează
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

const pasiFlux = [
  'Selectare vehicul și client',
  'Recepție și simptome',
  'Dosar daună / plată',
  'Deviz inițial',
  'Confirmare și deschidere',
];

const formatSuma = (valoare: number) =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 2,
  }).format(valoare);

const formatData = (valoare: Date) => valoare.toLocaleDateString('ro-RO');

// Funcție utilitară pentru generarea următorului id local.
// În lipsa unui backend, simulăm aici auto-incrementarea.
const urmatorulId = <T,>(items: T[], selector: (item: T) => number) =>
  items.length === 0 ? 1 : Math.max(...items.map(selector)) + 1;

// Generăm numere ușor de recunoscut pentru comandă și dosar.
const genereazaNumarDocument = (prefix: string, id: number) =>
  `${prefix}-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;

const esteNumarCompletat = (valoare: number | ''): valoare is number => valoare !== '';

const accesoriiCaLista = (valoare: string) =>
  valoare
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// Tipul de plată implicit pleacă din profilul clientului.
// Pentru flote, alegem automat "Flota", iar pentru ceilalți "Client Direct".
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
  const [stareDosar, setStareDosar] =
    useState<StareDosarAsigurare>(stareDosarInitiala);
  const [detaliiPreluare, setDetaliiPreluare] =
    useState<DetaliiPreluareForm>(detaliiPreluareInitiale);
  const [idMecanicSelectat, setIdMecanicSelectat] = useState<number | null>(null);
  const [pozitiiDraft, setPozitiiDraft] = useState<PozitieComandaDraft[]>([
    creeazaPozitieDraft(),
  ]);

  // Aici derivăm contextul curent din starea de bază.
  // Nu duplicăm aceleași informații în mai multe locuri, ci le calculăm din listele existente.
  const vehiculSelectat =
    vehicule.find((vehicul) => vehicul.idVehicul === idVehiculSelectat) ?? null;
  const clientSelectat =
    clienti.find((client) => client.idClient === vehiculSelectat?.idClient) ?? null;
  const rezumatPozitii = calculeazaRezumatPozitii(pozitiiDraft);
  const nrComandaPreview = genereazaNumarDocument(
    'CMD',
    urmatorulId(comenzi, (comanda) => comanda.idComanda),
  );
  const nrDosarPreview = genereazaNumarDocument(
    'DAUNA',
    urmatorulId(dosare, (dosar) => dosar.idDosar),
  );

  // Blocăm deschiderea unei noi comenzi dacă există deja una activă pentru același vehicul.
  const comandaActivaExistenta =
    vehiculSelectat === null
      ? null
      : comenzi.find(
          (comanda) =>
            comanda.idVehicul === vehiculSelectat.idVehicul &&
            comandaEsteActiva(comanda.status),
        ) ?? null;

  // Mutăm regulile de business într-un fișier separat, iar pagina păstrează doar
  // rolul de orchestrare a fluxului și afișare a rezultatului.
  const {
    dosarValid,
    mesajeAvertizare,
    mesajeBlocare,
    poateSalva,
  } = valideazaPreluare({
    comandaActivaExistenta,
    detaliiPreluare,
    esteLucrareAsigurare,
    idMecanicSelectat,
    pozitiiDraft,
    stareDosar,
    totalEstimat: rezumatPozitii.total,
    vehiculSelectat,
  });

  // Resetarea readuce întreg fluxul la forma inițială.
  // Este utilă după salvare sau dacă utilizatorul vrea să reînceapă recepția.
  const reseteazaFlux = () => {
    const tipPlata = tipPlataImplicit(clientSelectat);
    setIdVehiculSelectat(null);
    setEsteLucrareAsigurare(false);
    setStareDosar(stareDosarInitiala);
    setDetaliiPreluare({
      ...detaliiPreluareInitiale,
      tipPlata,
    });
    setIdMecanicSelectat(null);
    setPozitiiDraft([creeazaPozitieDraft()]);
  };

  const handleSelecteazaVehicul = (idVehicul: number | null) => {
    // Schimbarea vehiculului afectează mai multe lucruri:
    // tipul de plată implicit, fluxul de daună și dosarul selectat.
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
    // Când activăm fluxul de asigurare, forțăm și tipul de plată la "Asigurare".
    // Când îl dezactivăm, revenim la tipul implicit al clientului.
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
    setDetaliiPreluare((previous) => ({
      ...previous,
      tipPlata: 'Asigurare',
    }));
  };

  const handleDetaliiChange = (modificari: Partial<DetaliiPreluareForm>) => {
    // Acest helper evită să scriem aceeași logică de îmbinare a stării în mai multe locuri.
    setDetaliiPreluare((previous) => ({ ...previous, ...modificari }));
  };

  const handleSalveaza = () => {
    // Verificarea de siguranță de la început ne asigură că nu construim obiecte incomplete.
    if (!vehiculSelectat || idMecanicSelectat === null || !poateSalva) {
      return;
    }

    const idComandaNoua = urmatorulId(comenzi, (comanda) => comanda.idComanda);
    const dataDeschidere = new Date();
    const statusInitial =
      pozitiiDraft.some((pozitie) => !pozitie.disponibilitateStoc)
        ? 'Asteapta piese'
        : 'In asteptare diagnoza';

    let dosarNou: DosarDauna | null = null;
    let idDosarFinal: number | null = null;

    // Dacă lucrarea este pe asigurare, alegem fie dosarul existent,
    // fie construim unul nou pe baza stării din formular.
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

    // În acest pas transformăm starea de formular într-un obiect de domeniu real.
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

    // Aici transformăm fiecare rând "draft" din tabel într-o poziție reală de comandă.
    // Observă că mapăm și catalogul ales către unul dintre câmpurile idPiesa / idKit / idManopera.
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

    onSalveazaPreluare({
      comanda: comandaNoua,
      dosarNou,
      pozitiiNoi,
    });

    // După salvare, curățăm formularul pentru o eventuală recepție nouă.
    reseteazaFlux();
  };

  // Acest indicator este strict pentru UI.
  // El estimează în ce pas se află utilizatorul pe baza datelor deja completate.
  const pasCurent = !vehiculSelectat
    ? 1
    : !detaliiPreluare.simptomeReclamate
      ? 2
      : esteLucrareAsigurare && !dosarValid
        ? 3
        : !suntPozitiiValide(pozitiiDraft)
          ? 4
          : 5;

  return (
    // JSX-ul de mai jos descrie tot ecranul de recepție.
    // Aici combinăm elemente de interfață cu componente React și expresii JavaScript.
    <section className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-800">
              Preluare auto
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Flux complet de recepție: vehicul, client, simptome, daună, deviz și
              reguli operaționale înainte de deschiderea comenzii.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Comanda nouă va primi numărul <strong>{nrComandaPreview}</strong>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-5">
          {pasiFlux.map((pas, index) => {
            const numarPas = index + 1;
            const stare =
              numarPas < pasCurent ? 'complet' : numarPas === pasCurent ? 'curent' : 'viitor';

            return (
              <div
                key={pas}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  stare === 'complet'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : stare === 'curent'
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-800'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wide">Pas {numarPas}</p>
                <p className="mt-1 font-semibold">{pas}</p>
              </div>
            );
          })}
        </div>
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
          {/* După selecția vehiculului, afișăm două zone:
              contextul vehiculului/clientului și modul de lucru normal/asigurare. */}
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Context client și vehicul
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-800">
                {vehiculSelectat.marca} {vehiculSelectat.model}
              </h3>
              <dl className="mt-5 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-700">Număr înmatriculare</dt>
                  <dd className="mt-1">{vehiculSelectat.nrInmatriculare}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Client</dt>
                  <dd className="mt-1">{clientSelectat?.nume ?? `#${vehiculSelectat.idClient}`}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Telefon</dt>
                  <dd className="mt-1">{clientSelectat?.telefon ?? '-'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Tip client</dt>
                  <dd className="mt-1">{clientSelectat?.tipClient ?? '-'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">An fabricație</dt>
                  <dd className="mt-1">{vehiculSelectat.an}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Serie șasiu</dt>
                  <dd className="mt-1 break-all">{vehiculSelectat.serieSasiu}</dd>
                </div>
                {clientSelectat?.denumireCompanie ? (
                  <div className="md:col-span-2">
                    <dt className="font-semibold text-slate-700">Companie</dt>
                    <dd className="mt-1">{clientSelectat.denumireCompanie}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Tip intervenție
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-800">
                    {esteLucrareAsigurare ? 'Lucrare cu asigurare' : 'Lucrare client / flotă'}
                  </h3>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-700">Daună</span>
                  <input
                    type="checkbox"
                    checked={esteLucrareAsigurare}
                    onChange={(event) => handleSchimbaFluxAsigurare(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm text-slate-600">
                    Subtotal curent: <strong>{formatSuma(rezumatPozitii.subtotal)}</strong>
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    TVA curent: <strong>{formatSuma(rezumatPozitii.tva)}</strong>
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Total estimat: <strong>{formatSuma(rezumatPozitii.total)}</strong>
                  </p>
                </div>

                {comandaActivaExistenta ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
                    Există deja comanda activă <strong>{comandaActivaExistenta.nrComanda}</strong>{' '}
                    pentru acest vehicul, cu status <strong>{comandaActivaExistenta.status}</strong>{' '}
                    și termen promis <strong>{formatData(comandaActivaExistenta.termenPromis)}</strong>.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {mesajeBlocare.length > 0 ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5">
              <h4 className="text-sm font-bold uppercase tracking-wide text-rose-800">
                De ce nu se poate salva încă
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-rose-700">
                {mesajeBlocare.map((mesaj) => (
                  <li key={mesaj}>• {mesaj}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {mesajeAvertizare.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
              <h4 className="text-sm font-bold uppercase tracking-wide text-amber-900">
                Avertizări operaționale
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-amber-800">
                {mesajeAvertizare.map((mesaj) => (
                  <li key={mesaj}>• {mesaj}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {esteLucrareAsigurare ? (
            // Selectorul de dosar apare doar când fluxul de daună este activ.
            <SelectorDosar
              asiguratori={asiguratori}
              dosare={dosare}
              nrDosarPreview={nrDosarPreview}
              value={stareDosar}
              vehicul={vehiculSelectat}
              onChange={setStareDosar}
            />
          ) : null}

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

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1 text-sm text-slate-500">
              <p>
                Comanda va porni cu status adaptat realității: dacă lipsește stocul,
                intră automat în <strong>Așteaptă piese</strong>, altfel în
                <strong> În așteptare diagnoză</strong>.
              </p>
              <p>
                Duplicatele de comandă activă pe același vehicul sunt blocate pentru a
                evita recepții paralele.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reseteazaFlux}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Resetează
              </button>
              <button
                type="button"
                // Butonul este activ doar când lista de blocaje este goală.
                onClick={handleSalveaza}
                disabled={!poateSalva}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                Deschide comanda
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
          Selectează un vehicul pentru a continua cu recepția și devizul.
        </div>
      )}
    </section>
  );
}
