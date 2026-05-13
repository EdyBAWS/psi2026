import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchAsiguratori, fetchCatalogKituri, fetchCatalogManopere, fetchCatalogPiese, fetchClienti, fetchComenzi, fetchDosareDauna, fetchMecanici, fetchAngajati, fetchPozitiiComanda, fetchVehicule, createComanda, createDosarDauna, createPozitiiComanda, updateComanda, updatePozitiiComanda } from "./operational.service";
import GestiuneComenzi from "./pages/gestiune-comenzi/GestiuneComenzi";
import PreluareAuto, { type SalvarePreluarePayload } from "./pages/preluare-auto/PreluareAuto";
import type { Asigurator, CatalogKit, CatalogManopera, CatalogPiesa, Client, ComandaService, DosarDauna, Mecanic, PozitieComanda, PozitieComandaDraft, Vehicul } from "./types";

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
  const [angajati, setAngajati] = useState<any[]>([]);
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
      fetchVehicule(), fetchMecanici(), fetchClienti(), fetchAsiguratori(), fetchCatalogPiese(), fetchCatalogKituri(), fetchCatalogManopere(), fetchAngajati(),
    ]).then(([v, m, c, a, p, k, man, ang]) => {
      setVehicule(v); setMecanici(m); setClienti(c); setAsiguratori(a); setCatalogPiese(p); setCatalogKituri(k); setCatalogManopere(man); setAngajati(ang);
    }).catch(() => toast.error("Eroare la datele de referință.")).finally(() => setLoading((prev) => ({ ...prev, referinta: false })));
  }, []);

  const handleSalveazaPreluare = async ({ comanda, dosarNou, pozitiiNoi }: SalvarePreluarePayload) => {
    try {
      let idDosarComanda = comanda.idDosar;

      // În modelul Prisma, comanda nu are legătură directă cu vehiculul.
      // Relația corectă este Comanda -> DosarDauna -> Vehicul, deci creăm
      // dosarul tehnic/de daună înainte de comandă când utilizatorul nu a ales
      // deja un dosar existent.
      if (dosarNou) {
        const dosarSalvat = await createDosarDauna(dosarNou);
        idDosarComanda = dosarSalvat.idDosar;
        setDosare((prev) => [...prev, dosarSalvat]);
      }

      if (!idDosarComanda) {
        throw new Error("Comanda trebuie legată de un dosar tehnic sau de daună.");
      }

      const comandaSalvata = await createComanda({ ...comanda, idDosar: idDosarComanda });
      const pozitiiSalvate = await createPozitiiComanda(comandaSalvata.idComanda, pozitiiNoi);

      // Reîncărcăm comenzile din backend ca lista să includă relațiile Prisma
      // expandate: dosar, vehicul, client și mecanic.
      const comenziActualizate = await fetchComenzi();
      setComenzi(comenziActualizate);
      setPozitii((prev) => [...prev, ...pozitiiSalvate]);

      toast.success(`Comanda ${comandaSalvata.numarComanda} a fost deschisă cu succes.`);
      onNavigate("operational-comenzi");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Comanda nu a putut fi salvată.");
      throw error;
    }
  };

  const handleActualizeazaComanda = async (idComanda: number, modificari: Partial<ComandaService>) => {
    try {
      const comandaCurenta = comenzi.find((comanda) => comanda.idComanda === idComanda);

      if (!comandaCurenta) {
        throw new Error("Comanda selectată nu mai există în listă.");
      }

      await updateComanda(idComanda, { ...comandaCurenta, ...modificari });
      const comenziActualizate = await fetchComenzi();
      setComenzi(comenziActualizate);
      toast.success(`Comanda ${comandaCurenta.numarComanda} a fost actualizată.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Comanda nu a putut fi actualizată.");
      throw error;
    }
  };

  const handleActualizeazaPozitii = async (idComanda: number, pozitiiNoi: PozitieComandaDraft[]) => {
    try {
      const salvate = await updatePozitiiComanda(idComanda, pozitiiNoi);
      setPozitii((prev) => {
        const faraCurenta = prev.filter(p => p.idComanda !== idComanda);
        return [...faraCurenta, ...salvate];
      });
      toast.success("Articolele din deviz au fost actualizate.");
    } catch (error) {
      toast.error("Nu s-au putut actualiza articolele din deviz.");
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
          mecanici={mecanici} angajati={angajati} asiguratori={asiguratori} catalogPiese={catalogPiese} catalogKituri={catalogKituri} catalogManopere={catalogManopere}
          onSalveazaPreluare={handleSalveazaPreluare}
        />
      ) : (
        <GestiuneComenzi 
          clienti={clienti} comenzi={comenzi} dosare={dosare} asiguratori={asiguratori} mecanici={mecanici} pozitii={pozitii} vehicule={vehicule} 
          catalogPiese={catalogPiese} catalogKituri={catalogKituri} catalogManopere={catalogManopere}
          onActualizeazaComanda={handleActualizeazaComanda} 
          onActualizeazaPozitii={handleActualizeazaPozitii}
        />
      )}
    </section>
  );
}
