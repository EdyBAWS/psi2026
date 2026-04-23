// src/modules/05notificari/useNotificari.ts
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { usePageSessionState } from '../../lib/pageState';
import { NotificariService } from './notificari.service';
import type { NotificareMock } from '../../mock/types';

export type TipNotificare = NotificareMock['tip'];
export type FiltruNotificari = 'Toate' | TipNotificare | 'Arhiva';

export interface NotificareStareUI {
  arhivata: boolean;
  citit: boolean;
  stearsa: boolean;
}

export type NotificareMapareUI = Record<number, NotificareStareUI>;

export interface ConfirmState {
  action: 'clear-archive' | 'delete-one';
  id?: number;
}

const STORAGE_KEY = 'notificari-ui-v3';

export function stareInitiala(notificare: NotificareMock): NotificareStareUI {
  return {
    arhivata: false,
    citit: notificare.tip === 'Succes',
    stearsa: false,
  };
}

export function useNotificari(onNavigate?: (pagina: string) => void) {
  const [loading, setLoading] = useState(true);
  const [notificariBD, setNotificariBD] = useState<NotificareMock[]>([]);
  
  const [filtru, setFiltru] = usePageSessionState<FiltruNotificari>('notificari-filtru', 'Toate');
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const [stariUI, setStariUI] = useState<NotificareMapareUI>(() => {
    if (typeof window === 'undefined') return {};
    const salvate = window.localStorage.getItem(STORAGE_KEY);
    if (!salvate) return {};
    try {
      return JSON.parse(salvate) as NotificareMapareUI;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    NotificariService.fetchNotificari().then((data) => {
      setNotificariBD(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stariUI));
    // Sincronizare fake cu backendul
    NotificariService.syncStariNotificari(stariUI);
  }, [stariUI]);

  const notificari = useMemo(() => {
    return notificariBD
      .map((notificare) => ({
        ...notificare,
        ...stareInitiala(notificare),
        ...(stariUI[notificare.id] ?? {}),
      }))
      .filter((notificare) => !notificare.stearsa);
  }, [notificariBD, stariUI]);

  const notificariFiltrate = useMemo(() => {
    return notificari.filter((notificare) => {
      if (filtru === 'Arhiva') return notificare.arhivata;
      if (notificare.arhivata) return false;
      if (filtru === 'Toate') return true;
      return notificare.tip === filtru;
    });
  }, [filtru, notificari]);

  const necititeCount = notificari.filter((n) => !n.citit && !n.arhivata).length;
  const arhivateCount = notificari.filter((n) => n.arhivata).length;
  const avertizariCount = notificari.filter((n) => n.tip === 'Avertizare' && !n.arhivata).length;

  const actualizeazaNotificare = (id: number, modificari: Partial<NotificareStareUI>) => {
    const notificareBaza = notificariBD.find((item) => item.id === id);
    setStariUI((previous) => ({
      ...previous,
      [id]: {
        ...(previous[id] ?? (notificareBaza ? stareInitiala(notificareBaza) : { arhivata: false, citit: false, stearsa: false })),
        ...modificari,
      },
    }));
  };

  const toggleCitit = (id: number) => {
    const notificare = notificari.find((item) => item.id === id);
    if (!notificare) return;
    actualizeazaNotificare(id, { citit: !notificare.citit });
  };

  const arhiveazaNotificare = (id: number) => {
    actualizeazaNotificare(id, { arhivata: true, citit: true });
    toast.success('Notificarea a fost mutată în arhivă.');
  };

  const restaureazaNotificare = (id: number) => {
    actualizeazaNotificare(id, { arhivata: false });
    toast.success('Notificarea a fost restaurată în fluxul principal.');
  };

  const marcheazaToateCitite = () => {
    const updates = notificari.reduce<NotificareMapareUI>((acc, notificare) => {
      if (notificare.arhivata) return acc;
      acc[notificare.id] = { arhivata: notificare.arhivata, citit: true, stearsa: false };
      return acc;
    }, {});
    setStariUI((previous) => ({ ...previous, ...updates }));
    toast.success('Toate notificările active au fost marcate ca citite.');
  };

  const arhiveazaCititele = () => {
    const updates = notificari.reduce<NotificareMapareUI>((acc, notificare) => {
      if (!notificare.citit || notificare.arhivata) return acc;
      acc[notificare.id] = { arhivata: true, citit: true, stearsa: false };
      return acc;
    }, {});
    setStariUI((previous) => ({ ...previous, ...updates }));
    toast.success('Notificările deja citite au fost arhivate.');
  };

  const handleConfirm = () => {
    if (!confirmState) return;

    if (confirmState.action === 'delete-one' && confirmState.id !== undefined) {
      actualizeazaNotificare(confirmState.id, { stearsa: true });
      toast.success('Notificarea a fost ștearsă definitiv.');
    }

    if (confirmState.action === 'clear-archive') {
      const updates = notificari.reduce<NotificareMapareUI>((acc, notificare) => {
        if (!notificare.arhivata) return acc;
        acc[notificare.id] = { arhivata: true, citit: true, stearsa: true };
        return acc;
      }, {});
      setStariUI((previous) => ({ ...previous, ...updates }));
      toast.success('Arhiva a fost golită.');
    }
    setConfirmState(null);
  };

  const handleActionClick = (notificare: NotificareMock) => {
    if (!notificare.paginaDestinatie) return;
    actualizeazaNotificare(notificare.id, { citit: true });
    if (onNavigate) {
      onNavigate(notificare.paginaDestinatie);
      return;
    }
    toast.info('Navigarea nu este disponibilă în acest context.');
  };

  return {
    loading, notificari, notificariFiltrate,
    filtru, setFiltru, confirmState, setConfirmState,
    necititeCount, arhivateCount, avertizariCount,
    toggleCitit, arhiveazaNotificare, restaureazaNotificare,
    marcheazaToateCitite, arhiveazaCititele, handleConfirm, handleActionClick
  };
}