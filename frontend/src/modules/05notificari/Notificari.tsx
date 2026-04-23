// src/modules/05notificari/Notificare.tsx
import { Bell, CheckCheck, Archive, TriangleAlert } from 'lucide-react';
import { ConfirmDialog } from '../../componente/ui/ConfirmDialog';
import { EmptyState } from '../../componente/ui/EmptyState';
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
      case 'Avertizare': return 'border-amber-200 bg-amber-100 text-amber-700';
      case 'Succes': return 'border-emerald-200 bg-emerald-100 text-emerald-700';
      default: return 'border-blue-200 bg-blue-100 text-blue-700';
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Se încarcă notificările...</div>;

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-100 bg-white font-sans shadow-sm">
      <div className="border-b border-slate-100 p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-indigo-100 p-3.5 text-indigo-600">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Centru Notificări</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {necititeCount > 0
                  ? `Ai ${necititeCount} notificări noi generate din fluxurile demo comune.`
                  : 'Toate notificările active au fost deja verificate.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {necititeCount > 0 ? (
              <button
                onClick={marcheazaToateCitite}
                className="rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                Marchează toate ca citite
              </button>
            ) : null}
            {notificari.some((notificare) => notificare.citit && !notificare.arhivata) && filtru !== 'Arhiva' ? (
              <button
                onClick={arhiveazaCititele}
                className="px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:text-slate-800"
              >
                Arhivează cele citite
              </button>
            ) : null}
            {filtru === 'Arhiva' && arhivateCount > 0 ? (
              <button
                onClick={() => setConfirmState({ action: 'clear-archive' })}
                className="rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100"
              >
                Golește arhiva
              </button>
            ) : null}
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <StatCard label="Necitite" value={necititeCount} icon={<CheckCheck className="h-4 w-4" />} />
          <StatCard label="Avertizări active" value={avertizariCount} tone="warning" icon={<TriangleAlert className="h-4 w-4" />} />
          <StatCard label="Arhivate" value={arhivateCount} tone="info" icon={<Archive className="h-4 w-4" />} />
        </div>

        <div className="flex w-fit flex-wrap gap-2 rounded-2xl bg-slate-50 p-1.5">
          {(['Toate', 'Avertizare', 'Info', 'Succes', 'Arhiva'] as const).map((valoareFiltru) => {
            const countNecitite = notificari.filter(
              (notificare) =>
                notificare.tip === valoareFiltru && !notificare.citit && !notificare.arhivata,
            ).length;

            return (
              <button
                key={valoareFiltru}
                onClick={() => setFiltru(valoareFiltru)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 ${
                  filtru === valoareFiltru
                    ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {valoareFiltru}
                {valoareFiltru !== 'Arhiva' && valoareFiltru !== 'Toate' && countNecitite > 0 ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] text-white">
                    {countNecitite}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[400px] divide-y divide-slate-100 bg-slate-50/30">
        {notificariFiltrate.length > 0 ? (
          notificariFiltrate.map((notificare) => {
            const accentClass =
              notificare.citit || notificare.arhivata
                ? 'bg-white opacity-90'
                : 'bg-white shadow-[inset_4px_0_0_0_#4f46e5]';

            return (
              <div
                key={notificare.id}
                className={`relative flex flex-col gap-5 p-6 transition-all duration-300 sm:flex-row sm:items-start ${accentClass}`}
              >
                {!notificare.citit && !notificare.arhivata ? (
                  <span className="absolute right-6 top-8 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  </span>
                ) : null}

                <div className={`mt-1 hidden rounded-full p-3 sm:block ${getBadgeColor(notificare.tip)}`}>
                  <Bell className="h-5 w-5" />
                </div>

                <div className="w-full flex-1 sm:pr-6">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {notificare.sursaModul ? (
                      <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Sursă: {notificare.sursaModul}
                      </span>
                    ) : null}
                    <span className="text-xs font-bold text-slate-500">{notificare.data}</span>
                    {notificare.ora ? (
                      <>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-xs font-medium text-slate-400">{notificare.ora}</span>
                      </>
                    ) : null}
                  </div>

                  <p
                    className={`text-base leading-relaxed ${
                      notificare.citit || notificare.arhivata
                        ? 'font-medium text-slate-600'
                        : 'font-bold text-slate-900'
                    }`}
                  >
                    {notificare.mesaj}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {notificare.textActiune && !notificare.arhivata ? (
                      <button
                        onClick={() => handleActionClick(notificare)}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
                      >
                        {notificare.textActiune}
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : null}

                    {!notificare.arhivata ? (
                      <>
                        <button
                          onClick={() => toggleCitit(notificare.id)}
                          className="text-xs font-bold text-slate-500 transition-colors hover:text-indigo-600"
                        >
                          {notificare.citit ? 'Marchează ca necitit' : 'Marchează ca citit'}
                        </button>
                        <button
                          onClick={() => arhiveazaNotificare(notificare.id)}
                          className="text-xs font-bold text-slate-500 transition-colors hover:text-amber-600"
                        >
                          Arhivează
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => restaureazaNotificare(notificare.id)}
                          className="text-xs font-bold text-slate-500 transition-colors hover:text-emerald-600"
                        >
                          Restaurează din arhivă
                        </button>
                        <button
                          onClick={() => setConfirmState({ action: 'delete-one', id: notificare.id })}
                          className="text-xs font-bold text-rose-400 transition-colors hover:text-rose-600"
                        >
                          Șterge definitiv
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-24">
            <EmptyState
              title={filtru === 'Arhiva' ? 'Arhiva este goală' : 'Nicio notificare găsită'}
              description={
                filtru === 'Arhiva'
                  ? 'Aici vor apărea notificările pe care alegi să le scoți din fluxul principal.'
                  : 'Sistemul nu a generat notificări în această categorie pentru setul comun de demo.'
              }
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmState !== null}
        title={confirmState?.action === 'clear-archive' ? 'Ștergi arhiva?' : 'Ștergi notificarea?'}
        description={
          confirmState?.action === 'clear-archive'
            ? 'Toate notificările arhivate vor fi șterse definitiv din sesiunea curentă.'
            : 'Notificarea arhivată va fi ștearsă definitiv din sesiunea curentă.'
        }
        confirmLabel={confirmState?.action === 'clear-archive' ? 'Golește arhiva' : 'Șterge definitiv'}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}