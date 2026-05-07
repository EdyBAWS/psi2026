import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchAsiguratori, fetchCatalogKituri, fetchCatalogManopere, fetchCatalogPiese, fetchClienti, fetchComenzi, fetchDosareDauna, fetchMecanici, fetchPozitiiComanda, fetchVehicule, createComanda, createDosarDauna, createPozitiiComanda } from "./operational.service";
import GestiuneComenzi from "./pages/gestiune-comenzi/GestiuneComenzi";
import PreluareAuto, { type SalvarePreluarePayload } from "./pages/preluare-auto/PreluareAuto";
import type { Asigurator, CatalogKit, CatalogManopera, CatalogPiesa, Client, ComandaService, DosarDauna, Mecanic, PozitieComanda, Vehicul } from "./types";

export type OperationalView = "preluare-auto" | "gestiune-comenzi";

interface OperationalProps {
  onNavigate: (pagina: string) => void;
  view: OperationalView;
}

interface LoadingState {
  comenzi: boolean;
  dosare: boolean;
  pozitii: boolean;
  referinta: boolean;
}

const loadingInitial: LoadingState = {
  comenzi: true, dosare: true, pozitii: true, referinta: true,
};

export default function Operational({ onNavigate, view }: OperationalProps) {
  const [comenzi, setComenzi] = useState<ComandaService[]>([]);
  const [dosare, setDosare] = useState<DosarDauna[]>([]);
  const [pozitii, setPozitii] = useState<PozitieComanda[]>([]);

  const [vehicule, setVehicule] = useState<Vehicul[]>([]);
  const [mecanici, setMecanici] = useState<Mecanic[]>([]);
  const [clienti, setClienti] = useState<Client[]>([]);
  const [asiguratori, setAsiguratori] = useState<Asigurator[]>([]);
  const [catalogPiese, setCatalogPiese] = useState<CatalogPiesa[]>([]);
  const [catalogKituri, setCatalogKituri] = useState<CatalogKit[]>([]);
  const [catalogManopere, setCatalogManopere] = useState<CatalogManopera[]>([]);

  const [loading, setLoading] = useState<LoadingState>(loadingInitial);

  useEffect(() => {
    fetchComenzi().then(setComenzi).catch(() => toast.error("Nu s-au putut încărca comenzile.")).finally(() => setLoading((prev) => ({ ...prev, comenzi: false })));
    fetchDosareDauna().then(setDosare).catch(() => toast.error("Nu s-au putut încărca dosarele.")).finally(() => setLoading((prev) => ({ ...prev, dosare: false })));
    fetchPozitiiComanda().then(setPozitii).catch(() => toast.error("Nu s-au putut încărca pozițiile.")).finally(() => setLoading((prev) => ({ ...prev, pozitii: false })));

    Promise.all([
      fetchVehicule(), fetchMecanici(), fetchClienti(), fetchAsiguratori(), fetchCatalogPiese(), fetchCatalogKituri(), fetchCatalogManopere(),
    ]).then(([v, m, c, a, p, k, man]) => {
      setVehicule(v); setMecanici(m); setClienti(c); setAsiguratori(a); setCatalogPiese(p); setCatalogKituri(k); setCatalogManopere(man);
    }).catch(() => toast.error("Eroare la datele de referință.")).finally(() => setLoading((prev) => ({ ...prev, referinta: false })));
  }, []);

  const handleSalveazaPreluare = async ({ comanda, dosarNou, pozitiiNoi }: SalvarePreluarePayload) => {
    try {
      const comandaSalvata = await createComanda(comanda);
      if (dosarNou) {
        const dosarSalvat = await createDosarDauna(dosarNou);
        setDosare((prev) => [...prev, dosarSalvat]);
      }
      const pozitiiSalvate = await createPozitiiComanda(comandaSalvata.idComanda, pozitiiNoi);
      
      setComenzi((prev) => [...prev, comandaSalvata]);
      setPozitii((prev) => [...prev, ...pozitiiSalvate]);

      toast.success(`Comanda ${comandaSalvata.numarComanda} a fost deschisă cu succes.`);
      onNavigate("operational-comenzi");
    } catch {
      toast.error("Comanda nu a putut fi salvată.");
    }
  };

  const seIncarca = Object.values(loading).some(Boolean);

  return (
    <section className="space-y-6 w-full">
      {seIncarca ? (
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
          Se încarcă datele operaționale...
        </div>
      ) : view === "preluare-auto" ? (
        <PreluareAuto
          clienti={clienti} vehicule={vehicule} dosare={dosare} comenzi={comenzi} pozitii={pozitii}
          mecanici={mecanici} asiguratori={asiguratori} catalogPiese={catalogPiese} catalogKituri={catalogKituri} catalogManopere={catalogManopere}
          onSalveazaPreluare={handleSalveazaPreluare}
        />
      ) : (
        <GestiuneComenzi clienti={clienti} comenzi={comenzi} dosare={dosare} asiguratori={asiguratori} mecanici={mecanici} pozitii={pozitii} vehicule={vehicule} />
      )}
    </section>
  );
}