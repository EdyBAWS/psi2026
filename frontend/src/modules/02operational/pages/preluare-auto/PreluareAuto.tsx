import { useState, useRef, useEffect } from "react";
import { ConfirmDialog } from "../../../../componente/ui/ConfirmDialog";
import FormComanda from "./components/FormComanda";
import SelectorDosar from "./components/SelectorDosar";
import SelectorVehicul from "../../shared-components/SelectorVehicul";
import PreluareAutoContext from "./PreluareAutoContext";
import PreluareAutoHeader from "./PreluareAutoHeader";
import { formatSuma } from "./preluareAuto.helpers";
import { usePreluareAuto } from "./usePreluareAuto";
import { comandaEsteActiva } from "../../calculations";
import type { Asigurator, CatalogKit, CatalogManopera, CatalogPiesa, Client, ComandaService, DosarDauna, Mecanic, PozitieComanda, PozitieComandaDraft, Vehicul } from "../../types";

export interface SalvarePreluarePayload { comanda: Omit<ComandaService, "idComanda">; dosarNou: Omit<DosarDauna, "idDosar"> | null; pozitiiNoi: PozitieComandaDraft[]; }

interface PreluareAutoProps {
  asiguratori: Asigurator[]; clienti: Client[]; comenzi: ComandaService[]; dosare: DosarDauna[]; mecanici: Mecanic[];
  vehicule: Vehicul[]; catalogPiese: CatalogPiesa[]; catalogManopere: CatalogManopera[]; catalogKituri: CatalogKit[];
  pozitii: PozitieComanda[]; 
  onSalveazaPreluare: (payload: SalvarePreluarePayload) => Promise<void>;
}

export default function PreluareAuto(props: PreluareAutoProps) {
  const { stare, setters, derivate } = usePreluareAuto(props);
  const [resetOpen, setResetOpen] = useState(false);
  const [salvareInCurs, setSalvareInCurs] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    if (topRef.current && stare.idVehiculSelectat) 
      topRef.current.scrollIntoView({ behavior: "smooth" }); 
  }, [stare.idVehiculSelectat]);

  const handleSalveaza = async () => {
    if (!derivate.validare.poateSalva || !derivate.vehiculSelectat || !derivate.clientSelectat || !stare.idMecanicSelectat || salvareInCurs) return;

    // Pentru lucrări fără asigurare creăm tot un dosar tehnic. Backend-ul
    // folosește dosarul ca punct de legătură între comandă, client și vehicul.
    const trebuieDosarNou = !stare.idDosarSelectat;

    const comanda: Omit<ComandaService, "idComanda"> = {
      numarComanda: derivate.preview.numarComandaPreview, 
      idVehicul: derivate.vehiculSelectat.idVehicul, 
      idMecanic: stare.idMecanicSelectat,
      idDosar: stare.idDosarSelectat,
      status: "In asteptare diagnoza", 
      simptomeReclamate: stare.detaliiPreluare.simptomeReclamate, 
      termenPromis: new Date(stare.detaliiPreluare.termenPromis),
      tipPlata: stare.detaliiPreluare.tipPlata, 
      totalEstimat: derivate.indicatori.rezumatPozitii.total, 
      kilometrajPreluare: Number(stare.detaliiPreluare.kilometrajPreluare),
      nivelCombustibil: stare.detaliiPreluare.nivelCombustibil, 
      observatiiPreluare: stare.detaliiPreluare.observatiiPreluare, 
      accesoriiPredate: stare.detaliiPreluare.accesoriiPredate.split(","), 
      prioritate: stare.detaliiPreluare.prioritate
    };

    // Pentru fluxul cu dosar existent trimitem doar comanda. Pentru flux nou,
    // părintele salvează întâi dosarul, apoi creează comanda cu id-ul rezultat.
    const dosarNou: Omit<DosarDauna, "idDosar"> | null = trebuieDosarNou ? {
      numarDosar: stare.esteLucrareAsigurare ? derivate.preview.numarDosarPreview : `TECH-${derivate.preview.numarComandaPreview}`, 
      idClient: derivate.clientSelectat.idClient,
      idVehicul: derivate.vehiculSelectat.idVehicul,
      idAsigurator: stare.esteLucrareAsigurare ? stare.stareDosar.idAsigurator : null,
      status: "Activ",
      dataDeschidere: new Date(),
    } : null;

    setSalvareInCurs(true);
    try {
      await props.onSalveazaPreluare({ comanda, dosarNou, pozitiiNoi: stare.pozitiiDraft });
      setters.reseteazaFlux();
    } finally {
      setSalvareInCurs(false);
    }
  };

  return (
    <div className="w-full space-y-6" ref={topRef}>
      <PreluareAutoHeader
        esteLucrareAsigurare={stare.esteLucrareAsigurare} 
        mesajeBlocare={derivate.validare.mesajeBlocare} 
        numarComandaPreview={derivate.preview.numarComandaPreview}
        pasCurent={derivate.flux.pasCurent} 
        pasiFlux={derivate.flux.pasiFlux} 
        rezumatTotal={derivate.indicatori.rezumatPozitii.total > 0 ? formatSuma(derivate.indicatori.rezumatPozitii.total) : null}
        stareDosarTipPolita={stare.esteLucrareAsigurare ? stare.stareDosar.tipPolita : null} 
        vehiculSelectat={derivate.vehiculSelectat}
        stats={{ 
          vehiculeDisponibile: props.vehicule.length, 
          comenziActive: props.comenzi.filter(c => c.status && comandaEsteActiva(c.status)).length, 
          dosareDauna: props.dosare.length 
        }}
      />

      {derivate.vehiculSelectat ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <PreluareAutoContext 
            vehiculSelectat={derivate.vehiculSelectat} 
            clientSelectat={derivate.clientSelectat} 
            esteLucrareAsigurare={stare.esteLucrareAsigurare} 
            onSchimbaFluxAsigurare={setters.schimbaFluxAsigurare} 
            comandaActivaExistenta={derivate.comandaActivaExistenta} 
          />

          {stare.esteLucrareAsigurare && (
            <SelectorDosar 
              vehicul={derivate.vehiculSelectat} 
              asiguratori={props.asiguratori} 
              dosare={props.dosare} 
              nrDosarPreview={derivate.preview.numarDosarPreview} 
              value={stare.stareDosar} 
              onChange={setters.setStareDosar} 
            />
          )}

          <FormComanda 
            vehicul={derivate.vehiculSelectat} 
            mecanici={props.mecanici} 
            idMecanicSelectat={stare.idMecanicSelectat} 
            onMecanicChange={setters.setIdMecanicSelectat} 
            nrComandaPreview={derivate.preview.numarComandaPreview} 
            detaliiPreluare={stare.detaliiPreluare}
            onDetaliiChange={(mod) => setters.setDetaliiPreluare(p => ({...p, ...mod}))} 
            pozitii={stare.pozitiiDraft} 
            onPozitiiChange={setters.setPozitiiDraft} 
            catalogPiese={props.catalogPiese} 
            catalogManopere={props.catalogManopere} 
            catalogKituri={props.catalogKituri}
            subtotalEstimat={derivate.indicatori.rezumatPozitii.subtotal} 
            totalEstimat={derivate.indicatori.rezumatPozitii.total} 
            tvaEstimat={derivate.indicatori.rezumatPozitii.tva} 
            blocheazaTipPlataAsigurare={stare.esteLucrareAsigurare}
            campuriCuEroare={(derivate.validare as any).campuriCuEroare || { mecanic: false, pozitii: false }} 
          />

          <div className="flex justify-between bg-white p-6 rounded-2xl border shadow-sm">
            <button onClick={() => setResetOpen(true)} className="text-sm font-bold text-rose-600">Anulează</button>
            <button 
              onClick={handleSalveaza} 
              disabled={!derivate.validare.poateSalva || salvareInCurs}
              className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md disabled:bg-slate-300"
            >
              {salvareInCurs ? "Se salvează..." : "Deschide comanda"}
            </button>
          </div>

          <ConfirmDialog 
            isOpen={resetOpen} 
            onCancel={() => setResetOpen(false)} 
            onConfirm={() => { setters.reseteazaFlux(); setResetOpen(false); }} 
            title="Anulezi?" 
            description="Toate datele vor fi pierdute." 
          />
        </div>
      ) : (
        <SelectorVehicul 
          vehicule={props.vehicule} 
          clienti={props.clienti} 
          comenzi={props.comenzi} 
          idVehiculSelectat={stare.idVehiculSelectat} 
          onSelecteaza={setters.setIdVehiculSelectat} 
        />
      )}
    </div>
  );
}
