import { useState, useRef, useEffect } from "react";
import { Car, Info, AlertCircle, CheckCircle2 } from "lucide-react";
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
  asiguratori: Asigurator[]; clienti: Client[]; comenzi: ComandaService[]; dosare: DosarDauna[]; mecanici: Mecanic[]; angajati: any[];
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
    if (!derivate.validare.poateSalva || !derivate.vehiculSelectat || !derivate.clientSelectat || stare.idMecaniciSelectati.length === 0 || salvareInCurs) return;

    // Pentru lucrări fără asigurare creăm tot un dosar tehnic. Backend-ul
    // folosește dosarul ca punct de legătură între comandă, client și vehicul.
    const trebuieDosarNou = !stare.idDosarSelectat;

    const comanda: Omit<ComandaService, "idComanda"> = {
      numarComanda: derivate.preview.numarComandaPreview,
      idVehicul: derivate.vehiculSelectat.idVehicul,
      idMecanici: stare.idMecaniciSelectati,
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
      idInspector: stare.esteLucrareAsigurare ? stare.stareDosar.idInspector : null,
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
    <div className="w-full" ref={topRef}>
      {derivate.vehiculSelectat ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-12">
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
                  angajati={props.angajati}
                  nrDosarPreview={derivate.preview.numarDosarPreview}
                  value={stare.stareDosar}
                  onChange={setters.setStareDosar}
                  campuriCuEroare={derivate.validare.campuriCuEroare.dosar}
                />
              )}

              <FormComanda
                vehicul={derivate.vehiculSelectat}
                mecanici={props.mecanici}
                idMecaniciSelectati={stare.idMecaniciSelectati}
                onMecaniciChange={setters.setIdMecaniciSelectati}
                nrComandaPreview={derivate.preview.numarComandaPreview}
                detaliiPreluare={stare.detaliiPreluare}
                onDetaliiChange={(mod) => setters.setDetaliiPreluare(p => ({ ...p, ...mod }))}
                pozitii={stare.pozitiiDraft}
                onPozitiiChange={setters.setPozitiiDraft}
                catalogPiese={props.catalogPiese}
                catalogManopere={props.catalogManopere}
                catalogKituri={props.catalogKituri}
                subtotalEstimat={derivate.indicatori.rezumatPozitii.subtotal}
                totalEstimat={derivate.indicatori.rezumatPozitii.total}
                tvaEstimat={derivate.indicatori.rezumatPozitii.tva}
                blocheazaTipPlataAsigurare={stare.esteLucrareAsigurare}
                campuriCuEroare={derivate.validare.campuriCuEroare}
              />

              {/* Bara de jos consolidată (Sticky) */}
              <div className="sticky bottom-0 z-40 -mx-8 -mb-8 mt-12 bg-white/95 backdrop-blur-xl border-t border-indigo-100 shadow-[0_-10px_40px_-15px_rgba(79,70,229,0.2)] px-8 py-5">
                <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-6">

                  {/* Context Vehicul și Comandă */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-white shadow-lg shadow-indigo-200">
                      <Car className="h-4 w-4" />
                      <span className="text-sm font-black tracking-widest uppercase">{derivate.vehiculSelectat.numarInmatriculare}</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3.5 py-2 rounded-xl border border-indigo-100 shadow-sm">
                      <Info className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{derivate.preview.numarComandaPreview}</span>
                    </div>
                    {stare.esteLucrareAsigurare && stare.stareDosar.tipPolita && (
                      <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                        Dosar {stare.stareDosar.tipPolita}
                      </div>
                    )}
                    <div className="hidden 2xl:flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100">
                      <span>Generare deviz în curs</span>
                    </div>
                  </div>

                  {/* Bara de progres vizuală */}
                  <div className="flex-1 flex flex-col gap-1.5 max-w-xl w-full">
                    <div className="flex justify-between px-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">
                        Progres: Pas {derivate.flux.pasCurent} / {derivate.flux.pasiFlux.length}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {derivate.flux.pasiFlux[derivate.flux.pasCurent - 1]}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/50 shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                        style={{ width: `${(derivate.flux.pasCurent / derivate.flux.pasiFlux.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Totale și Acțiuni */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Deviz Estimativ</p>
                        <p className="text-base font-black text-indigo-900 leading-none">{formatSuma(derivate.indicatori.rezumatPozitii.total)}</p>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div className="relative">
                        {derivate.validare.mesajeBlocare.length > 0 ? (
                          <div className="group relative">
                            <AlertCircle className="h-6 w-6 text-rose-500 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-4 w-64 scale-0 z-50 origin-bottom-right rounded-2xl bg-slate-900 p-4 text-[11px] text-white shadow-2xl transition-all group-hover:scale-100">
                              <p className="font-bold text-rose-400 mb-2 border-b border-white/10 pb-1">Erori de validare:</p>
                              <div className="space-y-1.5">
                                {derivate.validare.mesajeBlocare.map((m, i) => <p key={i} className="leading-relaxed opacity-90">• {m}</p>)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-emerald-50 p-1.5 rounded-full border border-emerald-100">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                      <button
                        onClick={() => setResetOpen(true)}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-all"
                      >
                        Anulează
                      </button>
                      <button
                        id="btn-save-preluare"
                        onClick={handleSalveaza}
                        disabled={!derivate.validare.poateSalva || salvareInCurs}
                        className="group relative overflow-hidden rounded-xl bg-indigo-600 px-8 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 disabled:bg-slate-300 disabled:shadow-none disabled:translate-y-0"
                      >
                        <span className="relative z-10">
                          {salvareInCurs ? "Se salvează..." : "Deschide comanda"}
                        </span>
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <ConfirmDialog
                isOpen={resetOpen}
                onCancel={() => setResetOpen(false)}
                onConfirm={() => { setters.reseteazaFlux(); setResetOpen(false); }}
                title="Anulezi recepția?"
                description="Toate datele introduse până acum vor fi pierdute definitiv."
              />
            </div>
          ) : (
            <div className="space-y-6">
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
              <SelectorVehicul
                vehicule={props.vehicule}
                clienti={props.clienti}
                comenzi={props.comenzi}
                idVehiculSelectat={stare.idVehiculSelectat}
                onSelecteaza={setters.setIdVehiculSelectat}
              />
            </div>
          )}
        </div>
      );
}
