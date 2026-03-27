// `App.tsx` este "orchestratorul" principal al frontend-ului.
// Aici nu folosim React Router, ci o navigație simplă bazată pe stare:
// `paginaCurenta` păstrează ID-ul paginii active, iar `randeazaPagina`
// decide ce componentă afișăm în zona principală din dreapta.
import { useState } from 'react';
import Sidebar from './componente/Sidebar';
import Operational from './modules/02operational/Operational';
import Facturare from './modules/03facturare/Facturare';
import Incasari from './modules/04incasari/Incasari';
import Penalizare from './modules/03facturare/penalizari/Penalizare';
import Oferta from './modules/03facturare/oferte/Oferta';
import Piesa from './modules/00catalog/piese/Piesa';
import Manopera from './modules/00catalog/manopera/Manopera';

import Client from './modules/01entitati/clienti/Client';
import Angajat from './modules/01entitati/angajati/Angajat';
import Asigurator from './modules/01entitati/asiguratori/Asigurator';
import Notificare from './modules/05notificari/Notificare';

import IstoricFacturare from './modules/03facturare/IstoricFacturare';

export default function App() {
  // `paginaCurenta` joacă rolul de "router local".
  // Când Sidebar-ul apelează `setPaginaCurenta(...)`,
  // componenta se rerandează și schimbă modulul afișat.
  const [paginaCurenta, setPaginaCurenta] = useState<string>('facturare-comenzi');

  const randeazaPagina = () => {
    // `switch` este locul central în care mapăm ID-urile din Sidebar
    // la componentele reale ale aplicației.
    switch (paginaCurenta) {
      case 'entitati-clienti': return <Client />;
      case 'entitati-angajati': return <Angajat />;
      case 'entitati-asiguratori': return <Asigurator />;

      // În Operațional folosim același container de modul,
      // dar îi spunem prin prop ce ecran intern vrem să afișeze.
      case 'operational-receptie': 
        return <Operational onNavigate={setPaginaCurenta} view="preluare-auto" />;
      case 'operational-comenzi': 
        return <Operational onNavigate={setPaginaCurenta} view="gestiune-comenzi" />;

      // Modulele de facturare sunt ecrane separate,
      // chiar dacă toate stau în aceeași categorie din meniu.
      case 'facturare-comenzi': return <Facturare />;
      case 'facturare-penalizari': return <Penalizare />;
      case 'facturare-campanii': return <Oferta />;
      case 'facturare-istoric': return <IstoricFacturare />;
      
      case 'incasari': return <Incasari />;
      case 'catalog-piese': return <Piesa />;
      case 'catalog-manopera': return <Manopera />;
      case 'notificari': return <Notificare />;
      
      default:
        return (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-96">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h2>
            <p className="mt-3 text-slate-500 text-lg">Selectează un modul din meniul lateral pentru a începe lucrul.</p>
          </div>
        );
    }
  };

  return (
    // Layout-ul general are 2 coloane:
    // - stânga: Sidebar fix
    // - dreapta: conținutul paginii active
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar setPagina={setPaginaCurenta} paginaCurenta={paginaCurenta} />

      <main className="flex-1 p-10 overflow-y-scroll">
        <div className="max-w-6xl mx-auto">
          {randeazaPagina()}
        </div>
      </main>
    </div>
  );
}
