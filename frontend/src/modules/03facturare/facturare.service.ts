import { API_BASE_URL } from '../../lib/api';

const POZITII_STORAGE_KEY = "psi-operational-pozitii-comanda";

export const FacturareService = {
  async fetchComenziFacturabile() {
    const res = await fetch(`${API_BASE_URL}/operational/comenzi`);
    if (!res.ok) throw new Error('Eroare API');
    
    const comenzi = await res.json();
    let pozitiiLocale: any[] = [];
    
    try {
      const raw = window.localStorage.getItem(POZITII_STORAGE_KEY);
      pozitiiLocale = raw ? JSON.parse(raw) : [];
    } catch (err) { console.error(err); }
    
    return comenzi.filter((c: any) => c.status === 'FINALIZAT').map((c: any) => {
      // Cautam pozitiile folosind == pentru a ignora string vs number
      const pozitiiComanda = pozitiiLocale.filter(p => p.idComanda == c.idComanda);
      // Incercam mai multe nume de proprietati comune (pretVanzare, pret, pretUnitar)
      const totalEstimatLocal = pozitiiComanda.reduce((sum, p) => 
        sum + (Number(p.cantitate || 0) * Number(p.pretVanzare || p.pretUnitar || p.pret || 0)), 0
      );

      return {
        idComanda: c.idComanda,
        nrComanda: c.numarComanda,
        dataComanda: new Date(c.createdAt).toISOString().split('T')[0],
        client: c.client?.nume || 'Client Necunoscut',
        idClient: c.client?.idClient || c.idClient,
        vehicul: c.vehicul?.numarInmatriculare || '-',
        totalEstimat: totalEstimatLocal > 0 ? totalEstimatLocal : (c.totalEstimat || 0),
      };
    });
  },

  async fetchLiniiFactura(idComanda: number) {
    try {
      const raw = window.localStorage.getItem(POZITII_STORAGE_KEY);
      if (raw) {
        const pozitiiLocale = JSON.parse(raw);
        const filtered = pozitiiLocale.filter((p: any) => p.idComanda == idComanda);
        
        if (filtered.length > 0) {
          return filtered.map((p: any) => ({
            idLinie: p.idPozitieCmd || p.id || Math.random(),
            denumire: p.descriere || p.nume || p.codArticol || 'Articol',
            cantitate: Number(p.cantitate) || 0,
            pretUnitar: Number(p.pretVanzare || p.pretUnitar || p.pret || 0)
          }));
        }
      }
    } catch (err) { console.error(err); }

    return []; // Sau fetch de pe backend daca e cazul
  },

  async fetchIstoric() {
    const res = await fetch(`${API_BASE_URL}/facturare`);
    return res.ok ? await res.json() : [];
  },
  
  async fetchFacturiEmise() {
    const res = await fetch(`${API_BASE_URL}/facturare`);
    return res.ok ? await res.json() : [];
  }
};