import { useState } from 'react';
import {
  Bell,
  ChevronDown,
  FileText,
  Package2,
  Settings2,
  Users,
  Wallet,
} from 'lucide-react';
import { cn } from '../lib/cn';

// Sidebar-ul este meniul lateral global al aplicației.
// El nu randă paginile propriu-zise și nu folosește router.
// Rolul lui este doar să grupeze intrările din meniu și să anunțe `App.tsx`
// ce id de pagină a fost selectat.
interface SidebarProps {
  setPagina: (pagina: string) => void;
  paginaCurenta: string;
}

export default function Sidebar({ setPagina, paginaCurenta }: SidebarProps) {
  // Păstrăm local doar ce secțiuni sunt deschise/închise.
  // Pagina activă rămâne controlată de componenta părinte (`App`).
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
      icon: Package2,
      subItems: [
        { id: 'catalog-piese', label: 'Piese Auto' },
        { id: 'catalog-manopera', label: 'Manoperă' },
      ],
    },
    {
      titlu: 'Entități',
      icon: Users,
      subItems: [
        { id: 'entitati-clienti', label: 'Clienți' },
        { id: 'entitati-angajati', label: 'Angajați' },
        { id: 'entitati-asiguratori', label: 'Asigurători' },
      ],
    },
    {
      titlu: 'Operațional',
      icon: Settings2,
      subItems: [
        // Cele două intrări sunt separate intenționat.
        // Astfel, recepția și gestiunea comenzilor sunt două ecrane distincte,
        // nu două tab-uri din aceeași pagină.
        { id: 'operational-preluare', label: 'Preluare Auto' },
        { id: 'operational-comenzi', label: 'Gestiune Comenzi' },
      ],
    },
    {
      titlu: 'Facturare',
      icon: FileText,
      subItems: [
        { id: 'facturare-comenzi', label: 'Comenzi (Emitere)' },
        { id: 'facturare-campanii', label: 'Campanii / Oferte' },
        { id: 'facturare-penalizari', label: 'Penalizări Întârziere' },
      ],
    },
    {
      titlu: 'Încasări',
      icon: Wallet,
      subItems: [
        { id: 'incasari', label: 'Registru Încasări' },
      ],
    },
  ];

  return (
    <div className="w-72 bg-slate-900 flex flex-col shadow-2xl z-10 border-r border-slate-800">
      <div className="p-8 border-b border-slate-800/60">
        <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-300">
          Service Auto G
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wider uppercase">Sistem Creanțe</p>
      </div>

      {/* Ascundem scrollbar-ul pentru un aspect mai curat, dar păstrăm scroll-ul funcțional. */}
      <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {categorii.map((categorie) => {
          const isDeschis = meniuriDeschise.includes(categorie.titlu);
          const hasActiveChild = categorie.subItems.some(item => item.id === paginaCurenta);
          const Icon = categorie.icon;

          return (
            <div key={categorie.titlu} className="space-y-1">
              <button
                onClick={() => toggleMeniu(categorie.titlu)}
                className={cn(
                  'w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                  isDeschis || hasActiveChild
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
                )}
              >
                <div className="flex items-center">
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      isDeschis || hasActiveChild ? 'text-indigo-400' : 'text-slate-500',
                    )}
                  />
                  {categorie.titlu}
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    isDeschis && 'rotate-180',
                  )}
                />
              </button>

              {isDeschis && (
                <div className="pl-11 pr-2 py-1 space-y-1">
                  {categorie.subItems.map((item) => (
                    <button
                      key={item.id}
                      // Click-ul trimite mai departe id-ul paginii.
                      // `App.tsx` decide apoi ce componentă se afișează în zona principală.
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

        {/* Notificările sunt o intrare singulară, nu o categorie expandabilă. */}
        <button
          onClick={() => setPagina('notificari')}
          className={cn(
            'mt-4 flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all',
            paginaCurenta === 'notificari'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
          )}
        >
          <Bell
            className={cn(
              'mr-3 h-5 w-5',
              paginaCurenta === 'notificari' ? 'text-indigo-200' : 'text-slate-500',
            )}
          />
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
