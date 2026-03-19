import React, { useState } from 'react';

// Interfețe bazate pe modelul logic al datelor
interface Client {
  idClient: number;
  nume: string;
  cui: string;
  soldDebitor: number;
}

interface ComandaService {
  idComanda: number;
  nrComanda: string;
  totalEstimat: number;
  nrInmatriculare: string; // preluat din relația cu Vehicul
}

interface PozitieFactura {
  idPozFactura?: number;
  tipPozitie: string; // ex: Piesa sau Manopera
  descriere: string;
  cantitate: number;
  pretUnitar: number;
  tva: number;
}

const Facturare: React.FC = () => {
  // State-uri pentru stocarea datelor selectate/introduse
  const [clientSelectat, setClientSelectat] = useState<Client | null>(null);
  const [comandaSelectata, setComandaSelectata] = useState<ComandaService | null>(null);
  const [pozitii, setPozitii] = useState<PozitieFactura[]>([]);
  
  // State pentru detaliile facturii
  const [serieFactura, setSerieFactura] = useState<string>('FCT');
  const [numarFactura, setNumarFactura] = useState<string>('');
  const [dataEmitere, setDataEmitere] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dataScadenta, setDataScadenta] = useState<string>('');

  // --- DATE DE TEST (Mock Data) ---
  const clientiMock: Client[] = [
    { idClient: 1, nume: 'Ion Popescu (PF)', cui: '1900101123456', soldDebitor: 0 },
    { idClient: 2, nume: 'SC Transport SRL (PJ)', cui: 'RO12345678', soldDebitor: 500 }
  ];

  const comenziMock: ComandaService[] = [
    { idComanda: 101, nrComanda: 'CMD-2026-001', totalEstimat: 450, nrInmatriculare: 'IS-26-ALX' },
    { idComanda: 102, nrComanda: 'CMD-2026-002', totalEstimat: 1200, nrInmatriculare: 'B-100-TST' }
  ];

  const pozitiiMock: PozitieFactura[] = [
    { tipPozitie: 'Piesă', descriere: 'Plăcuțe frână', cantitate: 1, pretUnitar: 250, tva: 19 },
    { tipPozitie: 'Manoperă', descriere: 'Înlocuire plăcuțe', cantitate: 2, pretUnitar: 100, tva: 19 }
  ];
  // --------------------------------

  // Calcul automat total (regula de proiectare din documentație)
  const valoareTotala = pozitii.reduce((acc, poz) => acc + (poz.cantitate * poz.pretUnitar * (1 + poz.tva / 100)), 0);

  // Funcție pentru când se schimbă clientul în dropdown
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const clientGasit = clientiMock.find(c => c.idClient === id) || null;
    setClientSelectat(clientGasit);
  };

  // Funcție pentru când se schimbă comanda în dropdown
  const handleComandaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const comandaGasita = comenziMock.find(c => c.idComanda === id) || null;
    setComandaSelectata(comandaGasita);
    
    // Dacă a selectat o comandă validă, încărcăm și piesele/manopera
    if (comandaGasita) {
      setPozitii(pozitiiMock);
    } else {
      setPozitii([]); // Golim tabelul dacă nu e selectată comanda
    }
  };

  const handleGenereazaFactura = () => {
    // Aici va veni logica de INSERT în tabelele FACTURA și POZITIE_FACTURA
    console.log('Factură generată:', { clientSelectat, comandaSelectata, valoareTotala });
    alert('Factura a fost generată cu succes!');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestionare Facturi</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. GrpClient - Date Identificare Client */}
        <div className="border p-4 rounded shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Date Client</h2>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Selectează Client:</label>
            <select className="w-full border p-2 rounded mt-1" onChange={handleClientChange}>
              <option value="">-- Alege client --</option>
              {clientiMock.map(c => (
                <option key={c.idClient} value={c.idClient}>{c.nume}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">CUI / CNP:</label>
            <input type="text" className="w-full border p-2 rounded bg-gray-100 mt-1" readOnly value={clientSelectat?.cui || ''} />
          </div>
        </div>

        {/* 2. GrpComanda - Selecție Comandă Service */}
        <div className="border p-4 rounded shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Comandă Service</h2>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Selectează Comanda (Închisă):</label>
            <select className="w-full border p-2 rounded mt-1" onChange={handleComandaChange}>
              <option value="">-- Alege comanda --</option>
              {comenziMock.map(cmd => (
                <option key={cmd.idComanda} value={cmd.idComanda}>{cmd.nrComanda}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Nr. Înmatriculare Vehicul:</label>
            <input type="text" className="w-full border p-2 rounded bg-gray-100 mt-1" readOnly value={comandaSelectata?.nrInmatriculare || ''} />
          </div>
        </div>
      </div>

      {/* 3. GrpDetaliiFactura - Datele Documentului Fiscal */}
      <div className="border p-4 rounded shadow-sm mt-6 bg-white">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Detalii Document Fiscal</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Serie:</label>
            <input type="text" className="w-full border p-2 rounded mt-1" value={serieFactura} onChange={(e) => setSerieFactura(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Număr:</label>
            <input type="text" className="w-full border p-2 rounded mt-1" value={numarFactura} onChange={(e) => setNumarFactura(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data Emitere:</label>
            <input type="date" className="w-full border p-2 rounded mt-1" value={dataEmitere} onChange={(e) => setDataEmitere(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data Scadență:</label>
            <input type="date" className="w-full border p-2 rounded mt-1" value={dataScadenta} onChange={(e) => setDataScadenta(e.target.value)} />
          </div>
        </div>
      </div>

      {/* 4. GrdPozitiiFactura - Grid Read-Only pentru Piese și Manoperă */}
      <div className="border p-4 rounded shadow-sm mt-6 bg-white overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Poziții Factură (Articole Consumate)</h2>
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2 text-gray-700 font-medium">Tip</th>
              <th className="p-2 text-gray-700 font-medium">Descriere</th>
              <th className="p-2 text-gray-700 font-medium">Cantitate</th>
              <th className="p-2 text-gray-700 font-medium">Preț Unitar</th>
              <th className="p-2 text-gray-700 font-medium">TVA (%)</th>
              <th className="p-2 text-gray-700 font-medium">Total Linie</th>
            </tr>
          </thead>
          <tbody>
            {pozitii.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">Nu a fost selectată nicio comandă sau comanda este goală.</td>
              </tr>
            ) : (
              pozitii.map((poz, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-2 text-gray-800">{poz.tipPozitie}</td>
                  <td className="p-2 text-gray-800">{poz.descriere}</td>
                  <td className="p-2 text-gray-800">{poz.cantitate}</td>
                  <td className="p-2 text-gray-800">{poz.pretUnitar.toFixed(2)} RON</td>
                  <td className="p-2 text-gray-800">{poz.tva}%</td>
                  <td className="p-2 text-gray-800 font-medium">{(poz.cantitate * poz.pretUnitar * (1 + poz.tva / 100)).toFixed(2)} RON</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Totaluri și Acțiuni */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded border shadow-sm">
        <div className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">
          Valoare Totală: <span className="text-blue-600">{valoareTotala.toFixed(2)} RON</span>
        </div>
        <div className="space-x-4">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-100 transition-colors">
            Anulare
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 font-semibold transition-colors"
            onClick={handleGenereazaFactura}
          >
            Generează Factura
          </button>
        </div>
      </div>
    </div>
  );
};

export default Facturare;