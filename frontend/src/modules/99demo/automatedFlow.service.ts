import { wait } from "./demoHelper";
import { simulateClick, simulateTyping, simulateSelect, simulateSelectByLabel } from "./visualFlowRunner";
import { apiFetch } from "../../lib/api";

export interface TestStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
}

const navigate = (path: string) => {
  if ((window as any).__demoNavigate) {
    (window as any).__demoNavigate(path);
  }
};

export async function runAutomatedTestFlow(
  onProgress: (steps: TestStep[]) => void,
  onLog: (msg: string) => void,
  pauseRef: React.MutableRefObject<boolean>,
  speedRef: React.MutableRefObject<number>,
  stopRef: React.MutableRefObject<boolean>
) {
  const steps: TestStep[] = [
    { id: 'cleanup', label: 'Curățare Bază de Date', status: 'pending' },
    { id: 'piese', label: 'Catalog: Piese', status: 'pending' },
    { id: 'manopera', label: 'Catalog: Manoperă', status: 'pending' },
    { id: 'kituri', label: 'Catalog: Kit-uri', status: 'pending' },
    { id: 'asiguratori', label: 'Entități: Asigurători', status: 'pending' },
    { id: 'angajati', label: 'Entități: Angajați', status: 'pending' },
    { id: 'clienti', label: 'Entități: Clienți', status: 'pending' },
    { id: 'vehicule', label: 'Entități: Vehicule', status: 'pending' },
  ];

  const updateStatus = (id: string, status: TestStep['status'], message?: string) => {
    const step = steps.find(s => s.id === id);
    if (step) {
      step.status = status;
      if (message) step.message = message;
    }
    onProgress([...steps]);
  };

  // --- DATE CATALOG ---
  const pieseDeAdaugat = [
    { cod: 'FIL-UL-BOSCH', denumire: 'Filtru Ulei Bosch Premium', prod: 'Bosch', cat: 'Filtre', pret: 55.50, stoc: '12', gar: '24' },
    { cod: 'PL-FR-BREM', denumire: 'Plăcuțe Frână Brembo', prod: 'Brembo', cat: 'Frânare', pret: 245.00, stoc: '8', gar: '12' },
    { cod: 'UL-MOT-CAST', denumire: 'Ulei Motor Castrol 5W30', prod: 'Castrol', cat: 'Lichide', pret: 185.00, stoc: '20', gar: '6' },
    { cod: 'DISC-FR-ATE', denumire: 'Disc Frână ATE Ventilate', prod: 'ATE', cat: 'Frânare', pret: 320.00, stoc: '4', gar: '24' },
    { cod: 'AMB-LUK-REP', denumire: 'Kit Ambreiaj LUK RepSet', prod: 'LUK', cat: 'Transmisie', pret: 890.00, stoc: '2', gar: '24' },
  ];
  const manoperaDeAdaugat = [
    { cod: 'MAN-REV-U', denumire: 'Revizie Ulei + Filtre', cat: 'Mecanică Ușoară', ore: '1.5' },
    { cod: 'MAN-INL-P', denumire: 'Înlocuire Plăcuțe Frână', cat: 'Mecanică Ușoară', ore: '1.0' },
    { cod: 'MAN-DIAG-E', denumire: 'Diagnoză Electronică', cat: 'Diagnoză', ore: '0.5' },
  ];

  const kituriDeCreat = [
    {
      cod: 'KIT-REVIZIE-P',
      nume: 'Kit Revizie Premium (Ulei + Filtru)',
      red: '10',
      piese: [
        { cod: 'FIL-UL-BOSCH', qty: '1' },
        { cod: 'UL-MOT-CAST', qty: '5' }
      ]
    },
    {
      cod: 'KIT-FRANA-A',
      nume: 'Kit Frânare Față (Discuri + Plăcuțe)',
      red: '15',
      piese: [
        { cod: 'DISC-FR-ATE', qty: '2' },
        { cod: 'PL-FR-BREM', qty: '1' }
      ]
    }
  ];

  // --- DATE ENTITĂȚI ---
  const asiguratori = [
    { den: 'Omniasig VIG', cui: 'RO123456', reg: 'J40/1/2000', tel: '0219999', email: 'daune@omniasig.ro', iban: 'RO01OMNI1234567890123456', adr: 'Aleea Alexandru nr 51, Sector 1, Bucuresti' },
    { den: 'Allianz-Tiriac', cui: 'RO654321', reg: 'J40/2/2001', tel: '0218888', email: 'daune@allianz.ro', iban: 'RO02ALIA1234567890123456', adr: 'Str. Buzesti nr 82-94, Bucuresti' }
  ];

  const angajati = [
    { nume: 'Popescu', pren: 'Dan', cnp: '1800101123456', tel: '0722111222', rol: 'Manager', extra: 'Management', cost: '100', spor: '10' },
    { nume: 'Ionescu', pren: 'Gelu', cnp: '1850505123456', tel: '0722333444', rol: 'Mecanic', extra: 'Mecanică Grea', inspector: true, cost: '65' },
    { nume: 'Vasilescu', pren: 'Mihai', cnp: '1900808123456', tel: '0722555666', rol: 'Mecanic', extra: 'Mecanică Ușoară', cost: '55' },
    { nume: 'Georgescu', pren: 'Ana', cnp: '2900303123456', tel: '0722777888', rol: 'Receptioner', extra: 'Birou 1', cost: '45' },
    { nume: 'Marin', pren: 'Elena', cnp: '2850404123456', tel: '0722999000', rol: 'Contabil', extra: 'Financiar', cost: '60' }
  ];

  const clienti = [
    { tip: 'PF', nume: 'Dumitru', pren: 'Ion', iden: '1750101998877', ci: 'RX123456', tel: '0744111222', adr: 'Str. Libertatii 10, Bucuresti' },
    { tip: 'PF', nume: 'Constantinescu', pren: 'Radu', iden: '1820202112233', ci: 'RX654321', tel: '0744333444', adr: 'Str. Victoriei 20, Ploiesti' },
    { tip: 'PJ', nume: 'Logistics Pro SRL', iden: 'RO998877', reg: 'J40/123/2010', tel: '0217778899', adr: 'Sos. Centurii 50, Ilfov' }
  ];

  const vehicule = [
    { nr: 'B-01-AAA', marca: 'VW', model: 'Golf 7', vin: 'WVWZZZ1KXXXXXXXX1', client: 'Dumitru Ion' },
    { nr: 'B-02-BBB', marca: 'BMW', model: '320d', vin: 'WBA31XXXXXXXXXXX2', client: 'Constantinescu Radu' },
    { nr: 'B-03-CCC', marca: 'Mercedes', model: 'Sprinter', vin: 'WDB906XXXXXXXXXX3', client: 'Logistics Pro SRL' },
    { nr: 'B-04-DDD', marca: 'Mercedes', model: 'Vito', vin: 'WDF447XXXXXXXXXX4', client: 'Logistics Pro SRL' },
    { nr: 'B-05-EEE', marca: 'Ford', model: 'Focus', vin: 'WF0XXXXXXXXXXXXX5', client: 'Dumitru Ion' }
  ];

  try {
    // --- PAS 0: CLEANUP ---
    updateStatus('cleanup', 'loading', 'Se elimină datele...');
    await apiFetch('/demo/cleanup', { method: 'DELETE' });
    await wait(1000, speedRef, pauseRef, stopRef);
    updateStatus('cleanup', 'success');

    // --- PAS 1: PIESE ---
    updateStatus('piese', 'loading');
    navigate('catalog-piese');
    await wait(800, speedRef, pauseRef, stopRef);
    for (const p of pieseDeAdaugat) {
      await simulateClick('btn-add-piesa', speedRef, pauseRef, stopRef);
      await wait(300, speedRef, pauseRef, stopRef);
      await simulateTyping('input-cod-piesa', p.cod, speedRef, pauseRef, stopRef);
      await simulateTyping('input-denumire-piesa', p.denumire, speedRef, pauseRef, stopRef);
      await simulateTyping('input-producator-piesa', p.prod, speedRef, pauseRef, stopRef);
      await simulateSelect('select-categorie', p.cat, speedRef, pauseRef, stopRef);
      await simulateTyping('input-pret-baza', p.pret.toString(), speedRef, pauseRef, stopRef);
      await simulateTyping('input-stoc', p.stoc, speedRef, pauseRef, stopRef);
      await simulateSelect('select-tip-piesa', 'NOUA', speedRef, pauseRef, stopRef);
      await simulateTyping('input-garantie', p.gar, speedRef, pauseRef, stopRef);
      await simulateClick('btn-save-piesa', speedRef, pauseRef, stopRef);
      await wait(500, speedRef, pauseRef, stopRef);
    }
    updateStatus('piese', 'success');

    // --- PAS 2: MANOPERA ---
    updateStatus('manopera', 'loading');
    navigate('catalog-manopera');
    await wait(800, speedRef, pauseRef, stopRef);
    for (const m of manoperaDeAdaugat) {
      await simulateClick('btn-add-manopera', speedRef, pauseRef, stopRef);
      await wait(300, speedRef, pauseRef, stopRef);
      await simulateTyping('input-cod-manopera', m.cod, speedRef, pauseRef, stopRef);
      await simulateTyping('input-denumire-manopera', m.denumire, speedRef, pauseRef, stopRef);
      await simulateSelect('select-categorie-manopera', m.cat, speedRef, pauseRef, stopRef);
      await simulateTyping('input-durata-manopera', m.ore, speedRef, pauseRef, stopRef);
      await simulateClick('btn-save-manopera', speedRef, pauseRef, stopRef);
      await wait(500, speedRef, pauseRef, stopRef);
    }
    updateStatus('manopera', 'success');

    // --- PAS 3: KITURI ---
    updateStatus('kituri', 'loading');
    navigate('catalog-kituri');
    await wait(800, speedRef, pauseRef, stopRef);
    for (const k of kituriDeCreat) {
      await simulateClick('btn-add-kit', speedRef, pauseRef, stopRef);
      await wait(600, speedRef, pauseRef, stopRef);
      await simulateTyping('input-cod-kit', k.cod, speedRef, pauseRef, stopRef);
      await simulateTyping('input-denumire-kit', k.nume, speedRef, pauseRef, stopRef);
      await simulateTyping('input-reducere-kit', k.red, speedRef, pauseRef, stopRef);
      for (let j = 0; j < k.piese.length; j++) {
        const kp = k.piese[j];
        await simulateClick('btn-add-componenta', speedRef, pauseRef, stopRef);
        await wait(1000, speedRef, pauseRef, stopRef);
        await simulateSelectByLabel(`select-piesa-${j}`, kp.cod, speedRef, pauseRef, stopRef);
        await simulateTyping(`input-cantitate-${j}`, kp.qty, speedRef, pauseRef, stopRef);
      }
      await simulateClick('btn-save-kit', speedRef, pauseRef, stopRef);
      await wait(1500, speedRef, pauseRef, stopRef);
    }
    updateStatus('kituri', 'success');

    // --- PAS 4: ASIGURATORI ---
    updateStatus('asiguratori', 'loading');
    navigate('entitati-asiguratori');
    await wait(800, speedRef, pauseRef, stopRef);
    for (const a of asiguratori) {
      await simulateClick('btn-add-asigurator', speedRef, pauseRef, stopRef);
      await wait(400, speedRef, pauseRef, stopRef);
      await simulateTyping('input-denumire-asigurator', a.den, speedRef, pauseRef, stopRef);
      await simulateTyping('input-cui-asigurator', a.cui, speedRef, pauseRef, stopRef);
      await simulateTyping('input-regcom-asigurator', a.reg, speedRef, pauseRef, stopRef);
      await simulateTyping('input-email-asigurator', a.email, speedRef, pauseRef, stopRef);
      await simulateTyping('input-telefon-asigurator', a.tel, speedRef, pauseRef, stopRef);
      await simulateTyping('input-iban-asigurator', a.iban, speedRef, pauseRef, stopRef);
      await simulateTyping('input-adresa-asigurator', a.adr, speedRef, pauseRef, stopRef);
      await simulateClick('btn-save-asigurator', speedRef, pauseRef, stopRef);
      await wait(600, speedRef, pauseRef, stopRef);
    }
    updateStatus('asiguratori', 'success');

    // --- PAS 5: ANGAJATI ---
    updateStatus('angajati', 'loading');
    navigate('entitati-angajati');
    await wait(800, speedRef, pauseRef, stopRef);
    for (const ang of angajati) {
      await simulateClick('btn-add-angajat', speedRef, pauseRef, stopRef);
      await wait(400, speedRef, pauseRef, stopRef);
      await simulateTyping('input-nume-angajat', ang.nume, speedRef, pauseRef, stopRef);
      await simulateTyping('input-prenume-angajat', ang.pren, speedRef, pauseRef, stopRef);
      await simulateTyping('input-cnp-angajat', ang.cnp, speedRef, pauseRef, stopRef);
      await simulateTyping('input-telefon-angajat', ang.tel, speedRef, pauseRef, stopRef);
      await simulateSelect('select-rol-angajat', ang.rol, speedRef, pauseRef, stopRef);
      await wait(300, speedRef, pauseRef, stopRef);
      await simulateTyping('input-cost-angajat', ang.cost, speedRef, pauseRef, stopRef);
      if (ang.rol === 'Mecanic') {
        if (ang.inspector) await simulateClick('input-este-inspector', speedRef, pauseRef, stopRef);
        await simulateTyping('input-specializare-angajat', ang.extra, speedRef, pauseRef, stopRef);
      } else if (ang.rol === 'Manager') {
        await simulateTyping('input-departament-angajat', ang.extra, speedRef, pauseRef, stopRef);
        await simulateTyping('input-spor-angajat', ang.spor || '0', speedRef, pauseRef, stopRef);
      } else if (ang.rol === 'Receptioner') {
        await simulateTyping('input-birou-angajat', ang.extra, speedRef, pauseRef, stopRef);
      } else {
        await simulateTyping('input-departament-angajat', ang.extra, speedRef, pauseRef, stopRef);
      }
      await simulateClick('btn-save-angajat', speedRef, pauseRef, stopRef);
      await wait(600, speedRef, pauseRef, stopRef);
    }
    updateStatus('angajati', 'success');

    // --- PAS 6: CLIENTI ---
    updateStatus('clienti', 'loading');
    navigate('entitati-clienti');
    await wait(800, speedRef, pauseRef, stopRef);
    for (const c of clienti) {
      await simulateClick('btn-add-client', speedRef, pauseRef, stopRef);
      await wait(400, speedRef, pauseRef, stopRef);
      await simulateSelect('select-tip-client', c.tip, speedRef, pauseRef, stopRef);
      await wait(300, speedRef, pauseRef, stopRef);
      await simulateTyping('input-nume-client', c.nume, speedRef, pauseRef, stopRef);
      if (c.tip === 'PF') {
        await simulateTyping('input-prenume-client', c.pren!, speedRef, pauseRef, stopRef);
        await simulateTyping('input-cnp-client', c.iden, speedRef, pauseRef, stopRef);
        await simulateTyping('input-serie-ci-client', c.ci!, speedRef, pauseRef, stopRef);
      } else {
        await simulateTyping('input-cui-client', c.iden, speedRef, pauseRef, stopRef);
        await simulateTyping('input-regcom-client', c.reg!, speedRef, pauseRef, stopRef);
      }
      await simulateTyping('input-telefon-client', c.tel, speedRef, pauseRef, stopRef);
      await simulateTyping('input-adresa-client', c.adr, speedRef, pauseRef, stopRef);
      await simulateClick('btn-save-client', speedRef, pauseRef, stopRef);
      await wait(700, speedRef, pauseRef, stopRef);
    }
    updateStatus('clienti', 'success');

    // --- PAS 7: VEHICULE ---
    updateStatus('vehicule', 'loading');
    navigate('entitati-vehicule');
    await wait(800, speedRef, pauseRef, stopRef);
    for (const v of vehicule) {
      await simulateClick('btn-add-vehicul', speedRef, pauseRef, stopRef);
      await wait(500, speedRef, pauseRef, stopRef);
      await simulateTyping('input-nr-vehicul', v.nr, speedRef, pauseRef, stopRef);
      await simulateTyping('input-marca-vehicul', v.marca, speedRef, pauseRef, stopRef);
      await simulateTyping('input-model-vehicul', v.model, speedRef, pauseRef, stopRef);
      await simulateTyping('input-vin-vehicul', v.vin, speedRef, pauseRef, stopRef);
      await simulateSelectByLabel('select-client-vehicul', v.client, speedRef, pauseRef, stopRef);
      await simulateClick('btn-save-vehicul', speedRef, pauseRef, stopRef);
      await wait(1000, speedRef, pauseRef, stopRef);
    }
    updateStatus('vehicule', 'success');

    onLog("SUCCES: Tot sistemul a fost populat corect!");

  } catch (error) {
    if (error instanceof Error && error.message === "STOPPED") return;
    onLog(`EROARE: ${error instanceof Error ? error.message : "Eroare necunoscută"}`);
    const currentStep = steps.find(s => s.status === 'loading');
    if (currentStep) updateStatus(currentStep.id, 'error', error instanceof Error ? error.message : "Eroare");
  }
}
