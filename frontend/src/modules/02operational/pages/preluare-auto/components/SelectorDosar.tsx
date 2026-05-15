// Selectorul de dosar rezolvă ramura "de asigurare" a fluxului:
// fie atașează un dosar deja existent pentru vehicul, fie completează
// datele principale pentru a crea unul nou la salvarea comenzii.
// Componenta nu salvează nimic direct. Ea doar editează starea de formular
// primită prin `value` și trimite modificările înapoi prin `onChange`.
import type { StareDosarAsigurare } from "../../../receptie/formState";
import type { Asigurator, DosarDauna, StatusDosar, Vehicul } from "../../../types";
import { Field } from "../../../../../componente/ui/Field";
import { SelectField } from "../../../../../componente/ui/SelectField";
import { TextareaField } from "../../../../../componente/ui/TextareaField";

interface SelectorDosarProps {
  asiguratori: Asigurator[];
  dosare: DosarDauna[];
  nrDosarPreview: string;
  value: StareDosarAsigurare;
  vehicul: Vehicul | null;
  angajati: { idAngajat: number; nume: string; prenume: string; tipAngajat: string; specializare?: string; esteInspector?: boolean }[];
  onChange: (value: StareDosarAsigurare) => void;
  campuriCuEroare: {
    idDosarSelectat: boolean;
    idAsigurator: boolean;
    numarReferintaAsigurator: boolean;
    dataConstatare: boolean;
    inspectorDauna: boolean;
    sumaAprobata: boolean;
  };
}

const statusuriDosar: StatusDosar[] = [
  "Deschis",
  "In analiza",
  "Aprobat partial",
  "Aprobat",
  "Respins",
];

const formatSuma = (valoare: number) =>
  new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 2,
  }).format(valoare);

const formatData = (valoare: Date | string) => {
  const dateObj = typeof valoare === 'string' ? new Date(valoare) : valoare;
  return dateObj.toLocaleDateString("ro-RO");
};

export default function SelectorDosar({
  asiguratori,
  dosare,
  nrDosarPreview,
  value,
  vehicul,
  angajati,
  onChange,
  campuriCuEroare,
}: SelectorDosarProps) {
  const inspectori = angajati.filter((a) => a.tipAngajat === "Inspector" || a.esteInspector === true);

  // Fără vehicul selectat nu putem ști ce dosare sunt relevante,
  // deci afișăm doar un mesaj de ghidare.
  if (!vehicul) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
        Selectează mai întâi un vehicul pentru a putea lega sau crea un dosar de
        daună.
      </div>
    );
  }

  // Selectăm doar dosarele care aparțin vehiculului curent.
  const dosareVehicul = dosare.filter(
    (dosar) => dosar.idVehicul === vehicul.idVehicul,
  );
  const dosarSelectat =
    dosareVehicul.find((dosar) => dosar.idDosar === value.idDosarSelectat) ??
    null;
  const asiguratorSelectat =
    asiguratori.find(
      (asigurator) => asigurator.idAsigurator === dosarSelectat?.idAsigurator,
    ) ?? null;
  const existaDosare = dosareVehicul.length > 0;

  // Când schimbăm modul, păstrăm aceeași structură de stare,
  // dar resetăm câmpurile care nu mai au sens în contextul nou.
  const schimbaMod = (mod: "existent" | "nou") => {
    if (mod === "existent") {
      onChange({
        ...value,
        mod,
        idDosarSelectat: dosareVehicul[0]?.idDosar ?? null,
      });
      return;
    }

    onChange({
      ...value,
      mod,
      idDosarSelectat: null,
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Dosar de daună</h3>
          <p className="mt-1 text-sm text-slate-500">
            Atașează un dosar existent pentru vehiculul selectat sau creează
            unul nou cu datele minime de constatare și aprobare.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="btn-mod-dosar-existent"
            type="button"
            onClick={() => schimbaMod("existent")}
            disabled={!existaDosare}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              value.mod === "existent"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
          >
            Dosar existent
          </button>
          <button
            id="btn-mod-dosar-nou"
            type="button"
            onClick={() => schimbaMod("nou")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              value.mod === "nou"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Dosar nou
          </button>
        </div>
      </div>

      {!existaDosare ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Pentru acest vehicul nu există încă un dosar deschis. Creează unul nou
          pentru a continua fluxul de asigurare.
        </div>
      ) : null}

      {/* Aici folosim randare condițională cu `? :`.
          Dacă modul este `existent`, afișăm selectorul de dosare existente.
          Altfel, afișăm formularul pentru dosar nou. */}
      {value.mod === "existent" ? (
        <div className="space-y-4">
          {/* În acest mod, utilizatorul doar alege un dosar deja cunoscut. */}
          <div>
            <SelectField
              label="Selectează dosarul existent *"
              value={value.idDosarSelectat ?? ""}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                onChange({
                  ...value,
                  idDosarSelectat: event.target.value === "" ? null : Number(event.target.value),
                })
              }
              options={[
                { label: 'Selectează dosar', value: '' },
                ...dosareVehicul.map(dosar => ({
                  label: `${dosar.numarDosar} · ${dosar.statusAprobare}`,
                  value: dosar.idDosar.toString()
                }))
              ]}
              error={campuriCuEroare.idDosarSelectat ? "Selectarea dosarului este obligatorie." : undefined}
            />
          </div>

          {dosarSelectat ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              {/* Afișăm un rezumat informativ, ca utilizatorul să confirme rapid
                  că a ales dosarul corect înainte de salvarea comenzii. */}
              <dl className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-700">Număr dosar</dt>
                  <dd className="mt-1">{dosarSelectat.numarDosar}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">
                    Referință asigurator
                  </dt>
                  <dd className="mt-1">
                    {dosarSelectat.numarReferintaAsigurator || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Asigurator</dt>
                  <dd className="mt-1">
                    {asiguratorSelectat?.denumire ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Tip poliță</dt>
                  <dd className="mt-1">{dosarSelectat.tipPolita || "-"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">
                    Status aprobare
                  </dt>
                  <dd className="mt-1">{dosarSelectat.statusAprobare || "-"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Inspector</dt>
                  <dd className="mt-1">
                    {dosarSelectat.inspectorDauna || (dosarSelectat as any).inspector?.nume || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">
                    Data constatării
                  </dt>
                  <dd className="mt-1">
                    {dosarSelectat.dataConstatare ? formatData(dosarSelectat.dataConstatare) : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">
                    Sumă aprobată
                  </dt>
                  <dd className="mt-1">
                    {dosarSelectat.sumaAprobata != null ? formatSuma(dosarSelectat.sumaAprobata) : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Franciză</dt>
                  <dd className="mt-1">
                    {dosarSelectat.franciza != null ? formatSuma(dosarSelectat.franciza) : "-"}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="font-semibold text-slate-700">Observații</dt>
                  <dd className="mt-1">{dosarSelectat.observatiiDauna || "-"}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* În modul "nou", componenta colectează doar datele necesare pentru
              construirea obiectului final `DosarDauna` în pagina părinte. */}
          <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
            Numărul noului dosar va fi generat automat la salvare:{" "}
            <strong>{nrDosarPreview}</strong>
          </div>

          <div>
            <SelectField
              id="select-asigurator-dosar"
              label="Asigurator *"
              value={value.idAsigurator ?? ""}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                onChange({
                  ...value,
                  idAsigurator: event.target.value === "" ? null : Number(event.target.value),
                })
              }
              options={[
                { label: 'Selectează asigurator', value: '' },
                ...asiguratori.map(a => ({ label: a.denumire, value: a.idAsigurator.toString() }))
              ]}
              error={campuriCuEroare.idAsigurator ? "Câmp obligatoriu" : undefined}
            />
          </div>

          <div>
            <SelectField
              id="select-tip-polita-dosar"
              label="Tip poliță *"
              value={value.tipPolita}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                onChange({
                  ...value,
                  tipPolita: event.target.value as StareDosarAsigurare["tipPolita"],
                })
              }
              options={[
                { label: 'CASCO', value: 'CASCO' },
                { label: 'RCA', value: 'RCA' }
              ]}
            />
          </div>

          <div>
            <SelectField
              id="select-status-dosar"
              label="Status aprobare *"
              value={value.statusAprobare}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                onChange({
                  ...value,
                  statusAprobare: event.target.value as StatusDosar,
                })
              }
              options={statusuriDosar.map(s => ({ label: s, value: s }))}
            />
          </div>

          <div>
            <Field
              id="input-data-constatare-dosar"
              label="Data constatării *"
              type="date"
              value={value.dataConstatare}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onChange({ ...value, dataConstatare: event.target.value })
              }
              error={campuriCuEroare.dataConstatare ? "Câmp obligatoriu" : undefined}
            />
          </div>

          <div>
            <Field
              id="input-referinta-asigurator-dosar"
              label="Referință asigurator *"
              value={value.numarReferintaAsigurator}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onChange({ ...value, numarReferintaAsigurator: event.target.value })
              }
              placeholder="Ex: ALT-CASCO-88214"
              error={campuriCuEroare.numarReferintaAsigurator ? "Câmp obligatoriu" : undefined}
            />
          </div>

          <div>
            <SelectField
              id="select-inspector-dosar"
              label="Inspector daună *"
              value={value.idInspector ?? ""}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                const id = event.target.value === "" ? null : Number(event.target.value);
                const inspector = inspectori.find(i => i.idAngajat === id);
                onChange({
                  ...value,
                  idInspector: id,
                  inspectorDauna: inspector ? `${inspector.nume} ${inspector.prenume}` : ""
                });
              }}
              options={[
                { label: 'Selectează inspector', value: '' },
                ...inspectori.map(i => ({ label: `${i.nume} ${i.prenume}`, value: i.idAngajat.toString() }))
              ]}
              error={campuriCuEroare.inspectorDauna ? "Câmp obligatoriu" : undefined}
            />
          </div>

          <div>
            <Field
              id="input-suma-aprobata-dosar"
              label="Sumă aprobată *"
              type="number"
              min="0"
              step="0.01"
              value={value.sumaAprobata}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  sumaAprobata: event.target.value === "" ? "" : Number(event.target.value),
                })
              }
              error={campuriCuEroare.sumaAprobata ? "Sumă invalidă" : undefined}
            />
          </div>

          <div>
            <Field
              id="input-franciza-dosar"
              label="Franciză"
              type="number"
              min="0"
              step="0.01"
              value={value.franciza}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  franciza: event.target.value === "" ? "" : Number(event.target.value),
                })
              }
            />
          </div>

          <div className="md:col-span-2 xl:col-span-4">
            <TextareaField
              id="input-observatii-dosar"
              label="Observații dosar"
              value={value.observatiiDauna}
              rows={3}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                onChange({ ...value, observatiiDauna: event.target.value })
              }
              placeholder="Mențiuni despre constatare, limitări de aprobare sau pașii următori."
            />
          </div>
        </div>
      )}
    </div>
  );
}
