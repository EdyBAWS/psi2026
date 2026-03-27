import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { facturiRestanteMock } from '../../../mock/incasari';
import { mockClienti } from '../../../mock/operational';

export default function Penalizare() {
  const [idClientSelectat, setIdClientSelectat] = useState<number | ''>('');
  const [idFacturaSelectata, setIdFacturaSelectata] = useState<number | ''>('');

  const [searchTermClient, setSearchTermClient] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  const [dataCalcul, setDataCalcul] = useState<string>(new Date().toISOString().split('T')[0]);
  const [procentPenalizare, setProcentPenalizare] = useState<number>(1);
  const [numarFacturaPenalizare, setNumarFacturaPenalizare] = useState<string>('');

  const clientiMock = useMemo(
    () =>
      mockClienti
        .filter((client) => facturiRestanteMock.some((factura) => factura.idClient === client.idClient))
        .map((client) => ({
          idClient: client.idClient,
          nume: client.denumireCompanie ?? client.nume,
          soldDebitor: facturiRestanteMock
            .filter((factura) => factura.idClient === client.idClient)
            .reduce((total, factura) => total + factura.restDePlata, 0),
          CUI: client.email,
        })),
    [],
  );

  const clientiFiltrati = useMemo(() => {
    if (!searchTermClient) return clientiMock;
    const term = searchTermClient.toLowerCase();
    return clientiMock.filter(
      (client) =>
        client.nume.toLowerCase().includes(term) || client.CUI.toLowerCase().includes(term),
    );
  }, [clientiMock, searchTermClient]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const facturiClient = useMemo(
    () => facturiRestanteMock.filter((factura) => factura.idClient === idClientSelectat),
    [idClientSelectat],
  );
  const factura = useMemo(
    () => facturiClient.find((item) => item.idFactura === idFacturaSelectata) || null,
    [idFacturaSelectata, facturiClient],
  );

  const handleSelectClient = (client: (typeof clientiMock)[number]) => {
    setIdClientSelectat(client.idClient);
    setSearchTermClient(`${client.nume} (${client.CUI})`);
    setIsClientDropdownOpen(false);
    setIdFacturaSelectata('');
  };

  const calculePenalizare = useMemo(() => {
    if (!factura) return { zileIntarziere: 0, valoarePenalizare: 0 };

    const scadenta = new Date(factura.dataScadenta);
    const calcul = new Date(dataCalcul);

    const diferentaTimp = calcul.getTime() - scadenta.getTime();
    const zileIntarziere = Math.ceil(diferentaTimp / (1000 * 3600 * 24));

    const zileValide = zileIntarziere > 0 ? zileIntarziere : 0;
    const valoare = factura.restDePlata * (procentPenalizare / 100) * zileValide;

    return { zileIntarziere: zileValide, valoarePenalizare: valoare };
  }, [factura, dataCalcul, procentPenalizare]);

  const handleGenereazaPenalizare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factura || calculePenalizare.zileIntarziere <= 0) {
      toast.error('Nu există zile de întârziere pentru a putea emite o penalizare.');
      return;
    }
    if (!numarFacturaPenalizare) {
      toast.error('Introdu un număr pentru factura de penalizare.');
      return;
    }

    toast.success(
      `Factura de penalizare PEN-${numarFacturaPenalizare} a fost emisă pentru ${calculePenalizare.valoarePenalizare.toFixed(2)} RON.`,
    );

    setIdFacturaSelectata('');
    setNumarFacturaPenalizare('');
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-5xl mx-auto">
      <div className="mb-8 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Generare Factură Penalizare</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Modulul calculează și aplică automat dobânzi penalizatoare pentru creanțele
          neîncasate la termen, generând un nou document fiscal.
        </p>
      </div>

      <form onSubmit={handleGenereazaPenalizare} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">
              1. Selectare Restanță
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative" ref={clientDropdownRef}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Căutare Client
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Caută nume sau email..."
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none shadow-sm transition-shadow"
                    value={searchTermClient}
                    onChange={(e) => {
                      setSearchTermClient(e.target.value);
                      setIsClientDropdownOpen(true);
                      if (idClientSelectat) {
                        setIdClientSelectat('');
                        setIdFacturaSelectata('');
                      }
                    }}
                    onFocus={() => setIsClientDropdownOpen(true)}
                  />
                  <svg
                    className="w-5 h-5 absolute left-3 top-3 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {isClientDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-fade-in">
                    {clientiFiltrati.length > 0 ? (
                      <ul className="divide-y divide-slate-100">
                        {clientiFiltrati.map((client) => (
                          <li
                            key={client.idClient}
                            onClick={() => handleSelectClient(client)}
                            className="p-3 hover:bg-rose-50 cursor-pointer transition-colors group"
                          >
                            <p className="font-semibold text-slate-800 group-hover:text-rose-700">
                              {client.nume}
                            </p>
                            <p className="text-xs text-slate-500">Contact: {client.CUI}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 text-center text-slate-500 text-sm">
                        Nu a fost găsit niciun client.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Factură Scadentă Neachitată
                </label>
                <select
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-rose-500 outline-none shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  value={idFacturaSelectata}
                  onChange={(e) => setIdFacturaSelectata(Number(e.target.value) || '')}
                  disabled={!idClientSelectat}
                >
                  <option value="">-- Alege factura --</option>
                  {facturiClient.map((facturaClient) => {
                    const isOverdue = new Date(facturaClient.dataScadenta) < new Date(dataCalcul);
                    return (
                      <option key={facturaClient.idFactura} value={facturaClient.idFactura}>
                        {facturaClient.numar} | Rest: {facturaClient.restDePlata} RON
                        {isOverdue ? ' (ÎNTÂRZIATĂ)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-rose-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide pl-2">
              2. Motor Calcul Penalizări
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Dată Scadentă Factură
                </label>
                <input
                  type="date"
                  readOnly
                  value={factura ? factura.dataScadenta : ''}
                  className="w-full border border-slate-200 bg-slate-100 text-slate-500 p-2.5 rounded-lg cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1">
                  Dată Curentă (Calcul la zi)
                </label>
                <input
                  type="date"
                  className="w-full border border-rose-300 bg-white p-2.5 rounded-lg focus:ring-2 focus:ring-rose-500 font-bold text-rose-900 shadow-inner"
                  value={dataCalcul}
                  onChange={(e) => setDataCalcul(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Procent Penalizare / Zi (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white font-medium"
                  value={procentPenalizare}
                  onChange={(e) => {
                    const valoareIntreaga = parseInt(e.target.value, 10) || 0;
                    setProcentPenalizare(valoareIntreaga);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500 rounded-bl-full opacity-10"></div>

          <div className="relative z-10">
            <h2 className="text-sm font-bold text-rose-400 mb-6 uppercase tracking-widest border-b border-slate-700 pb-2">
              Sumar Execuție
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-slate-300 text-sm">
                <span>Bază de calcul (Rest Plată):</span>
                <span className="font-medium text-white">
                  {factura ? factura.restDePlata.toFixed(2) : '0.00'} RON
                </span>
              </div>
              <div className="flex justify-between text-slate-300 text-sm">
                <span>Total zile de întârziere:</span>
                <span
                  className={`font-bold ${
                    calculePenalizare.zileIntarziere > 0 ? 'text-rose-400' : 'text-slate-500'
                  }`}
                >
                  {calculePenalizare.zileIntarziere} zile
                </span>
              </div>
              <div className="flex justify-between text-slate-300 text-sm">
                <span>Coeficient aplicat:</span>
                <span className="font-medium">{procentPenalizare}% / zi</span>
              </div>
            </div>

            <div className="mt-8 bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                Valoare Extra de Facturat
              </div>
              <div className="text-3xl font-bold text-rose-500">
                {calculePenalizare.valoarePenalizare.toFixed(2)}{' '}
                <span className="text-lg text-slate-400">RON</span>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Alocă Număr Factură Penalizare
              </label>
              <div className="flex">
                <span className="bg-slate-700 text-slate-300 px-3 py-2 rounded-l-lg border border-slate-600 border-r-0 font-medium text-sm flex items-center">
                  PEN -
                </span>
                <input
                  type="text"
                  placeholder="ex: 0045"
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-r-lg px-3 py-2 focus:ring-1 focus:ring-rose-500 outline-none"
                  value={numarFacturaPenalizare}
                  onChange={(e) => setNumarFacturaPenalizare(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!factura || calculePenalizare.zileIntarziere === 0}
            className={`mt-8 w-full py-4 rounded-xl shadow font-bold tracking-wide transition-all z-10 ${
              !factura || calculePenalizare.zileIntarziere === 0
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                : 'bg-rose-600 text-white hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-600/30 border border-rose-500'
            }`}
          >
            Generează Penalizarea
          </button>
        </div>
      </form>
    </div>
  );
}
