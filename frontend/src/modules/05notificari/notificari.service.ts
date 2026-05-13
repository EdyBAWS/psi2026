// src/modules/05notificari/notificari.service.ts
import { apiJson } from '../../lib/api';
import type { NotificareMock } from '../../mock/types';
import type { NotificareMapareUI } from './useNotificari';

const mapNotificare = (notificare: any): NotificareMock => ({
  id: notificare.idNotificare,
  data: new Date(notificare.data).toLocaleDateString('ro-RO'),
  ora: new Date(notificare.data).toLocaleTimeString('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
  }),
  mesaj: notificare.mesaj,
  paginaDestinatie: notificare.paginaDestinatie,
  sursaModul: notificare.sursaModul,
  textActiune: notificare.textActiune,
  tip: notificare.tip,
  citit: notificare.citit,
  arhivata: notificare.arhivata,
  stearsa: notificare.stearsa,
  metadata: notificare.metadata,
});

export const NotificariService = {
  async fetchNotificari(): Promise<NotificareMock[]> {
    const data = await apiJson<any[]>('/notificari');
    return data.map(mapNotificare);
  },
  
  async syncStariNotificari(stari: NotificareMapareUI) {
    await Promise.all(
      Object.entries(stari).map(([id, stare]) =>
        apiJson(`/notificari/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(stare),
        }).catch(() => null),
      ),
    );

    return { success: true };
  },

  async stergeNotificare(id: number) {
    return apiJson(`/notificari/${id}`, { method: 'DELETE' });
  },
};
