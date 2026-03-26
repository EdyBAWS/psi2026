import { useState } from 'react';

// Centrul de notificări este momentan o listă de mesaje mock.
// Nu are acțiuni complexe, dar oferă un loc vizibil unde pot ajunge
// evenimente importante din celelalte module.
export default function Notificare() {
  const [notificari] = useState([
    { id: 1, data: '2026-03-20', mesaj: 'Factura F-2026-001 a depășit scadența.', tip: 'Avertizare' },
    { id: 2, data: '2026-03-19', mesaj: 'A fost creat un nou dosar de daună (DAUNA-002).', tip: 'Info' },
  ]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Centru Notificări</h2>

      <div className="space-y-4">
        {notificari.map(n => (
          <div key={n.id} className={`p-4 rounded-lg border-l-4 ${n.tip === 'Avertizare' ? 'border-amber-500 bg-amber-50' : 'border-blue-500 bg-blue-50'}`}>
            <div className="flex justify-between">
              <span className={`font-bold ${n.tip === 'Avertizare' ? 'text-amber-700' : 'text-blue-700'}`}>{n.tip}</span>
              <span className="text-sm text-slate-500">{n.data}</span>
            </div>
            <p className="mt-2 text-slate-700">{n.mesaj}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
