// src/modules/02operational/Operational.tsx
//
// Orchestratorul modulului operațional.
// Responsabilități:
//   1. Încarcă toate datele necesare prin operational.service.ts
//   2. Menține starea shared între PreluareAuto și GestiuneComenzi
//      (comenzi, dosare, pozitii — se pot schimba la recepție și trebuie
//       reflectate imediat în gestiune, fără reîncărcare)
//   3. Pasează date și callback-uri în jos ca props
//
// La integrarea Spring Boot: înlocuiești implementarea din service,
// acest fișier rămâne neschimbat.

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "../../componente/ui/StatCard";
import { comandaEsteActiva } from "./calculations";
import {
  fetchAsiguratori,
  fetchCatalogKituri,
  fetchCatalogManopere,
  fetchCatalogPiese,
  fetchClienti,
  fetchComenzi,
  fetchDosareDauna,
  fetchMecanici,
  fetchPozitiiComanda,
  fetchVehicule,
  createComanda,
  createDosarDauna,
  createPozitiiComanda,
} from "./operational.service";
import GestiuneComenzi from "./pages/gestiune-comenzi/GestiuneComenzi";
import PreluareAuto, {
  type SalvarePreluarePayload,
} from "./pages/preluare-auto/PreluareAuto";
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
  Vehicul,
} from "./types";

export type OperationalView = "preluare-auto" | "gestiune-comenzi";

interface OperationalProps {
  onNavigate: (pagina: string) => void;
  view: OperationalView;
}

// Starea de loading granulară — știm exact ce se încarcă,
// astfel încât UI-ul să poată afișa indicatori specifici, nu un singur spinner global.
interface LoadingState {
  comenzi: boolean;
  dosare: boolean;
  pozitii: boolean;
  referinta: boolean; // vehicule, mecanici, clienti, asiguratori, catalog
}

const loadingInitial: LoadingState = {
  comenzi: true,
  dosare: true,
  pozitii: true,
  referinta: true,
};

export default function Operational({ onNavigate, view }: OperationalProps) {
  // ── Date mutabile (se pot modifica în timpul sesiunii) ────────────────────
  const [comenzi, setComenzi] = useState<ComandaService[]>([]);
  const [dosare, setDosare] = useState<DosarDauna[]>([]);
  const [pozitii, setPozitii] = useState<PozitieComanda[]>([]);

  // ── Date de referință (read-only în operațional) ──────────────────────────
  const [vehicule, setVehicule] = useState<Vehicul[]>([]);
  const [mecanici, setMecanici] = useState<Mecanic[]>([]);
  const [clienti, setClienti] = useState<Client[]>([]);
  const [asiguratori, setAsiguratori] = useState<Asigurator[]>([]);
  const [catalogPiese, setCatalogPiese] = useState<CatalogPiesa[]>([]);
  const [catalogKituri, setCatalogKituri] = useState<CatalogKit[]>([]);
  const [catalogManopere, setCatalogManopere] = useState<CatalogManopera[]>([]);

  const [loading, setLoading] = useState<LoadingState>(loadingInitial);

  // ── Încărcare date ────────────────────────────────────────────────────────
  useEffect(() => {
    // Datele mutabile se încarcă în paralel, fiecare cu propriul flag de loading.
    fetchComenzi()
      .then(setComenzi)
      .catch(() => toast.error("Nu s-au putut încărca comenzile."))
      .finally(() => setLoading((prev) => ({ ...prev, comenzi: false })));

    fetchDosareDauna()
      .then(setDosare)
      .catch(() => toast.error("Nu s-au putut încărca dosarele de daună."))
      .finally(() => setLoading((prev) => ({ ...prev, dosare: false })));

    fetchPozitiiComanda()
      .then(setPozitii)
      .catch(() => toast.error("Nu s-au putut încărca pozițiile comenzilor."))
      .finally(() => setLoading((prev) => ({ ...prev, pozitii: false })));

    // Datele de referință se încarcă în paralel printr-un singur Promise.all —
    // sunt read-only și nu au nevoie de loading granular individual.
    Promise.all([
      fetchVehicule(),
      fetchMecanici(),
      fetchClienti(),
      fetchAsiguratori(),
      fetchCatalogPiese(),
      fetchCatalogKituri(),
      fetchCatalogManopere(),
    ])
      .then(
        ([
          vehiculeData,
          mecaniciData,
          clientiData,
          asiguratoriData,
          pieseCatalog,
          kituriCatalog,
          manopereCatalog,
        ]) => {
          setVehicule(vehiculeData);
          setMecanici(mecaniciData);
          setClienti(clientiData);
          setAsiguratori(asiguratoriData);
          setCatalogPiese(pieseCatalog);
          setCatalogKituri(kituriCatalog);
          setCatalogManopere(manopereCatalog);
        },
      )
      .catch(() => toast.error("Nu s-au putut încărca datele de referință."))
      .finally(() => setLoading((prev) => ({ ...prev, referinta: false })));
  }, []);

  // ── Salvare recepție (tranzacție: comanda + dosar opțional + pozitii) ─────
  // Aceasta este singura operațiune de scriere din Operational.tsx.
  // Pasul de scriere în baza de date (când vom avea Spring Boot) va fi
  // o tranzacție atomică pe backend — frontend-ul va face un singur POST
  // care va conține comanda, dosarul și pozițiile.
  // Până atunci, simulăm secvențial cu service-urile locale.
  const handleSalveazaPreluare = async ({
    comanda,
    dosarNou,
    pozitiiNoi,
  }: SalvarePreluarePayload) => {
    try {
      // 1. Creăm comanda
      const comandaSalvata = await createComanda(comanda);

      // 2. Dacă există dosar nou, îl creăm și actualizăm referința în comandă
      let dosarSalvat: DosarDauna | null = null;
      if (dosarNou) {
        dosarSalvat = await createDosarDauna(dosarNou);
        setDosare((prev) => [...prev, dosarSalvat!]);
      }

      // 3. Creăm pozițiile legate de comanda nou creată
      const pozitiiSalvate = await createPozitiiComanda(
        comandaSalvata.idComanda,
        pozitiiNoi,
      );

      // 4. Actualizăm starea locală — UI-ul reflectă imediat noile date
      setComenzi((prev) => [...prev, comandaSalvata]);
      setPozitii((prev) => [...prev, ...pozitiiSalvate]);

      toast.success(`Comanda ${comandaSalvata.nrComanda} a fost deschisă cu succes.`);
      onNavigate("operational-comenzi");
    } catch {
      toast.error("Comanda nu a putut fi salvată. Încearcă din nou.");
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  const seIncarca = Object.values(loading).some(Boolean);

  // Statistici derivate din state — recalculate automat la orice schimbare.
  const comenziActive = comenzi.filter((c) => comandaEsteActiva(c.status)).length;

  return (
    <section className="space-y-6 w-full">
      {/* Antetul apare DOAR pe pagina de preluare auto */}
      {view === "preluare-auto" && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                Modul Operațional
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-800">
                Preluare vehicule și deschidere comenzi service
              </h2>
              <p className="max-w-3xl text-sm text-slate-500">
                Modulul operațional acoperă recepția vehiculului și gestionarea
                comenzilor service, cu aceeași stare comună între cele două ecrane.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard
                label="Vehicule disponibile"
                value={seIncarca ? "—" : vehicule.length}
              />
              <StatCard
                label="Comenzi active"
                value={seIncarca ? "—" : comenziActive}
                tone="warning"
              />
              <StatCard
                label="Dosare de daună"
                value={seIncarca ? "—" : dosare.length}
                tone="info"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stare de încărcare — afișată în locul conținutului până când datele sunt gata */}
      {seIncarca ? (
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
          Se încarcă datele operaționale...
        </div>
      ) : view === "preluare-auto" ? (
        <PreluareAuto
          clienti={clienti}
          vehicule={vehicule}
          dosare={dosare}
          comenzi={comenzi}
          pozitii={pozitii}
          mecanici={mecanici}
          asiguratori={asiguratori}
          catalogPiese={catalogPiese}
          catalogKituri={catalogKituri}
          catalogManopere={catalogManopere}
          onSalveazaPreluare={handleSalveazaPreluare}
        />
      ) : (
        <GestiuneComenzi
          clienti={clienti}
          comenzi={comenzi}
          dosare={dosare}
          asiguratori={asiguratori}
          mecanici={mecanici}
          pozitii={pozitii}
          vehicule={vehicule}
        />
      )}
    </section>
  );
}