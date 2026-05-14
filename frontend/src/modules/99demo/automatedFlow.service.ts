import { wait } from "./demoHelper";
import { simulateClick, simulateTyping, simulateSelect, waitForElementToDisappear } from "./visualFlowRunner";

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
    { id: 'piese', label: 'Adăugare Piesă (Catalog)', status: 'pending' },
  ];

  const updateStatus = (id: string, status: TestStep['status'], message?: string) => {
    const step = steps.find(s => s.id === id);
    if (step) {
      step.status = status;
      if (message) step.message = message;
    }
    onProgress([...steps]);
  };

  try {
    updateStatus('piese', 'loading', 'În execuție...');

    // Pas 1: Navighează pe pagina catalog piese auto
    onLog("> Pas 1: Navigare către Catalog Piese...");
    navigate('catalog-piese');
    await wait(1500, speedRef, pauseRef, stopRef); // Timp generos pentru încărcare

    // Pas 2: Apasă pe buton adaugă piesă
    onLog("> Pas 2: Deschidere formular adăugare...");
    const btnOpened = await simulateClick('btn-add-piesa', speedRef, pauseRef, stopRef);
    if (!btnOpened) throw new Error("Butonul '+ Adaugă Piesă' nu a fost găsit.");
    await wait(800, speedRef, pauseRef, stopRef);

    // Pas 3: Completează câmpurile din formular
    onLog("> Pas 3: Completare date formular (manual)...");
    await simulateTyping('input-cod-piesa', 'FIL-UL-BOSCH', speedRef, pauseRef, stopRef);
    await simulateTyping('input-denumire-piesa', 'Filtru Ulei Bosch Premium', speedRef, pauseRef, stopRef);
    await simulateTyping('input-producator-piesa', 'Bosch', speedRef, pauseRef, stopRef);

    // Categorie
    await simulateSelect('select-categorie', 'Filtre', speedRef, pauseRef, stopRef);

    await simulateTyping('input-pret-baza', '55.50', speedRef, pauseRef, stopRef);
    await simulateTyping('input-stoc', '12', speedRef, pauseRef, stopRef);

    // Tip Piesă (Native select in Piesa.tsx usually has text like 'Nouă')
    await simulateSelect('select-tip-piesa', 'Nouă', speedRef, pauseRef, stopRef);

    // Garanție
    await simulateTyping('Garanție (Luni)', '24', speedRef, pauseRef, stopRef);

    // Pas 4: Apasă pe butonul de jos, ADAUGĂ
    onLog("> Pas 4: Finalizare și Salvare...");
    const btnSave = await simulateClick('button::text("Adaugă")', speedRef, pauseRef, stopRef) ||
      await simulateClick('btn-save-piesa', speedRef, pauseRef, stopRef);

    if (!btnSave) throw new Error("Butonul 'Adaugă' din formular nu a fost găsit.");

    // Așteptăm să se închidă formularul (semn că s-a salvat)
    await waitForElementToDisappear('form', 4000);

    onLog("SUCCES: Piesa a fost adăugată manual!");
    updateStatus('piese', 'success', 'Finalizat cu succes.');

  } catch (error) {
    if (error instanceof Error && error.message === "STOPPED") return;
    onLog(`EROARE: ${error instanceof Error ? error.message : "Eroare necunoscută"}`);
    updateStatus('piese', 'error', error instanceof Error ? error.message : "Eroare");
  }
}
