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
      isDropdown: true,
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
      subItems: [
        { id: 'catalog-piese', label: 'Piese Auto' },
        { id: 'catalog-manopera', label: 'Manoperă' }
      ]
    },
    {
      titlu: 'Angajați',
      isDropdown: false,
      id: 'entitati-angajati',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    },
    {
      titlu: 'Clienți',
      isDropdown: false,
      id: 'entitati-clienti',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    },
    {
      titlu: 'Asiguratori',
      isDropdown: false,
      id: 'entitati-asiguratori',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    },
    {
      titlu: 'Operațional',
      isDropdown: true,
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
      subItems: [
        { id: 'operational-receptie', label: 'Recepție' },
        { id: 'operational-comenzi', label: 'Comenzi' }
      ]
    },
    {
      titlu: 'Facturare',
      isDropdown: true,
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      subItems: [
        { id: 'facturare-comenzi', label: 'Comenzi Finalizate' },
        { id: 'facturare-campanii', label: 'Campanii / Oferte' },
        { id: 'facturare-penalizari', label: 'Penalizări Întârziere' },
        { id: 'facturare-istoric', label: 'Istoric Facturare' } 
      ]
    },
    {
      titlu: 'Încasări',
      isDropdown: true,
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      subItems: [
        { id: 'incasari', label: 'Registru Încasări' }
      ]
    }
  ];

  return (
    <div className="w-72 bg-slate-900 flex flex-col shadow-2xl z-10 border-r border-slate-800 h-screen">
      <div className="p-8 border-b border-slate-800/60 shrink-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-300">
          Service Auto G
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wider uppercase">Sistem Creanțe</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categorii.map((categorie) => {
          
          if (categorie.isDropdown) {
            const isDeschis = meniuriDeschise.includes(categorie.titlu);
            const hasActiveChild = categorie.subItems?.some(item => item.id === paginaCurenta);

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
                    {categorie.subItems?.map((item) => (
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
          }

          // Randare pentru categoriile fara dropdown (Angajati, Clienti, Asiguratori)
          return (
            <button
              key={categorie.titlu}
              onClick={() => setPagina(categorie.id!)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                paginaCurenta === categorie.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <svg className={`w-5 h-5 mr-3 ${paginaCurenta === categorie.id ? 'text-indigo-200' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {categorie.icon}
              </svg>
              {categorie.titlu}
            </button>
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

      <div className="p-6 text-sm text-slate-500 border-t border-slate-800/60 shrink-0 flex items-center">
        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 mr-3 font-bold">ED</div>
        <div>
          <p className="text-slate-300 font-medium">Edy</p>
          <p className="text-xs">Administrator</p>
        </div>
      </div>
    </div>
  );
}