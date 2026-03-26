import { notificariMock } from '../../mock/notificari';

// Centrul de notificări citește acum date din stratul comun de mock-uri.
// Asta face ca mesajele afișate aici să corespundă cu facturile, comenzile și
// dosarele care apar și în celelalte module demo.
export default function Notificare() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Centru Notificări</h2>

      <div className="space-y-4">
        {notificariMock.map((notificare) => (
          <div
            key={notificare.id}
            className={`p-4 rounded-lg border-l-4 ${
              notificare.tip === 'Avertizare'
                ? 'border-amber-500 bg-amber-50'
                : notificare.tip === 'Succes'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex justify-between">
              <span
                className={`font-bold ${
                  notificare.tip === 'Avertizare'
                    ? 'text-amber-700'
                    : notificare.tip === 'Succes'
                      ? 'text-emerald-700'
                      : 'text-blue-700'
                }`}
              >
                {notificare.tip}
              </span>
              <span className="text-sm text-slate-500">{notificare.data}</span>
            </div>
            <p className="mt-2 text-slate-700">{notificare.mesaj}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
