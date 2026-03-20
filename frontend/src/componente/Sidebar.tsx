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
      id: 'operational',
      label: 'Operațional',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3a1.5 1.5 0 00-1.42 1.02l-.3.86a1.5 1.5 0 01-.95.95l-.86.3a1.5 1.5 0 000 2.84l.86.3a1.5 1.5 0 01.95.95l.3.86a1.5 1.5 0 002.84 0l.3-.86a1.5 1.5 0 01.95-.95l.86-.3a1.5 1.5 0 000-2.84l-.86-.3a1.5 1.5 0 01-.95-.95l-.3-.86A1.5 1.5 0 009.75 3zm8.25 9.75a1.5 1.5 0 00-1.42 1.02l-.12.33a1.5 1.5 0 01-.95.95l-.33.12a1.5 1.5 0 000 2.84l.33.12a1.5 1.5 0 01.95.95l.12.33a1.5 1.5 0 002.84 0l.12-.33a1.5 1.5 0 01.95-.95l.33-.12a1.5 1.5 0 000-2.84l-.33-.12a1.5 1.5 0 01-.95-.95l-.12-.33A1.5 1.5 0 0018 12.75zM4.5 15.75A2.25 2.25 0 102.25 18 2.25 2.25 0 004.5 15.75z" />
    },
    { 
      id: 'facturare', 
      label: 'Facturare Comenzi',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    },
    {
      id: 'operational',
      label: 'Operațional',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3a1.5 1.5 0 00-1.42 1.02l-.3.86a1.5 1.5 0 01-.95.95l-.86.3a1.5 1.5 0 000 2.84l.86.3a1.5 1.5 0 01.95.95l.3.86a1.5 1.5 0 002.84 0l.3-.86a1.5 1.5 0 01.95-.95l.86-.3a1.5 1.5 0 000-2.84l-.86-.3a1.5 1.5 0 01-.95-.95l-.3-.86A1.5 1.5 0 009.75 3zm8.25 9.75a1.5 1.5 0 00-1.42 1.02l-.12.33a1.5 1.5 0 01-.95.95l-.33.12a1.5 1.5 0 000 2.84l.33.12a1.5 1.5 0 01.95.95l.12.33a1.5 1.5 0 002.84 0l.12-.33a1.5 1.5 0 01.95-.95l.33-.12a1.5 1.5 0 000-2.84l-.33-.12a1.5 1.5 0 01-.95-.95l-.12-.33A1.5 1.5 0 0018 12.75zM4.5 15.75A2.25 2.25 0 102.25 18 2.25 2.25 0 004.5 15.75z" />
    },
    { 
      id: 'oferte', // Am adăugat meniul de oferte aici
      label: 'Campanii / Oferte',
      // Iconiță sub formă de cadou / pachet promoțional
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /> 
    },
    { 
      id: 'penalizari', 
      label: 'Penalizări Întârziere',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> 
    },
    { 
      id: 'oferte', 
      label: 'Campanii / Oferte',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /> 
    },
    { 
      id: 'penalizari', 
      label: 'Penalizări Întârziere',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> 
    },
    { 
      id: 'incasari', 
      label: 'Registru Încasări',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    },
    // Rute adăugate pentru modulele lui Edy (Cataloage)
    { 
      id: 'catalog-piese', 
      label: 'Catalog Piese',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    },
    { 
      id: 'catalog-manopera', 
      label: 'Catalog Manoperă',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    }
  ];

  return (
    <div className="w-72 bg-slate-900 flex flex-col shadow-2xl z-10 border-r border-slate-800">
      {/* Zona de Logo */}
      <div className="p-8 border-b border-slate-800/60">
        <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
          Service Auto G
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wider uppercase">Sistem Creanțe</p>
      </div>

      {/* Navigare */}
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
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Meniu */}
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
