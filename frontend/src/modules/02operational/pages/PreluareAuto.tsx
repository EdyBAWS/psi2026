import { useState } from 'react';
import FormComanda from '../components/FormComanda';
import SelectorDosar, {
  type StareDosarAsigurare,
  stareDosarInitiala,
} from '../components/SelectorDosar';
import SelectorVehicul from '../components/SelectorVehicul';
import { creeazaPozitieDraft } from '../components/TabelPozitii';
import type {
  Asigurator,
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

const calculeazaTotalEstimat = (pozitiiDraft: PozitieComandaDraft[]) =>
  Number(
    pozitiiDraft
      .reduce(
        (total, pozitie) =>
          total + pozitie.cantitate * pozitie.pretVanzare * (1 + pozitie.cotaTVA / 100),
        0,
      )
      .toFixed(2),
  );

const urmatorulId = <T,>(items: T[], selector: (item: T) => number) =>
  items.length === 0 ? 1 : Math.max(...items.map(selector)) + 1;

const genereazaNumarDocument = (prefix: string, id: number) =>
  `${prefix}-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;

const esteNumarCompletat = (valoare: number | ''): valoare is number => valoare !== '';

const suntPozitiiValide = (pozitiiDraft: PozitieComandaDraft[]) =>
  pozitiiDraft.length > 0 &&
  pozitiiDraft.every(
    (pozitie) =>
      pozitie.descriere.trim() !== '' &&
      pozitie.cantitate > 0 &&
      pozitie.pretVanzare > 0 &&
      pozitie.cotaTVA >= 0,
  );

export default function PreluareAuto({
  asiguratori,
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
  const [idMecanicSelectat, setIdMecanicSelectat] = useState<number | null>(null);
  const [pozitiiDraft, setPozitiiDraft] = useState<PozitieComandaDraft[]>([
    creeazaPozitieDraft(),
  ]);

  const vehiculSelectat =
    vehicule.find((vehicul) => vehicul.idVehicul === idVehiculSelectat) ?? null;
  const totalEstimat = calculeazaTotalEstimat(pozitiiDraft);
  const nrComandaPreview = genereazaNumarDocument(
    'CMD',
    urmatorulId(comenzi, (comanda) => comanda.idComanda),
  );
  const nrDosarPreview = genereazaNumarDocument(
    'DAUNA',
    urmatorulId(dosare, (dosar) => dosar.idDosar),
  );

  const dosarValid = !esteLucrareAsigurare
    ? true
    : stareDosar.mod === 'existent'
      ? stareDosar.idDosarSelectat !== null
      : stareDosar.idAsigurator !== null &&
        esteNumarCompletat(stareDosar.sumaAprobata) &&
        stareDosar.sumaAprobata > 0 &&
        esteNumarCompletat(stareDosar.franciza) &&
        stareDosar.franciza >= 0;

  const poateSalva =
    vehiculSelectat !== null &&
    idMecanicSelectat !== null &&
    suntPozitiiValide(pozitiiDraft) &&
    dosarValid;

  const reseteazaFlux = () => {
    setIdVehiculSelectat(null);
    setEsteLucrareAsigurare(false);
    setStareDosar(stareDosarInitiala);
    setIdMecanicSelectat(null);
    setPozitiiDraft([creeazaPozitieDraft()]);
  };

  const handleSelecteazaVehicul = (idVehicul: number | null) => {
    setIdVehiculSelectat(idVehicul);
    setEsteLucrareAsigurare(false);
    setStareDosar(stareDosarInitiala);
  };

  const handleSchimbaFluxAsigurare = (activ: boolean) => {
    setEsteLucrareAsigurare(activ);

    if (!activ || idVehiculSelectat === null) {
      setStareDosar(stareDosarInitiala);
      return;
    }

    const dosareVehicul = dosare.filter((dosar) => dosar.idVehicul === idVehiculSelectat);
    setStareDosar({
      ...stareDosarInitiala,
      mod: dosareVehicul.length > 0 ? 'existent' : 'nou',
      idDosarSelectat: dosareVehicul[0]?.idDosar ?? null,
    });
  };

  const handleSalveaza = () => {
    if (!vehiculSelectat || idMecanicSelectat === null || !poateSalva) {
      return;
    }

    const idComandaNoua = urmatorulId(comenzi, (comanda) => comanda.idComanda);
    const dataDeschidere = new Date();

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
          dataDeschidere,
          sumaAprobata: stareDosar.sumaAprobata,
          franciza: stareDosar.franciza,
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
      status: 'Deschis',
      totalEstimat,
    };

    const urmatorulIdPozitie = urmatorulId(pozitii, (pozitie) => pozitie.idPozitieCmd);
    const pozitiiNoi: PozitieComanda[] = pozitiiDraft.map((pozitie, index) => {
      const idPozitieCmd = urmatorulIdPozitie + index;

      return {
        idPozitieCmd,
        idComanda: idComandaNoua,
        idPiesa: pozitie.tipPozitie === 'Piesa' ? 1000 + idPozitieCmd : null,
        idKit: pozitie.tipPozitie === 'Kit' ? 2000 + idPozitieCmd : null,
        idManopera: pozitie.tipPozitie === 'Manopera' ? 3000 + idPozitieCmd : null,
        tipPozitie: pozitie.tipPozitie,
        cantitate: pozitie.cantitate,
        pretVanzare: pozitie.pretVanzare,
        cotaTVA: pozitie.cotaTVA,
      };
    });

    onSalveazaPreluare({
      comanda: comandaNoua,
      dosarNou,
      pozitiiNoi,
    });

    reseteazaFlux();
  };

  return (
    <section className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-800">
              Preluare auto
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Selectează vehiculul, configurează contextul comenzii și salvează
              estimarea inițială de piese și manoperă.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Comanda nouă va primi numărul <strong>{nrComandaPreview}</strong>
          </div>
        </div>
      </div>

      <SelectorVehicul
        idVehiculSelectat={idVehiculSelectat}
        onSelecteaza={handleSelecteazaVehicul}
        vehicule={vehicule}
      />

      {vehiculSelectat ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Vehicul selectat
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
                  <dd className="mt-1">#{vehiculSelectat.idClient}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">An fabricație</dt>
                  <dd className="mt-1">{vehiculSelectat.an}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Serie șasiu</dt>
                  <dd className="mt-1 break-all">{vehiculSelectat.serieSasiu}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Tip intervenție
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-800">
                    {esteLucrareAsigurare ? 'Lucrare cu asigurare' : 'Lucrare client direct'}
                  </h3>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-700">Daună</span>
                  <input
                    type="checkbox"
                    checked={esteLucrareAsigurare}
                    onChange={(event) =>
                      handleSchimbaFluxAsigurare(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm text-slate-600">
                  Total estimat curent: <strong>{formatSuma(totalEstimat)}</strong>
                </p>
                {esteLucrareAsigurare ? (
                  <p className="mt-2 text-sm text-slate-500">
                    La salvare se va folosi dosarul selectat sau se va genera unul nou:
                    <strong> {nrDosarPreview}</strong>
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {esteLucrareAsigurare ? (
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
            idMecanicSelectat={idMecanicSelectat}
            mecanici={mecanici}
            nrComandaPreview={nrComandaPreview}
            pozitii={pozitiiDraft}
            totalEstimat={totalEstimat}
            vehicul={vehiculSelectat}
            onMecanicChange={setIdMecanicSelectat}
            onPozitiiChange={setPozitiiDraft}
          />

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1 text-sm text-slate-500">
              <p>
                Salvarea este permisă doar dacă ai selectat vehiculul, mecanicul și ai
                completat toate pozițiile.
              </p>
              <p>
                Dacă fluxul de daună este activ, trebuie ales un dosar existent sau
                completat unul nou.
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
          Selectează un vehicul pentru a continua cu preluarea și estimarea comenzii.
        </div>
      )}
    </section>
  );
}
