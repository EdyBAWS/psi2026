// Selectorul de vehicul este primul pas din flux.
// Pe lângă datele mașinii, afișăm și contextul clientului și eventualele
// comenzi deja active pentru același vehicul.
import { useState } from "react";
import { comandaEsteActiva } from "../calculations";
import type { Client, ComandaService, Vehicul } from "../types";

interface SelectorVehiculProps {
  clienti: Client[];
  comenzi: ComandaService[];
  idVehiculSelectat: number | null;
  onSelecteaza: (idVehicul: number | null) => void;
  vehicule: Vehicul[];
  onAdaugaVehicul?: () => void;
}

export default function SelectorVehicul({
  clienti,
  comenzi,
  idVehiculSelectat,
  onSelecteaza,
  vehicule,
  onAdaugaVehicul,
}: SelectorVehiculProps) {
  // Componenta păstrează local doar textul de căutare.
  // Vehiculul selectat rămâne în pagina părinte, pentru că și alte componente
  // trebuie să știe ce mașină a fost aleasă.
  const [cautare, setCautare] = useState("");

  const termen = cautare.trim().toLowerCase();
  // Filtrarea se face pe mai multe câmpuri ca să imite o căutare practică din recepție:
  // număr de înmatriculare, model, VIN, numele clientului sau telefon.
  const vehiculeFiltrate = vehicule.filter((vehicul) => {
    const client = clienti.find((c) => c.idClient === vehicul.idClient);
    return (
      vehicul.nrInmatriculare.toLowerCase().includes(termen) ||
      vehicul.model.toLowerCase().includes(termen) ||
      vehicul.serieSasiu.toLowerCase().includes(termen) ||
      client?.nume.toLowerCase().includes(termen) ||
      client?.telefon.toLowerCase().includes(termen)
    );
  });

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="cautare-vehicul" className="sr-only">
          Cauta vehicul
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-slate-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            id="cautare-vehicul"
            className="block w-full rounded-xl border-0 py-3 pl-10 pr-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Caută după nr. înmatriculare, model, client sau telefon..."
            value={cautare}
            onChange={(e) => setCautare(e.target.value)}
          />
        </div>
      </div>

      {vehiculeFiltrate.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehiculeFiltrate.map((vehicul) => {
            const client = clienti.find((c) => c.idClient === vehicul.idClient);
            // Corectat: trimitem doar c.status către comandaEsteActiva
            const comandaActiva = comenzi.find(
              (c) =>
                c.idVehicul === vehicul.idVehicul &&
                comandaEsteActiva(c.status),
            );
            const esteSelectat = vehicul.idVehicul === idVehiculSelectat;

            return (
              <button
                key={vehicul.idVehicul}
                onClick={() =>
                  onSelecteaza(esteSelectat ? null : vehicul.idVehicul)
                }
                className={`relative flex flex-col items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                  esteSelectat
                    ? "border-slate-200 bg-indigo-50 shadow-md ring-2 ring-inset ring-indigo-600"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                }`}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-sm font-bold text-slate-800 ring-1 ring-inset ring-slate-500/10">
                      {vehicul.nrInmatriculare}
                    </span>
                    {comandaActiva ? (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        În service
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-900">
                    {vehicul.marca} {vehicul.model}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {client?.nume ?? "Client necunoscut"}
                  </p>
                </div>

                <dl className="w-full space-y-1 border-t border-slate-100 pt-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="font-medium text-slate-600">Telefon</dt>
                    <dd>{client?.telefon ?? "-"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="font-medium text-slate-600">Tip client</dt>
                    <dd>{client?.tipClient ?? "-"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="font-medium text-slate-600">An</dt>
                    <dd>{vehicul.an}</dd>{" "}
                    {/* Corectat: vehicul.an în loc de vehicul.anFabricatie */}
                  </div>
                  <div className="space-y-1">
                    <dt className="font-medium text-slate-600">Serie șasiu</dt>
                    <dd className="break-all text-xs text-slate-500">
                      {vehicul.serieSasiu}
                    </dd>
                  </div>
                  {client?.denumireCompanie ? (
                    <div className="space-y-1">
                      <dt className="font-medium text-slate-600">Companie</dt>
                      <dd className="text-xs text-slate-500">
                        {client.denumireCompanie}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </button>
            );
          })}
        </div>
      )}

      {vehiculeFiltrate.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
          <svg
            className="h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-slate-900">
              Nu am găsit niciun vehicul.
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Căutarea <span className="font-bold">"{cautare}"</span> nu a
              returnat rezultate.
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onAdaugaVehicul) onAdaugaVehicul();
            }}
            className="mt-2 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            <svg
              className="-ml-0.5 mr-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Adaugă Vehicul Nou
          </button>
        </div>
      )}
    </div>
  );
}
