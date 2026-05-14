// src/modules/05notificari/notificari.service.ts
import { apiJson } from '../../lib/api';
import { type Notificare } from '../../types/facturare';
import type { NotificareMapareUI } from './useNotificari';

const mapNotificare = (notificare: any): Notificare => ({
  id: notificare.idNotificare || notificare.id,
  data: notificare.data || notificare.createdAt,
  mesaj: notificare.mesaj,
  tip: notificare.tip || 'Info',
  citit: notificare.citit,
  arhivata: notificare.arhivata,
  paginaDestinatie: notificare.paginaDestinatie,
  textActiune: notificare.textActiune,
  metadata: notificare.metadata
});

export const NotificariService = {
  async fetchNotificari(): Promise<Notificare[]> {
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

