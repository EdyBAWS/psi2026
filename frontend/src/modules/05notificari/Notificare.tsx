import { useState, useEffect } from 'react';

type TipNotificare = 'Info' | 'Avertizare' | 'Succes';

interface NotificareItem {
  id: number;
  data: string;
  ora: string;
  mesaj: string;
  tip: TipNotificare;
  citit: boolean;
  arhivata: boolean;
  // --- ELEMENTE NOI PENTRU ARHITECTURA SISTEMULUI (PSI) ---
  sursaModul?: string; // De unde a plecat informația
  textActiune?: string; // Textul de pe buton
  linkActiune?: string; // Unde te trimite
}

// Date de test adaptate pentru un sistem ERP integrat
const DATE_INITIALE: NotificareItem[] = [
  { 
    id: 1, 
    data: 'Azi', 
    ora: '10:30', 
    mesaj: 'Factura F-2026-001 a depășit scadența cu 5 zile. Este necesară contactarea clientului (SC Auto Fleet SRL).', 
    tip: 'Avertizare', 
    citit: false, 
    arhivata: false,
    sursaModul: 'Facturare',
    textActiune: 'Mergi la Încasări',
    linkActiune: '/incasari' 
  },
  { 
    id: 2, 
    data: 'Azi', 
    ora: '09:15', 
    mesaj: 'Dosarul de daună DAUNA-002 a fost aprobat de asigurător. Se poate începe comanda de piese.', 
    tip: 'Info', 
    citit: false, 
    arhivata: false,
    sursaModul: 'Operațional',
    textActiune: 'Deschide Dosar',
    linkActiune: '/operational/daune'
  },
  { 
    id: 3, 
    data: 'Ieri', 
    ora: '16:45', 
    mesaj: 'Stoc critic: Ulei Motor 5W30 a scăzut sub limita minimă (2 litri rămași).', 
    tip: 'Avertizare', 
    citit: true, 
    arhivata: false,
    sursaModul: 'Gestiune Stocuri'
  },
  { 
    id: 4, 
    data: '24 Martie', 
    ora: '11:00', 
    mesaj: 'Tranzacția de 1500 RON pentru clientul Ion Popescu a fost reconciliată automat.', 
    tip: 'Succes', 
    citit: true, 
    arhivata: false,
    sursaModul: 'Încasări'
  },
];

export default function Notificare() {
  const [filtru, setFiltru] = useState<'Toate' | TipNotificare | 'Arhiva'>('Toate');
  
  const [notificari, setNotificari] = useState<NotificareItem[]>(() => {
    const salvate = localStorage.getItem('notificari_app_v2');
    if (salvate) return JSON.parse(salvate);
    return DATE_INITIALE;
  });

  useEffect(() => {
    localStorage.setItem('notificari_app_v2', JSON.stringify(notificari));
  }, [notificari]);

  // --- ACTIONS ---
  const toggleCitit = (id: number) => {
    setNotificari(prev => prev.map(n => n.id === id ? { ...n, citit: !n.citit } : n));
  };

  const arhiveazaNotificare = (id: number) => {
    setNotificari(prev => prev.map(n => n.id === id ? { ...n, arhivata: true } : n));
  };

  const restaureazaNotificare = (id: number) => {
    setNotificari(prev => prev.map(n => n.id === id ? { ...n, arhivata: false } : n));
  };

  const stergeDefinitiv = (id: number) => {
    if(window.confirm("Ești sigur că vrei să ștergi definitiv această notificare?")) {
        setNotificari(prev => prev.filter(n => n.id !== id));
    }
  };

  const marcheazaToateCitite = () => {
    setNotificari(prev => prev.map(n => n.arhivata ? n : { ...n, citit: true }));
  };

  const arhiveazaCititele = () => {
    setNotificari(prev => prev.map(n => (n.citit && !n.arhivata) ? { ...n, arhivata: true } : n));
  };

  const golesteArhiva = () => {
      if(window.confirm("Ștergi DEFINITIV toate notificările din arhivă? Acțiunea este ireversibilă.")) {
          setNotificari(prev => prev.filter(n => !n.arhivata));
      }
  };

  const handleActionClick = (link: string | undefined) => {
    alert(`Redirecționare logică către modulul aferent [Ruta simulată: ${link}]`);
  };

  // --- FILTRARE LOGICĂ ---
  const notificariFiltrate = notificari.filter(n => {
    if (filtru === 'Arhiva') return n.arhivata;
    if (n.arhivata) return false;
    if (filtru === 'Toate') return true;
    return n.tip === filtru;
  });

  const necititeCount = notificari.filter(n => !n.citit && !n.arhivata).length;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3.5 rounded-2xl">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Centru Notificări</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {necititeCount > 0 ? `Ai ${necititeCount} mesaje noi necitite generate de sistem.` : 'Sistemul este la zi cu toate alertele.'}
              </p>
            </div>
          </div>
          
          {/* Quick Actions Generale */}
          <div className="flex flex-wrap gap-3">
             {necititeCount > 0 && (
                <button onClick={marcheazaToateCitite} className="text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
                  Marchează toate ca citite
                </button>
             )}
             {notificari.some(n => n.citit && !n.arhivata) && filtru !== 'Arhiva' && (
                <button onClick={arhiveazaCititele} className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 transition-colors">
                  Arhivează cele citite
                </button>
             )}
             {filtru === 'Arhiva' && notificari.some(n => n.arhivata) && (
                <button onClick={golesteArhiva} className="text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors">
                  Golește Arhiva (Definitiv)
                </button>
             )}
          </div>
        </div>

        {/* Tab-uri Filtrare */}
        <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-2xl w-fit">
          {(['Toate', 'Avertizare', 'Info', 'Succes', 'Arhiva'] as const).map(f => {
            const countNecitite = notificari.filter(n => n.tip === f && !n.citit && !n.arhivata).length;
            return (
              <button key={f} onClick={() => setFiltru(f)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${filtru === f ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                {f === 'Arhiva' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
                {f}
                {f !== 'Arhiva' && f !== 'Toate' && countNecitite > 0 && (
                  <span className="bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px]">
                      {countNecitite}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Listă Notificări */}
      <div className="divide-y divide-slate-100 min-h-100 bg-slate-50/30">
        {notificariFiltrate.length > 0 ? (
          notificariFiltrate.map(n => {
            const isAlert = n.tip === 'Avertizare';
            const isSuccess = n.tip === 'Succes';
            const iconBg = n.arhivata ? 'bg-slate-200 text-slate-500' : isAlert ? 'bg-amber-100 text-amber-600' : isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600';
            
            return (
              <div key={n.id} className={`p-6 flex flex-col sm:flex-row items-start gap-5 transition-all duration-300 relative group ${n.citit || n.arhivata ? 'opacity-80 hover:opacity-100 bg-white' : 'bg-white shadow-[inset_4px_0_0_0_#4f46e5]'}`}>
                
                {/* Punct Pulsatoriu pt Necitit */}
                {!n.citit && !n.arhivata && (
                  <span className="absolute top-8 right-6 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                  </span>
                )}

                {/* Icon */}
                <div className={`p-3 rounded-full shrink-0 mt-1 hidden sm:block ${iconBg}`}>
                  {n.arhivata ? (
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  ) : isAlert ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  ) : isSuccess ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                </div>
                
                {/* Conținut Principal */}
                <div className="flex-1 w-full pr-0 sm:pr-6">
                  
                  {/* Sursa Modulului */}
                  <div className="flex items-center gap-2 mb-2">
                    {n.sursaModul && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-slate-200 text-slate-500 bg-slate-50">
                            Sursă: {n.sursaModul}
                        </span>
                    )}
                    <span className="text-xs font-bold text-slate-500">{n.data}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-xs font-medium text-slate-400">{n.ora}</span>
                  </div>

                  <p className={`text-base leading-relaxed ${n.citit || n.arhivata ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'}`}>
                    {n.mesaj}
                  </p>
                  
                  {/* Zona de Acțiuni (Butoane) */}
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    
                    {/* Butonul Smart de Acțiune */}
                    {n.textActiune && !n.arhivata && (
                        <button 
                          onClick={() => handleActionClick(n.linkActiune)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm w-fit"
                        >
                          {n.textActiune}
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    )}

                    {/* Opțiuni Administrare */}
                    <div className="flex items-center gap-4 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.arhivata ? (
                          <>
                            <button onClick={() => toggleCitit(n.id)} className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                              {n.citit ? 'Marchează ca necitit' : 'Marchează ca citit'}
                            </button>
                            <button onClick={() => arhiveazaNotificare(n.id)} className="text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors">
                              Arhivează
                            </button>
                          </>
                      ) : (
                          <>
                            <button onClick={() => restaureazaNotificare(n.id)} className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                              Restaurează din Arhivă
                            </button>
                            <button onClick={() => stergeDefinitiv(n.id)} className="text-xs font-bold text-rose-400 hover:text-rose-600 transition-colors">
                              Șterge Definitiv
                            </button>
                          </>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
               {filtru === 'Arhiva' ? 'Arhiva este goală' : 'Nicio notificare găsită'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
               {filtru === 'Arhiva' ? 'Aici vor apărea notificările pe care decizi să le ascunzi din fluxul principal.' : 'Sistemul nu a înregistrat niciun eveniment care să necesite atenția ta în această categorie.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}