import { useState } from "react";
import { comandaEsteActiva } from "../calculations";
import type { Client, ComandaService, Vehicul } from "../types";

interface SelectorVehiculProps {
  clienti: Client[]; comenzi: ComandaService[]; idVehiculSelectat: number | null;
  onSelecteaza: (idVehicul: number | null) => void; vehicule: Vehicul[];
}

export default function SelectorVehicul({ clienti, comenzi, idVehiculSelectat, onSelecteaza, vehicule }: SelectorVehiculProps) {
  const [cautare, setCautare] = useState("");
  const termen = cautare.trim().toLowerCase();
  
  const vehiculeFiltrate = vehicule.filter((v) => {
    const client = clienti.find((c) => c.idClient === v.idClient);
    return (
      (v.numarInmatriculare || "").toLowerCase().includes(termen) ||
      (v.model || "").toLowerCase().includes(termen) ||
      (v.vin || "").toLowerCase().includes(termen) ||
      (client?.nume || "").toLowerCase().includes(termen) ||
      (client?.telefon || "").toLowerCase().includes(termen)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <input type="text" className="block w-full rounded-xl border border-slate-300 py-3 px-4 shadow-sm focus:ring-indigo-600 sm:text-sm" placeholder="Caută vehicul (nr. înmatriculare, client, model)..." value={cautare} onChange={(e) => setCautare(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehiculeFiltrate.map((v) => {
          const client = clienti.find((c) => c.idClient === v.idClient);
          const esteSelectat = v.idVehicul === idVehiculSelectat;
          const comandaActiva = comenzi.find(c => c.idVehicul === v.idVehicul && c.status && comandaEsteActiva(c.status));

          return (
            <button key={v.idVehicul} onClick={() => onSelecteaza(esteSelectat ? null : v.idVehicul)} className={`relative flex flex-col items-start gap-4 rounded-xl border p-4 text-left transition-all ${esteSelectat ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600" : "border-slate-200 bg-white hover:border-indigo-300"}`}>
              <div className="w-full flex justify-between">
                <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-sm font-bold text-slate-800">{v.numarInmatriculare}</span>
                {comandaActiva && <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">În service</span>}
              </div>
              <div><h3 className="font-semibold text-slate-900">{v.marca} {v.model}</h3><p className="text-sm text-slate-500">{client?.nume || "Client necunoscut"}</p></div>
              <div className="w-full border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-mono">{v.vin}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}