import { useState } from 'react';
import Sidebar from './componente/Sidebar';
import Operational from './modules/02operational/Operational';
import { mockComenzi } from './modules/02operational/mockData';
import Facturare from './modules/03facturare/Facturare';
import Incasari from './modules/04incasari/Incasari';
import Penalizare from './modules/03facturare/penalizari/Penalizare';
import Oferta from './modules/03facturare/oferte/Oferta';
import Piesa from './modules/00catalog/piese/Piesa';
import Manopera from './modules/00catalog/manopera/Manopera';

// Noile importuri
import Client from './modules/01entitati/clienti/Client';
import Angajat from './modules/01entitati/angajati/Angajat';
import Asigurator from './modules/01entitati/asiguratori/Asigurator';
import Notificare from './modules/05notificari/Notificare';

// `App` este shell-ul principal al aplicației.
// În loc de React Router, ținem doar un `paginaCurenta` în stare locală
// și alegem manual componenta de afișat printr-un `switch`.
// Acest model este suficient pentru un MVP administrativ și este ușor de urmărit
// de către colegii care sunt la început cu React.
export default function App() {
  const [paginaCurenta, setPaginaCurenta] = useState<string>('facturare-comenzi');

  const randeazaPagina = () => {
    // Acest `switch` este "harta" aplicației.
    // Fiecare id din sidebar trebuie să existe și aici, altfel click-ul din meniu
    // nu va duce nicăieri.
    switch (paginaCurenta) {
      // Entitati
      case 'entitati-clienti': return <Client />;
      case 'entitati-angajati': return <Angajat />;
      case 'entitati-asiguratori': return <Asigurator />;
      // Operational
      case 'operational-preluare':
        return <Operational view="preluare-auto" onNavigate={setPaginaCurenta} />;
      case 'operational-comenzi':
        return <Operational view="gestiune-comenzi" onNavigate={setPaginaCurenta} />;
      // Facturare
      case 'facturare-comenzi': return <Facturare comenzi={mockComenzi} />;
      case 'facturare-penalizari': return <Penalizare />;
      case 'facturare-campanii': return <Oferta />;
      // Incasari
      case 'incasari': return <Incasari />;
      // Catalog
      case 'catalog-piese': return <Piesa />;
      case 'catalog-manopera': return <Manopera />;
      // Notificari
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
    // `return (...)` înseamnă că această funcție întoarce interfața care trebuie afișată.
    // JSX-ul dintre paranteze seamănă cu HTML, dar poate conține expresii JavaScript.
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar-ul nu știe ce pagină să afișeze.
          El doar schimbă valoarea lui `paginaCurenta` prin callback-ul primit. */}
      <Sidebar setPagina={setPaginaCurenta} paginaCurenta={paginaCurenta} />
      
      <main className="flex-1 p-10 overflow-y-scroll">
        <div className="max-w-6xl mx-auto">
          {/* Acoladele `{ ... }` în JSX înseamnă:
              "afișează aici rezultatul unei expresii JavaScript". */}
          {randeazaPagina()}
        </div>
      </main>
    </div>
  );
}
