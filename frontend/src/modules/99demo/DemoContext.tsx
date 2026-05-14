import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { runAutomatedTestFlow, runOperationalDemoFlow, runIncasariDemoFlow, type TestStep } from './automatedFlow.service';

interface DemoContextType {
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
  speedMultiplier: number;
  steps: TestStep[];
  visualLog: string;
  startDemo: (type: 'setup' | 'operational' | 'incasari', onNavigate?: (p: string) => void) => Promise<void>;
  togglePause: () => void;
  stopDemo: () => void;
  setSpeed: (speed: number) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [visualLog, setVisualLog] = useState("");

  const pauseRef = useRef(false);
  const speedRef = useRef(1);
  const stopRef = useRef(false);

  useEffect(() => {
    pauseRef.current = isPaused;
    speedRef.current = speedMultiplier;
  }, [isPaused, speedMultiplier]);

  const startDemo = async (type: 'setup' | 'operational' | 'incasari', onNavigate?: (p: string) => void) => {
    setIsRunning(true);
    setIsPaused(false);
    setIsFinished(false);
    stopRef.current = false;
    setSteps([]);
    setVisualLog(`Simulator pornit [Flux: ${type}]...\n`);
    
    // Inject the navigation helper
    if (onNavigate) {
      (window as any).__demoNavigate = onNavigate;
    }

    try {
      let runner;
      if (type === 'setup') runner = runAutomatedTestFlow;
      else if (type === 'operational') runner = runOperationalDemoFlow;
      else runner = runIncasariDemoFlow;
      
      await runner(
        (newSteps) => setSteps(newSteps),
        (msg) => setVisualLog(prev => prev + `> ${msg}\n`),
        pauseRef,
        speedRef,
        stopRef
      );
      setIsFinished(true);
    } catch (err) {
      if (err instanceof Error && err.message === "STOPPED") {
        setVisualLog(prev => prev + "> Simulare oprită de utilizator.\n");
      } else {
        console.error("Demo failed:", err);
        setVisualLog(prev => prev + `> EROARE: ${err instanceof Error ? err.message : 'Eroare necunoscută'}\n`);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const togglePause = () => setIsPaused(prev => !prev);
  const stopDemo = () => {
    stopRef.current = true;
    setIsRunning(false);
    setIsPaused(false);
  };
  const setSpeed = (speed: number) => setSpeedMultiplier(speed);

  return (
    <DemoContext.Provider value={{
      isRunning, isPaused, isFinished, speedMultiplier, steps, visualLog,
      startDemo, togglePause, stopDemo, setSpeed
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used within DemoProvider");
  return context;
}
