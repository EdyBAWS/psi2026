import { useState } from 'react';

interface SidebarProps {
  setPagina: (pagina: string) => void;
  paginaCurenta: string;
}

export default function Sidebar({ setPagina, paginaCurenta }: SidebarProps) {
  const [meniuriDeschise, setMeniuriDeschise] = useState<string[]>(['Catalog', 'Facturare']);

  const toggleMeniu = (numeMeniu: string) => {
    setMeniuriDeschise(prev => 
      prev.includes(numeMeniu) 
        ? prev.filter(m => m !== numeMeniu)
        : [...prev, numeMeniu]
    );
  };

  const categorii = [
    {
      titlu: 'Catalog',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
      subItems: [
        { id: 'catalog-piese', label: 'Piese Auto' },
        { id: 'catalog-manopera', label: 'Manoperă' }
      ]
    },
    {
      titlu: 'Entități',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
      subItems: [
        { id: 'entitati-clienti', label: 'Clienți' },
        { id: 'entitati-angajati', label: 'Angajați' },
        { id: 'entitati-asiguratori', label: 'Asiguratori' }
      ]
    },
    {
      titlu: 'Operațional',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3a1.5 1.5 0 00-1.42 1.02l-.3.86a1.5 1.5 0 01-.95.95l-.86.3a1.5 1.5 0 000 2.84l.86.3a1.5 1.5 0 01.95.95l.3.86a1.5 1.5 0 002.84 0l.3-.86a1.5 1.5 0 01.95-.95l.86-.3a1.5 1.5 0 000-2.84l-.86-.3a1.5 1.5 0 01-.95-.95l-.3-.86A1.5 1.5 0 009.75 3zm8.25 9.75a1.5 1.5 0 00-1.42 1.02l-.12.33a1.5 1.5 0 01-.95.95l-.33.12a1.5 1.5 0 000 2.84l.33.12a1.5 1.5 0 01.95.95l.12.33a1.5 1.5 0 002.84 0l.12-.33a1.5 1.5 0 01.95-.95l.33-.12a1.5 1.5 0 000-2.84l-.33-.12a1.5 1.5 0 01-.95-.95l-.12-.33A1.5 1.5 0 0018 12.75z" />,
      subItems: [
        { id: 'operational', label: 'Recepție & Comenzi' }
      ]
    },
    {
      titlu: 'Facturare',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      subItems: [
        { id: 'facturare-comenzi', label: 'Comenzi (Emitere)' },
        { id: 'facturare-campanii', label: 'Campanii / Oferte' },
        { id: 'facturare-penalizari', label: 'Penalizări Întârziere' },
        // L-AM ADĂUGAT AICI, ÎN PĂTRĂȚICA TA
        { id: 'facturare-istoric', label: 'Istoric Facturare' } 
      ]
    },
    {
      titlu: 'Încasări',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      subItems: [
        { id: 'incasari', label: 'Registru Încasări' }
      ]
    }
    // AM ȘTERS COMPLET CATEGORIA VECHE DE "Istoric & Audit" DE AICI DE JOS
  ];

  return (
    <div className="w-72 bg-slate-900 flex flex-col shadow-2xl z-10 border-r border-slate-800">
      <div className="p-8 border-b border-slate-800/60">
        <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-300">
          Service Auto G
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wider uppercase">Sistem Creanțe</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categorii.map((categorie) => {
          const isDeschis = meniuriDeschise.includes(categorie.titlu);
          const hasActiveChild = categorie.subItems.some(item => item.id === paginaCurenta);

          return (
            <div key={categorie.titlu} className="space-y-1">
              <button
                onClick={() => toggleMeniu(categorie.titlu)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  isDeschis || hasActiveChild ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center">
                  <svg className={`w-5 h-5 mr-3 ${isDeschis || hasActiveChild ? 'text-indigo-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {categorie.icon}
                  </svg>
                  {categorie.titlu}
                </div>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isDeschis ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDeschis && (
                <div className="pl-11 pr-2 py-1 space-y-1">
                  {categorie.subItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setPagina(item.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        paginaCurenta === item.id 
                          ? 'bg-indigo-600/10 text-indigo-400' 
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={() => setPagina('notificari')}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-semibold text-sm mt-4 ${
            paginaCurenta === 'notificari' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <svg className={`w-5 h-5 mr-3 ${paginaCurenta === 'notificari' ? 'text-indigo-200' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notificări
        </button>
      </nav>

      <div className="p-6 text-sm text-slate-500 border-t border-slate-800/60 flex items-center">
        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 mr-3 font-bold">ED</div>
        <div>
          <p className="text-slate-300 font-medium">Edy</p>
          <p className="text-xs">Administrator</p>
        </div>
      </div>
    </div>
  );
}