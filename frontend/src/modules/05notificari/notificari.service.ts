// src/modules/05notificari/notificari.service.ts
import { notificariMock } from '../../mock/notificari';
import type { NotificareMock } from '../../mock/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const NotificariService = {
  async fetchNotificari(): Promise<NotificareMock[]> {
    await delay(300);
    return [...notificariMock];
  },
  
  // Opțional, în viitor, state-ul notificărilor citite se va salva în baza de date pe User
  async syncStariNotificari(stari: any) {
    await delay(100);
    return { success: true };
  }
};