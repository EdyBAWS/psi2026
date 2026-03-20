interface SidebarProps {
  setPagina: (pagina: string) => void;
  paginaCurenta: string;
}

export default function Sidebar({ setPagina, paginaCurenta }: SidebarProps) {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    },
    { 
      id: 'clienti', 
      label: 'Gestiune Clienți',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    },
    { 
      id: 'angajati', 
      label: 'Gestiune Angajați',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    },
    { 
      id: 'asiguratori', 
      label: 'Societăți Asigurare',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    },
    { 
      id: 'facturare', 
      label: 'Facturare Comenzi',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    },
    { 
      id: 'incasari', 
      label: 'Registru Încasări',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    }
  ];

  return (
    <div className="w-72 bg-slate-900 flex flex-col shadow-2xl z-10 border-r border-slate-800">
      <div className="p-8 border-b border-slate-800/60">
        <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
          Service Auto G
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wider uppercase">Sistem Creanțe</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = paginaCurenta === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPagina(item.id)}
              className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600 shadow-md shadow-indigo-900/20 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <svg 
                className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300'}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                {item.icon}
              </svg>
              <span className="font-medium text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 text-sm text-slate-500 border-t border-slate-800/60 flex items-center shrink-0">
        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 mr-3 font-bold">ED</div>
        <div>
          <p className="text-slate-300 font-medium">Edy</p>
          <p className="text-xs">Administrator</p>
        </div>
      </div>
    </div>
  );
}