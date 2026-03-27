// Aceasta este pagina principală a fluxului operațional.
import { useState } from 'react';
import { EmptyState } from '../../../componente/ui/EmptyState';
import FormComanda from '../components/FormComanda';
import SelectorDosar from '../components/SelectorDosar';
import SelectorVehicul from '../components/SelectorVehicul';
import {
  creeazaPozitieDraft,
  detaliiPreluareInitiale,
  stareDosarInitiala,
  type DetaliiPreluareForm,
  type StareDosarAsigurare,
} from '../formState';
import {
  accesoriiCaLista,
  calculeazaFluxPreluare,
  calculeazaIndicatoriPreluare,
  calculeazaPreviewDocumente,
  esteNumarCompletat,
  formatSuma,
  tipPlataImplicit,
  urmatorulId,
  genereazaNumarDocument,
} from './preluareAuto.helpers';
import PreluareAutoContext from './components/PreluareAutoContext';
import PreluareAutoHeader from './components/PreluareAutoHeader';
import { comandaEsteActiva } from '../calculations';
import { valideazaPreluare } from '../validations';
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
  const { nrComandaPreview, nrDosarPreview } = calculeazaPreviewDocumente(comenzi, dosare);
  const rezumatPozitii = calculeazaIndicatoriPreluare(
    vehiculSelectat,
    esteLucrareAsigurare,
    false,
    detaliiPreluare,
    idMecanicSelectat,
    pozitiiDraft,
  ).rezumatPozitii;
  const comandaActivaExistenta =
    vehiculSelectat === null
      ? null
      : comenzi.find(
          (comanda) =>
            comanda.idVehicul === vehiculSelectat.idVehicul && comandaEsteActiva(comanda.status),
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

  const flux = calculeazaFluxPreluare({
    detaliiPreluare,
    dosarValid,
    esteLucrareAsigurare,
    idMecanicSelectat,
    poateSalva,
    pozitiiDraft,
    vehiculSelectat,
  });

  const indicatori = calculeazaIndicatoriPreluare(
    vehiculSelectat,
    esteLucrareAsigurare,
    dosarValid,
    detaliiPreluare,
    idMecanicSelectat,
    pozitiiDraft,
  );

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
      ? 'Asteapta piese'
      : 'In asteptare diagnoza';

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
    const pozitiiNoi: PozitieComanda[] = pozitiiDraft.map((pozitie, index) => ({
      idPozitieCmd: urmatorulIdPozitie + index,
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
    }));

    onSalveazaPreluare({ comanda: comandaNoua, dosarNou, pozitiiNoi });
    reseteazaFlux();
  };

  return (
    <section className="space-y-6">
      <PreluareAutoHeader
        esteLucrareAsigurare={esteLucrareAsigurare}
        mesajeBlocare={mesajeBlocare}
        nrComandaPreview={nrComandaPreview}
        pasiFlux={flux.pasiFlux}
        pasCurent={flux.pasCurent}
        rezumatTotal={rezumatPozitii.total > 0 ? formatSuma(rezumatPozitii.total) : null}
        stareDosarTipPolita={esteLucrareAsigurare ? stareDosar.tipPolita : null}
        vehiculSelectat={vehiculSelectat ? { nrInmatriculare: vehiculSelectat.nrInmatriculare } : null}
      />

      <SelectorVehicul
        clienti={clienti}
        comenzi={comenzi}
        idVehiculSelectat={idVehiculSelectat}
        onSelecteaza={handleSelecteazaVehicul}
        vehicule={vehicule}
      />

      {vehiculSelectat ? (
        <>
          <PreluareAutoContext
            clientSelectat={clientSelectat}
            comandaActivaExistenta={comandaActivaExistenta}
            esteLucrareAsigurare={esteLucrareAsigurare}
            onSchimbaFluxAsigurare={handleSchimbaFluxAsigurare}
            vehiculSelectat={vehiculSelectat}
          />

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
            <div
              className={`rounded-2xl transition-all duration-300 ${
                indicatori.lipsesteDosar
                  ? 'border-2 border-rose-400 bg-rose-50/20 shadow-[0_0_15px_rgba(251,113,133,0.15)]'
                  : ''
              }`}
            >
              <SelectorDosar
                asiguratori={asiguratori}
                dosare={dosare}
                nrDosarPreview={nrDosarPreview}
                value={stareDosar}
                vehicul={vehiculSelectat}
                onChange={setStareDosar}
              />
            </div>
          ) : null}

          <div
            className={`rounded-2xl transition-all duration-300 ${
              indicatori.lipsescSimptomeSauMecanic
                ? 'border-2 border-rose-400 bg-rose-50/20 p-0.5 shadow-[0_0_15px_rgba(251,113,133,0.15)]'
                : ''
            }`}
          >
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

          <div className="mb-20 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-1 text-sm text-slate-500">
              <p>
                Comanda va porni cu status adaptat realității: dacă lipsește stocul, intră
                automat în <strong>Așteaptă piese</strong>, altfel în{' '}
                <strong>În așteptare diagnoză</strong>.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reseteazaFlux}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Resetează
              </button>
              <button
                type="button"
                onClick={handleSalveaza}
                disabled={!poateSalva}
                className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                Deschide comanda
              </button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="Niciun vehicul selectat"
          description="Caută și selectează un vehicul pentru a continua cu recepția și deschiderea unei comenzi."
        />
      )}
    </section>
  );
}
