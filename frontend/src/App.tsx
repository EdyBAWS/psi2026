import { useState } from "react";
import Sidebar from "./componente/Sidebar";
import Operational from "./modules/02operational/Operational";
import Facturare from "./modules/03facturare/facturare/Facturare";
import Incasari from "./modules/04incasari/Incasari";
import Penalizare from "./modules/03facturare/penalizari/Penalizare";
import Oferta from "./modules/03facturare/oferte/Oferta";
import Piesa from "./modules/00catalog/piesa/Piesa";
import Manopera from "./modules/00catalog/manopera/Manopera";
import Kituri from "./modules/00catalog/kituri/Kituri";

import { Client } from './modules/01entitati/client/Client';
import { Angajat } from './modules/01entitati/angajat/Angajat';
import { Asigurator } from './modules/01entitati/asigurator/Asigurator';
import Vehicul from './modules/01entitati/vehicule/Vehicul'; 
import Notificare from "./modules/05notificari/Notificari";

import IstoricFacturare from "./modules/03facturare/istoric/IstoricFacturare";
import IstoricIncasari from "./modules/04incasari/IstoricIncasari";

export default function App() {
  // Pornim cu dashboard pentru a fi landing page
  const [paginaCurenta, setPaginaCurenta] = useState<string>("dashboard");

  const randeazaPagina = () => {
    switch (paginaCurenta) {
      case "entitati-clienti":
        return <Client />;
      case "entitati-angajati":
        return <Angajat />;
      case "entitati-asiguratori":
        return <Asigurator />;
      case "entitati-vehicule":
        return <Vehicul onNavigate={setPaginaCurenta} />;
      case "operational-receptie":
        return <Operational onNavigate={setPaginaCurenta} view="preluare-auto" />;
      case "operational-comenzi":
        return <Operational onNavigate={setPaginaCurenta} view="gestiune-comenzi" />;
      case "facturare-comenzi":
        return <Facturare />;
      case "facturare-penalizari":
        return <Penalizare />;
      case "facturare-campanii":
        return <Oferta />;
      case "facturare-istoric":
        return <IstoricFacturare />;
      case "istoric-incasari":
        return <IstoricIncasari />;
      case "incasari":
        return <Incasari />;
      case "catalog-piese":
        return <Piesa />;
      case "catalog-manopera":
        return <Manopera />;
      case "catalog-kituri":
        return <Kituri />;
      case "notificari":
        return <Notificare onNavigate={setPaginaCurenta} />;

      default:
        return (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-125 max-w-4xl mx-auto mt-10">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Dashboard</h2>
            <p className="mt-4 text-slate-500 text-xl font-medium">Selectează un modul din meniul lateral pentru a începe.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar setPagina={setPaginaCurenta} paginaCurenta={paginaCurenta} />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-400 mx-auto">
          <div key={paginaCurenta} className="page-transition-enter">
            {randeazaPagina()}
          </div>
        </div>
      </main>
    </div>
  );
}
