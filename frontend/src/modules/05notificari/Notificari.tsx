// src/modules/05notificari/Notificare.tsx
import { Bell, CheckCheck, Archive, TriangleAlert } from 'lucide-react';
import { Button } from '../../componente/ui/Button';
import { ConfirmDialog } from '../../componente/ui/ConfirmDialog';
import { EmptyState } from '../../componente/ui/EmptyState';
import { PageHeader } from '../../componente/ui/PageHeader';
import { StatCard } from '../../componente/ui/StatCard';
import { useNotificari, type TipNotificare } from './useNotificari';

interface NotificareProps {
  onNavigate?: (pagina: string) => void;
}

export default function Notificare({ onNavigate }: NotificareProps) {
  const {
    loading, notificari, notificariFiltrate,
    filtru, setFiltru, confirmState, setConfirmState,
    necititeCount, arhivateCount, avertizariCount,
    toggleCitit, arhiveazaNotificare, restaureazaNotificare,
    marcheazaToateCitite, arhiveazaCititele, handleConfirm, handleActionClick
  } = useNotificari(onNavigate);

  const getBadgeColor = (tip: TipNotificare) => {
    switch (tip) {
      case 'Avertizare': return 'text-amber-500';
      case 'Succes': return 'text-emerald-500';
      default: return 'text-indigo-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        Se încarcă notificările...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <PageHeader
          title="Centru Notificări"
          description={
            necititeCount > 0
              ? `Ai ${necititeCount} notificări noi generate din fluxurile reale ale aplicației.`
              : 'Toate notificările active au fost deja verificate.'
          }
          actions={
            <div className="flex gap-2">
              {necititeCount > 0 && (
                <Button variant="secondary" onClick={marcheazaToateCitite}>
                  Marchează toate ca citite
                </Button>
              )}
              {notificari.some((n) => n.citit && !n.arhivata) && filtru !== 'Arhiva' && (
                <Button variant="outline" onClick={arhiveazaCititele}>
                  Arhivează cele citite
                </Button>
              )}
              {filtru === 'Arhiva' && arhivateCount > 0 && (
                <Button variant="outline" onClick={() => setConfirmState({ action: 'clear-archive' })}>
                  Golește arhiva
                </Button>
              )}
            </div>
          }
        />
        <div className="flex flex-wrap gap-4 mt-2">
          <StatCard label="Necitite" value={necititeCount} icon={<CheckCheck className="h-4 w-4" />} />
          <StatCard label="Avertizări active" value={avertizariCount} tone="warning" icon={<TriangleAlert className="h-4 w-4" />} />
          <StatCard label="Arhivate" value={arhivateCount} tone="info" icon={<Archive className="h-4 w-4" />} />
        </div>
      </div>

      {/* ── TOOLBAR / FILTRE ────────────────────────────────────────────────── */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-2 items-center">
        {(['Toate', 'Avertizare', 'Info', 'Succes', 'Arhiva'] as const).map((valoareFiltru) => {
          const countNecitite = notificari.filter(
            (n) => n.tip === valoareFiltru && !n.citit && !n.arhivata
          ).length;

          return (
            <button
              key={valoareFiltru}
              onClick={() => setFiltru(valoareFiltru)}
              className={`px-3 py-1.5 rounded-md text-[13px] font-bold transition-all duration-200 flex items-center gap-1.5 ${
                filtru === valoareFiltru
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 border border-transparent'
              }`}
            >
              {valoareFiltru}
              {valoareFiltru !== 'Arhiva' && valoareFiltru !== 'Toate' && countNecitite > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] text-white">
                  {countNecitite}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── LISTA NOTIFICĂRI ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {notificariFiltrate.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notificariFiltrate.map((notificare) => {
              const esteNoua = !notificare.citit && !notificare.arhivata;

              return (
                <div
                  key={notificare.id}
                  className={`flex gap-4 p-5 transition-colors group ${
                    esteNoua ? 'bg-indigo-50/30' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="mt-0.5 relative">
                    <Bell className={`h-5 w-5 ${getBadgeColor(notificare.tip)} ${!esteNoua && 'opacity-60'}`} />
                    {esteNoua && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-500" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-500">{notificare.data}</span>
                      {notificare.sursaModul && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {notificare.sursaModul}
                          </span>
                        </>
                      )}
                    </div>

                    <p className={`text-[13px] ${esteNoua ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                      {notificare.mesaj}
                    </p>

                    <div className={`mt-3 flex flex-wrap items-center gap-2 transition-opacity ${esteNoua ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {notificare.textActiune && !notificare.arhivata && (
                        <Button variant="secondary" size="sm" onClick={() => handleActionClick(notificare)}>
                          {notificare.textActiune}
                        </Button>
                      )}

                      {!notificare.arhivata ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => toggleCitit(notificare.id)}>
                            {notificare.citit ? 'Marchează necitit' : 'Marchează citit'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => arhiveazaNotificare(notificare.id)} className="text-amber-600 hover:bg-amber-50">
                            Arhivează
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => restaureazaNotificare(notificare.id)} className="text-emerald-600 hover:bg-emerald-50">
                            Restaurează
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setConfirmState({ action: 'delete-one', id: notificare.id })} className="text-rose-500 hover:bg-rose-50">
                            Șterge definitiv
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16">
            <EmptyState
              icon={<Bell className="h-5 w-5" />}
              title={filtru === 'Arhiva' ? 'Arhiva este goală' : 'Nicio notificare'}
              description="Sistemul nu a generat notificări în această categorie."
            />
          </div>
        )}
      </div>

      {/* ── DIALOG CONFIRMARE ───────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmState !== null}
        title={confirmState?.action === 'clear-archive' ? 'Ștergi arhiva?' : 'Ștergi notificarea?'}
        description={
          confirmState?.action === 'clear-archive'
            ? 'Toate notificările arhivate vor fi șterse definitiv.'
            : 'Notificarea va fi ștearsă definitiv.'
        }
        confirmLabel={confirmState?.action === 'clear-archive' ? 'Golește arhiva' : 'Șterge definitiv'}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
