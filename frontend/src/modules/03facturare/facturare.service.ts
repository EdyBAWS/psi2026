import { API_BASE_URL } from '../../lib/api';

export const FacturareService = {
  async fetchComenziFacturabile() {
    const res = await fetch(`${API_BASE_URL}/operational/comenzi`);
    if (!res.ok) throw new Error('Eroare API');
    
    const comenzi = await res.json();
    
    return comenzi.filter((c: any) => c.status === 'FINALIZAT').map((c: any) => ({
        idComanda: c.idComanda,
        nrComanda: c.numarComanda,
        dataComanda: new Date(c.createdAt).toISOString().split('T')[0],
        client: c.client?.nume || 'Client Necunoscut',
        idClient: c.client?.idClient || c.idClient,
        vehicul: c.vehicul?.numarInmatriculare || '-',
        totalEstimat: c.totalEstimat || 0,
    }));
  },

  async fetchLiniiFactura(idComanda: number) {
    const res = await fetch(`${API_BASE_URL}/operational/comenzi/${idComanda}/pozitii`);
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.map((p: any) => ({
      idLinie: p.idPozitie,
      idPiesa: p.tipArticol === 'PIESA' ? p.idArticol : null,
      idKit: p.tipArticol === 'KIT' ? (p.idKit || p.idArticol) : null,
      idManopera: p.tipArticol === 'MANOPERA' ? p.idArticol : null,
      tip: p.tipArticol === 'MANOPERA' ? 'Manopera' : (p.tipArticol === 'KIT' ? 'Kit' : 'Piesa'),
      denumire: p.descriere || p.codArticol || 'Articol',
      cantitate: Number(p.cantitate) || 0,
      pretUnitar: Number(p.pretUnitar || 0)
    }));
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
