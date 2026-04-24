import { useState } from "react";
import { ConfirmDialog } from "../../../../componente/ui/ConfirmDialog";
import { EmptyState } from "../../../../componente/ui/EmptyState";
import FormComanda from "./components/FormComanda";
import SelectorDosar from "./components/SelectorDosar";
import SelectorVehicul from "../../shared-components/SelectorVehicul";
import PreluareAutoContext from "../preluare-auto/PreluareAutoContext";
import PreluareAutoHeader from "../preluare-auto/PreluareAutoHeader";
import { formatSuma } from "./preluareAuto.helpers";
import { usePreluareAuto } from "./usePreluareAuto";
import { comandaEsteActiva } from "../../calculations"; // <-- Import nou necesar pt statistici
import type { Asigurator, CatalogKit, CatalogManopera, CatalogPiesa, Client, ComandaService, DosarDauna, Mecanic, PozitieComanda, Vehicul } from "../../types";

export interface SalvarePreluarePayload {
  comanda: Omit<ComandaService, "idComanda">;
  dosarNou: Omit<DosarDauna, "idDosar"> | null;
  pozitiiNoi: Omit<PozitieComanda, "idPozitieCmd" | "idComanda">[];
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

export default function PreluareAuto(props: PreluareAutoProps) {
  const { stare, setters, derivate } = usePreluareAuto(props);
  const [esteDialogResetDeschis, setEsteDialogResetDeschis] = useState(false);

  const confirmaResetare = () => {
    setters.reseteazaFlux();
    setEsteDialogResetDeschis(false);
  };

  const handleSalveaza = () => {
    if (!derivate.validare.poateSalva || !derivate.vehiculSelectat || !stare.idMecanicSelectat) return;

    const comanda: Omit<ComandaService, "idComanda"> = {
      accesoriiPredate: stare.detaliiPreluare.accesoriiPredate.split(",").map((s) => s.trim()).filter(Boolean),
      dataDeschidere: new Date(),
      dataFinalizare: null,
      idDosar: stare.esteLucrareAsigurare && stare.stareDosar.mod === "existent" ? stare.stareDosar.idDosarSelectat : null,
      idMecanic: stare.idMecanicSelectat,
      idVehicul: derivate.vehiculSelectat.idVehicul,
      kilometrajPreluare: Number(stare.detaliiPreluare.kilometrajPreluare),
      nivelCombustibil: stare.detaliiPreluare.nivelCombustibil,
      nrComanda: derivate.preview.nrComandaPreview,
      observatiiCaroserie: stare.detaliiPreluare.observatiiCaroserie,
      observatiiPreluare: stare.detaliiPreluare.observatiiPreluare,
      prioritate: stare.detaliiPreluare.prioritate,
      simptomeReclamate: stare.detaliiPreluare.simptomeReclamate,
      status: "In asteptare diagnoza",
      termenPromis: new Date(stare.detaliiPreluare.termenPromis),
      tipPlata: stare.detaliiPreluare.tipPlata,
      totalEstimat: derivate.indicatori.rezumatPozitii.total,
    };

    const dosarNou: Omit<DosarDauna, "idDosar"> | null = 
      stare.esteLucrareAsigurare && stare.stareDosar.mod === "nou"
        ? {
            dataConstatare: new Date(stare.stareDosar.dataConstatare),
            dataDeschidere: new Date(),
            franciza: Number(stare.stareDosar.franciza) || 0,
            idAsigurator: stare.stareDosar.idAsigurator!,
            idClient: derivate.clientSelectat!.idClient,
            idVehicul: derivate.vehiculSelectat.idVehicul,
            inspectorDauna: stare.stareDosar.inspectorDauna,
            nrDosar: derivate.preview.nrDosarPreview,
            numarReferintaAsigurator: stare.stareDosar.numarReferintaAsigurator,
            observatiiDauna: stare.stareDosar.observatiiDauna,
            statusAprobare: stare.stareDosar.statusAprobare,
            sumaAprobata: Number(stare.stareDosar.sumaAprobata) || 0,
            tipPolita: stare.stareDosar.tipPolita,
          }
        : null;

    const pozitiiNoi = stare.pozitiiDraft.map((p) => ({
      cantitate: p.cantitate,
      codArticol: p.codArticol,
      cotaTVA: p.cotaTVA,
      descriere: p.descriere,
      discountProcent: p.discountProcent,
      disponibilitateStoc: p.disponibilitateStoc,
      idKit: p.tipPozitie === "Kit" ? p.catalogId : null,
      idManopera: p.tipPozitie === "Manopera" ? p.catalogId : null,
      idPiesa: p.tipPozitie === "Piesa" ? p.catalogId : null,
      observatiiPozitie: p.observatiiPozitie,
      pretVanzare: p.pretVanzare,
      tipPozitie: p.tipPozitie,
      unitateMasura: p.unitateMasura,
    }));

    props.onSalveazaPreluare({ comanda, dosarNou, pozitiiNoi });
    setters.reseteazaFlux();
  };

  // Calculăm numărul de comenzi active pentru a le pasa header-ului
  const comenziActiveCount = props.comenzi.filter((c) => comandaEsteActiva(c.status)).length;

  return (
    <div className="w-full">
      <PreluareAutoHeader
        esteLucrareAsigurare={stare.esteLucrareAsigurare}
        mesajeBlocare={derivate.validare.mesajeBlocare}
        nrComandaPreview={derivate.preview.nrComandaPreview}
        pasCurent={derivate.flux.pasCurent}
        pasiFlux={derivate.flux.pasiFlux}
        rezumatTotal={derivate.indicatori.rezumatPozitii.total > 0 ? formatSuma(derivate.indicatori.rezumatPozitii.total) : null}
        stareDosarTipPolita={stare.esteLucrareAsigurare ? stare.stareDosar.tipPolita : null}
        vehiculSelectat={derivate.vehiculSelectat}
        // Pasăm datele pentru statistici
        stats={{
          vehiculeDisponibile: props.vehicule.length,
          comenziActive: comenziActiveCount,
          dosareDauna: props.dosare.length,
        }}
      />

      {derivate.vehiculSelectat ? (
        <>
          <div className="mt-8 space-y-6">
            <PreluareAutoContext
              clientSelectat={derivate.clientSelectat}
              comandaActivaExistenta={derivate.comandaActivaExistenta}
              esteLucrareAsigurare={stare.esteLucrareAsigurare}
              onSchimbaFluxAsigurare={setters.schimbaFluxAsigurare}
              vehiculSelectat={derivate.vehiculSelectat}
            />

            {stare.esteLucrareAsigurare && (
              <div className={!derivate.validare.dosarValid ? "rounded-3xl ring-2 ring-inset ring-rose-500/70" : ""}>
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <SelectorDosar
                    asiguratori={props.asiguratori}
                    dosare={props.dosare}
                    nrDosarPreview={derivate.preview.nrDosarPreview}
                    onChange={setters.setStareDosar}
                    value={stare.stareDosar}
                    vehicul={derivate.vehiculSelectat}
                  />
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <FormComanda
                blocheazaTipPlataAsigurare={false}
                campuriCuEroare={{
                  kilometrajPreluare: stare.detaliiPreluare.kilometrajPreluare === "",
                  mecanic: stare.idMecanicSelectat === null,
                  pozitii: stare.pozitiiDraft.length === 0,
                  simptomeReclamate: stare.detaliiPreluare.simptomeReclamate.length < 10,
                  termenPromis: stare.detaliiPreluare.termenPromis === "",
                  tipPlata: false,
                }}
                catalogKituri={props.catalogKituri}
                catalogManopere={props.catalogManopere}
                catalogPiese={props.catalogPiese}
                detaliiPreluare={stare.detaliiPreluare}
                idMecanicSelectat={stare.idMecanicSelectat}
                mecanici={props.mecanici}
                nrComandaPreview={derivate.preview.nrComandaPreview}
                subtotalEstimat={derivate.indicatori.rezumatPozitii.subtotal}
                tvaEstimat={derivate.indicatori.rezumatPozitii.tva}
                totalEstimat={derivate.indicatori.rezumatPozitii.total}
                onDetaliiChange={(mod) => setters.setDetaliiPreluare((prev) => ({ ...prev, ...mod }))}
                onMecanicChange={setters.setIdMecanicSelectat}
                onPozitiiChange={setters.setPozitiiDraft}
                pozitii={stare.pozitiiDraft}
                vehicul={derivate.vehiculSelectat}
              />
            </div>

            <div className="sticky bottom-6 z-20 flex items-center justify-end gap-3 rounded-2xl border border-slate-200/50 bg-white/90 p-4 shadow-xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => setEsteDialogResetDeschis(true)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Resetează
              </button>
              <button
                type="button"
                onClick={handleSalveaza}
                disabled={!derivate.validare.poateSalva}
                className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                Deschide comanda
              </button>
            </div>
          </div>

          <ConfirmDialog
            cancelLabel="Înapoi"
            confirmLabel="Da, resetează"
            description="Toate datele completate în fluxul curent vor fi șterse, inclusiv vehiculul selectat, dosarul și pozițiile din deviz."
            isOpen={esteDialogResetDeschis}
            onCancel={() => setEsteDialogResetDeschis(false)}
            onConfirm={confirmaResetare}
            title="Confirmi resetarea fluxului?"
          />
        </>
      ) : (
        <EmptyState
          title="Niciun vehicul selectat"
          description="Caută și selectează vehiculul din panoul de mai sus pentru a începe preluarea auto."
        />
      )}
      
      {!derivate.vehiculSelectat && (
        <SelectorVehicul
            clienti={props.clienti}
            comenzi={props.comenzi}
            idVehiculSelectat={stare.idVehiculSelectat}
            onSelecteaza={setters.setIdVehiculSelectat}
            vehicule={props.vehicule}
        />
      )}
    </div>
  );
}