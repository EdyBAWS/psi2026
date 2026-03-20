import { useState } from 'react';
import Sidebar from './componente/Sidebar';

// Importurile modulelor tale vechi
import Facturare from './modules/03facturare/Facturare';
import Incasari from './modules/04incasari/Incasari';

// Importurile modulelor NOI (Entități)
import Client from './modules/01entitati/clienti/Client';
import Angajat from './modules/01entitati/angajati/Angajat';
import Asigurator from './modules/01entitati/asiguratori/Asigurator';

export default function App() {
  const [paginaCurenta, setPaginaCurenta] = useState<string>('dashboard');

  const randeazaPagina = () => {
    switch (paginaCurenta) {
      case 'facturare':
        return <Facturare />;
      case 'incasari':
        return <Incasari />;
      case 'clienti':
        return <Client />;
      case 'angajati':
        return <Angajat />;
      case 'asiguratori':
        return <Asigurator />;
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
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar setPagina={setPaginaCurenta} paginaCurenta={paginaCurenta} />
      
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {randeazaPagina()}
        </div>
      </main>
    </div>
  );
}