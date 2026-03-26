import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../componente/ui/Button';

// Interfețe pentru Penalizări
interface Client {
  idClient: number;
  nume: string;
  soldDebitor: number;
}

interface FacturaRestanta {
  idFactura: number;
  idClient: number;
  serie: string;
  numar: string;
  dataScadenta: string;
  restDePlata: number;
}

const Penalizare: React.FC = () => {
  // State-uri
  const [clientSelectat, setClientSelectat] = useState<number | ''>('');
  const [facturaSelectata, setFacturaSelectata] = useState<FacturaRestanta | null>(null);
  const [zileIntarziere, setZileIntarziere] = useState<number>(0);
  const [procentPenalizare, setProcentPenalizare] = useState<number>(0.1); // Ex: 0.1% pe zi

  // --- DATE DE TEST (Mock Data) ---
  const clientiMock: Client[] = [
    { idClient: 1, nume: 'Ion Popescu (PF)', soldDebitor: 1500 },
    { idClient: 2, nume: 'SC Transport SRL (PJ)', soldDebitor: 4200 }
  ];

  const facturiMock: FacturaRestanta[] = [
    { idFactura: 10, idClient: 1, serie: 'FCT', numar: '2026-050', dataScadenta: '2026-02-15', restDePlata: 1500 },
    { idFactura: 11, idClient: 2, serie: 'FCT', numar: '2026-042', dataScadenta: '2026-01-10', restDePlata: 4200 }
  ];
  // --------------------------------

  // Filtrăm facturile restante doar pentru clientul selectat
  const facturiClient = facturiMock.filter(f => f.idClient === clientSelectat);

  // Calcul automat valoare penalizare
  // Formula: Rest de plată * (Procent / 100) * Zile de întârziere
  const valoarePenalizare = facturaSelectata 
    ? (facturaSelectata.restDePlata * (procentPenalizare / 100) * zileIntarziere)
    : 0;

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClientSelectat(parseInt(e.target.value) || '');
    setFacturaSelectata(null); // Resetăm factura când schimbăm clientul
    setZileIntarziere(0);
  };

  const handleFacturaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const facturaGasita = facturiClient.find(f => f.idFactura === id) || null;
    setFacturaSelectata(facturaGasita);
  };

  const handleGenereazaPenalizare = () => {
    if (!facturaSelectata || zileIntarziere <= 0) {
      toast.error('Te rog selectează o factură și introdu zilele de întârziere.');
      return;
    }
    // Aici va veni INSERT în FACTURA și FACTURA_PENALIZARE
    console.log('Factură Penalizare Generată:', {
      idFacturaRest: facturaSelectata.idFactura,
      zileIntarziere,
      procentPenalizare,
      valoareTotala: valoarePenalizare
    });
    toast.success(
      `Factura de penalizare în valoare de ${valoarePenalizare.toFixed(2)} RON a fost generată.`,
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-red-600">Generare Factură Penalizare</h1>
      <p className="mb-6 text-gray-600">
        Acest modul aplică penalizări pentru facturile care au depășit data scadenței, conform contractului.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Partea Stângă: Selecție Date */}
        <div className="space-y-6">
          <div className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">1. Selectare Restanță</h2>
            
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
              <label className="block text-sm font-medium text-gray-700">Factură Restantă:</label>
              <select className="w-full border p-2 rounded mt-1" disabled={!clientSelectat} onChange={handleFacturaChange}>
                <option value="">-- Alege factură --</option>
                {facturiClient.map(f => (
                  <option key={f.idFactura} value={f.idFactura}>
                    {f.serie} {f.numar} (Rest: {f.restDePlata} RON)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border p-4 rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">2. Calcul Penalizare</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Zile Întârziere:</label>
              <input 
                type="number" 
                min="0"
                className="w-full border p-2 rounded mt-1" 
                value={zileIntarziere} 
                onChange={(e) => setZileIntarziere(parseInt(e.target.value) || 0)} 
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Procent Penalizare (% pe zi):</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full border p-2 rounded mt-1" 
                value={procentPenalizare} 
                onChange={(e) => setProcentPenalizare(parseFloat(e.target.value) || 0)} 
              />
            </div>
          </div>
        </div>

        {/* Partea Dreaptă: Sumar și Acțiune */}
        <div className="border p-6 rounded shadow-sm bg-gray-50 flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 text-center">Sumar Penalizare</h2>
          
          <div className="space-y-4 text-lg">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Bază de calcul (Rest):</span>
              <span className="font-medium">{facturaSelectata ? facturaSelectata.restDePlata.toFixed(2) : '0.00'} RON</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Zile facturate:</span>
              <span className="font-medium">{zileIntarziere} zile</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Procent aplicat:</span>
              <span className="font-medium">{procentPenalizare}% / zi</span>
            </div>
            <div className="flex justify-between pt-4 text-2xl font-bold">
              <span className="text-gray-800">Total de Facturat:</span>
              <span className="text-red-600">{valoarePenalizare.toFixed(2)} RON</span>
            </div>
          </div>

          <Button
            className="mt-10 text-lg"
            fullWidth
            size="lg"
            variant="danger"
            onClick={handleGenereazaPenalizare}
          >
            Emite Factura de Penalizare
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Penalizare;
