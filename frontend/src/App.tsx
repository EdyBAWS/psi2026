import { useState } from 'react';
import Sidebar from './componente/Sidebar';
import Operational from './modules/02operational/Operational';
import Facturare from './modules/03facturare/Facturare';
import Incasari from './modules/04incasari/Incasari';
import Penalizare from './modules/03facturare/penalizari/Penalizare';
import Oferta from './modules/03facturare/oferte/Oferta';
// Am adăugat importurile pentru cataloagele lui Edy
import Piesa from './modules/00catalog/piese/Piesa';
import Manopera from './modules/00catalog/manopera/Manopera';

export default function App() {
  const [paginaCurenta, setPaginaCurenta] = useState<string>('facturare');

  const randeazaPagina = () => {
    switch (paginaCurenta) {
      case 'operational':
        return <Operational />;
      case 'facturare':
        return <Facturare />;
      case 'incasari':
        return <Incasari />;
      case 'penalizari':
        return <Penalizare />;
      case 'oferte':
        return <Oferta />;
      // Rutele noi pentru cataloage
      case 'catalog-piese':
        return <Piesa />;
      case 'catalog-manopera':
        return <Manopera />;
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