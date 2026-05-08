import { API_BASE_URL } from '../../lib/api';

export const FacturareService = {
  // --- FACTURARE COMENZI (LEGAT LA BAZA DE DATE REALĂ) ---
  async fetchComenziFacturabile() {
    const res = await fetch(`${API_BASE_URL}/operational/comenzi`);
    if (!res.ok) throw new Error('Nu am putut prelua comenzile de la server.');
    
    const comenzi = await res.json();
    
    // Filtrăm doar comenzile care au statusul exact "FINALIZAT"
    return comenzi
      .filter((c: any) => c.status === 'FINALIZAT')
      .map((c: any) => ({
        idComanda: c.idComanda,
        nrComanda: c.numarComanda,
        dataComanda: new Date(c.createdAt).toISOString().split('T')[0],
        client: c.client?.nume || 'Client Necunoscut',
        vehicul: c.vehicul?.numarInmatriculare || '-',
        totalEstimat: c.totalEstimat || 0,
      }));
  },

  async fetchLiniiFactura(idComanda: number) {
    const res = await fetch(`${API_BASE_URL}/operational/comenzi`);
    if (!res.ok) return [];
    
    const comenzi = await res.json();
    const comanda = comenzi.find((c: any) => c.idComanda === idComanda);
    
    if (!comanda || !comanda.pozitii) return [];
    
    return comanda.pozitii.map((p: any) => ({
      idLinie: p.idPozitie,
      denumire: p.tipArticol === 'PIESA' ? `Piesă #${p.idArticol}` : `Manoperă #${p.idArticol}`,
      cantitate: p.cantitate,
      pretUnitar: p.pretUnitar
    }));
  },

  // --- ISTORIC ȘI ALTE FUNCȚII (Păstrate sau adaptate la API) ---
  async fetchIstoric() {
    const res = await fetch(`${API_BASE_URL}/facturare`);
    return res.ok ? await res.json() : [];
  },

  async fetchFacturiEmise() {
    const res = await fetch(`${API_BASE_URL}/facturare`);
    return res.ok ? await res.json() : [];
  }
};