export default function Facturare() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Facturare Comenzi de Service</h2>
      <p className="text-gray-600">
        Acest modul va extrage datele din tabelele <strong>COMANDA_SERVICE</strong> și <strong>POZITIE_COMANDA</strong> pentru a genera documentul fiscal și a actualiza creanțele clientului.
      </p>
    </div>
  );
}