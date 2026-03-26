// Fișierul principal al modulului operațional.
import { useState } from 'react';
import { toast } from 'sonner';
import {
  mockAsiguratori,
  mockCatalogKituri,
  mockCatalogManopera,
  mockCatalogPiese,
  mockClienti,
  mockComenzi,
  mockDosareDauna,
  mockMecanici,
  mockPozitii,
  mockVehicule,
} from '../../mock/operational';
import { comandaEsteActiva } from './calculations';
import GestiuneComenzi from './pages/GestiuneComenzi';
import PreluareAuto, { type SalvarePreluarePayload } from './pages/PreluareAuto';

export type OperationalView = 'preluare-auto' | 'gestiune-comenzi';

interface OperationalProps {
  onNavigate: (pagina: string) => void;
  view: OperationalView;
}

export default function Operational({ onNavigate, view }: OperationalProps) {
  const [comenzi, setComenzi] = useState(mockComenzi);
  const [dosare, setDosare] = useState(mockDosareDauna);
  const [pozitii, setPozitii] = useState(mockPozitii);

  const handleSalveazaPreluare = ({
    comanda,
    dosarNou,
    pozitiiNoi,
  }: SalvarePreluarePayload) => {
    setComenzi((previous) => [...previous, comanda]);
    if (dosarNou) {
      setDosare((previous) => [...previous, dosarNou]);
    }
    setPozitii((previous) => [...previous, ...pozitiiNoi]);
    
    toast.success(`Comanda ${comanda.nrComanda} a fost deschisă cu succes.`);
    onNavigate('operational-comenzi');
  };

  // Re-aducem calculul statisticilor generale pentru antet
  const comenziActive = comenzi.filter((comanda) => comandaEsteActiva(comanda.status)).length;

  return (
    <section className="space-y-6 w-full">
      {/* Antetul apare DOAR pe pagina de preluare auto (recepție) */}
      {view === 'preluare-auto' && (
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
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Vehicule disponibile
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-800">{mockVehicule.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Comenzi active
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-800">{comenziActive}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Dosare de daună
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-800">{dosare.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rutele propriu-zise */}
      {view === 'preluare-auto' ? (
        <PreluareAuto
          clienti={mockClienti}
          vehicule={mockVehicule}
          dosare={dosare}
          comenzi={comenzi}
          pozitii={pozitii}
          mecanici={mockMecanici}
          asiguratori={mockAsiguratori}
          catalogPiese={mockCatalogPiese}
          catalogKituri={mockCatalogKituri}
          catalogManopere={mockCatalogManopera}
          onSalveazaPreluare={handleSalveazaPreluare}
        />
      ) : (
        <GestiuneComenzi
          clienti={mockClienti}
          comenzi={comenzi}
          dosare={dosare}
          asiguratori={mockAsiguratori}
          mecanici={mockMecanici}
          pozitii={pozitii}
          vehicule={mockVehicule}
        />
      )}
    </section>
  );
}
