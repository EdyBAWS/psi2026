import React, { useState } from 'react';

// Interfețe
interface Client {
  idClient: number;
  nume: string;
}

interface Factura {
  idFactura: number;
  idClient: number;
  serie: string;
  numar: string;
  valoareTotala: number; // Valoarea înainte de reducere
}

const Oferta: React.FC = () => {
  // State-uri
  const [clientSelectat, setClientSelectat] = useState<number | ''>('');
  const [facturaSelectata, setFacturaSelectata] = useState<Factura | null>(null);
  
  // State-uri specifice pentru POZITIE_FACTURA_OFERTA
  const [codCampanie, setCodCampanie] = useState<string>('');
  const [procentReducere, setProcentReducere] = useState<number>(10); // Default 10%

  // --- DATE DE TEST (Mock Data) ---
  const clientiMock: Client[] = [
    { idClient: 1, nume: 'Ion Popescu (PF)' },
    { idClient: 2, nume: 'SC Transport SRL (PJ)' }
  ];

  const facturiMock: Factura[] = [
    { idFactura: 101, idClient: 1, serie: 'FCT', numar: '2026-080', valoareTotala: 1500 },
    { idFactura: 102, idClient: 2, serie: 'FCT', numar: '2026-081', valoareTotala: 4500 }
  ];
  // --------------------------------

  // Filtrăm facturile pentru clientul selectat
  const facturiClient = facturiMock.filter(f => f.idClient === clientSelectat);

  // Calcule
  const valoareReducere = facturaSelectata ? (facturaSelectata.valoareTotala * (procentReducere / 100)) : 0;
  const totalDupaReducere = facturaSelectata ? (facturaSelectata.valoareTotala - valoareReducere) : 0;

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClientSelectat(parseInt(e.target.value) || '');
    setFacturaSelectata(null); // Reset
  };

  const handleFacturaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const facturaGasita = facturiClient.find(f => f.idFactura === id) || null;
    setFacturaSelectata(facturaGasita);
  };

  const handleAplicaOferta = () => {
    if (!facturaSelectata || !codCampanie || procentReducere <= 0) {
      alert('Te rog selectează o factură, introdu un cod de campanie și un procent valid!');
      return;
    }
    
    // Aici va veni logica de INSERT în POZITIE_FACTURA și POZITIE_FACTURA_OFERTA
    // și UPDATE pe valoarea totală a facturii
    console.log('Ofertă aplicată:', {
      idFactura: facturaSelectata.idFactura,
      codCampanie,
      procentReducere,
      valoareReducere
    });
    
    alert(`Reducerea de ${valoareReducere.toFixed(2)} RON a fost aplicată cu succes pe factura ${facturaSelectata.numar}!`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-emerald-600">Aplicare Ofertă / Campanie Promoțională</h1>
      <p className="mb-6 text-gray-600">
        Acest modul adaugă o poziție de reducere (discount) pe o factură existentă, conform campaniilor active.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Partea Stângă: Selecție și Date Campanie */}
        <div className="space-y-6">
          <div className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">1. Selectare Factură</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Client:</label>
              <select className="w-full border p-2 rounded mt-1" value={clientSelectat} onChange={handleClientChange}>
                <option value="">-- Alege client --</option>
                {clientiMock.map(c => (
                  <option key={c.idClient} value={c.idClient}>{c.nume}</option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Factură vizată:</label>
              <select className="w-full border p-2 rounded mt-1" disabled={!clientSelectat} onChange={handleFacturaChange}>
                <option value="">-- Alege factură --</option>
                {facturiClient.map(f => (
                  <option key={f.idFactura} value={f.idFactura}>
                    {f.serie} {f.numar} (Total: {f.valoareTotala} RON)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">2. Detalii Ofertă</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Cod Campanie Promoțională:</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded mt-1 uppercase" 
                placeholder="Ex: BLACKFRIDAY26"
                value={codCampanie} 
                onChange={(e) => setCodCampanie(e.target.value.toUpperCase())} 
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Procent Reducere (%):</label>
              <input 
                type="number" 
                min="0"
                max="100"
                className="w-full border p-2 rounded mt-1" 
                value={procentReducere} 
                onChange={(e) => setProcentReducere(parseFloat(e.target.value) || 0)} 
              />
            </div>
          </div>
        </div>

        {/* Partea Dreaptă: Sumar Reducere */}
        <div className="border p-6 rounded shadow-sm bg-gray-50 flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 text-center">Sumar Factură</h2>
          
          <div className="space-y-4 text-lg">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Total inițial:</span>
              <span className="font-medium">{facturaSelectata ? facturaSelectata.valoareTotala.toFixed(2) : '0.00'} RON</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Reducere aplicată ({procentReducere}%):</span>
              <span className="font-medium text-emerald-600">- {valoareReducere.toFixed(2)} RON</span>
            </div>
            
            <div className="flex justify-between pt-4 text-2xl font-bold">
              <span className="text-gray-800">Total de Plată:</span>
              <span className="text-blue-600">{totalDupaReducere.toFixed(2)} RON</span>
            </div>
          </div>

          <button 
            className="mt-10 w-full py-3 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 font-bold transition-colors text-lg"
            onClick={handleAplicaOferta}
          >
            Aplică Reducerea
          </button>
        </div>

      </div>
    </div>
  );
};

export default Oferta;