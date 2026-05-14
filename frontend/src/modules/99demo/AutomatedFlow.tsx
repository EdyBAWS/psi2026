import { useState } from 'react';
import { Play, CheckCircle2, Circle, Loader2, AlertCircle, Rocket, Zap, Database, ArrowRight } from 'lucide-react';
import { runAutomatedTestFlow, type TestStep } from './automatedFlow.service';
import { runVisualScript } from './visualFlowRunner';

export default function AutomatedFlow({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [visualLog, setVisualLog] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const startTest = async () => {
    setIsRunning(true);
    setIsFinished(false);
    
    // 1. Rulează partea vizuală dacă avem funcția de navigare
    if (onNavigate) {
      await runVisualScript(setVisualLog, onNavigate);
    }
    
    // 2. Rulează logica API de fundal pentru a asigura tranzacțiile
    await runAutomatedTestFlow(setSteps);
    
    setIsRunning(false);
    setIsFinished(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header cu Gradient */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-10 text-white relative">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Rocket className="w-40 h-40 rotate-12 text-indigo-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/30">
                Stress Test & QA
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-3 flex items-center gap-4">
              <Zap className="h-10 w-10 text-yellow-400 fill-yellow-400" />
              Simulator End-to-End
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl text-lg leading-relaxed">
              Validare completă a fluxului de business: Catalog, Resurse Umane, CRM, 
              Dosare RCA și Tehnică, finalizând cu facturarea tranzacțiilor în baza de date.
            </p>
          </div>
        </div>

        <div className="p-10 bg-slate-50/50">
          {!isRunning && !isFinished && steps.length === 0 && (
            <div className="py-20 text-center space-y-8 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-indigo-50 text-indigo-600 mb-2 relative">
                <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20" />
                <Play className="w-12 h-12 fill-indigo-600 relative z-10" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pregătit pentru simularea completă?</h2>
                <p className="text-slate-500 max-w-lg mx-auto text-lg">
                  Acest proces va genera peste 20 de înregistrări sincronizate pentru a valida 
                  integritatea sistemului PSI-2026.
                </p>
              </div>
              <button
                onClick={startTest}
                className="group relative overflow-hidden bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Lansează Scenariul Complet <ArrowRight className="w-5 h-5" />
                </span>
              </button>
            </div>
          )}

          {(isRunning || steps.length > 0) && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Progress Tracker */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
                    Progresul testării automate
                  </span>
                  <span className="text-xl font-black text-slate-800">
                    {Math.round((steps.filter(s => s.status === 'success').length / (steps.length || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200 p-1">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                    style={{ width: `${(steps.filter(s => s.status === 'success').length / (steps.length || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Consola Vizuală */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-800 h-[550px] flex flex-col">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Macro Runner</h3>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto font-mono text-xs space-y-4 text-indigo-300 custom-scrollbar pr-4">
                      {visualLog ? (
                        <div className="flex gap-3 animate-in fade-in slide-in-from-left-4">
                          <span className="text-emerald-500 font-bold">{'>'}</span>
                          <p className="leading-relaxed text-indigo-100">{visualLog}</p>
                        </div>
                      ) : (
                        <p className="text-slate-600 italic text-center py-20">Așteptare interfață vizuală...</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Baza de Date */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-[550px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                          <Database className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Tranzacții API</h3>
                      </div>
                      {isRunning && (
                        <span className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full animate-pulse border border-indigo-100">
                          <Loader2 className="h-3 w-3 animate-spin" /> PROCESARE DB
                        </span>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-4 space-y-3 custom-scrollbar">
                      {steps.map((step) => (
                        <div 
                          key={step.id}
                          className={`p-5 rounded-[1.5rem] border transition-all duration-300 flex items-center justify-between ${
                            step.status === 'success' ? 'bg-emerald-50/50 border-emerald-100' : 
                            step.status === 'loading' ? 'bg-indigo-50 border-indigo-100 ring-1 ring-indigo-200' :
                            step.status === 'error' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-5">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${
                              step.status === 'success' ? 'bg-emerald-500 text-white' : 
                              step.status === 'loading' ? 'bg-indigo-600 text-white' :
                              step.status === 'error' ? 'bg-rose-500 text-white' : 'bg-white text-slate-300 border border-slate-200'
                            }`}>
                              {step.status === 'success' ? <CheckCircle2 className="h-6 w-6" /> :
                               step.status === 'loading' ? <Loader2 className="h-6 w-6 animate-spin" /> :
                               step.status === 'error' ? <AlertCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                            </div>
                            <div>
                              <p className={`text-base font-black ${step.status === 'success' ? 'text-emerald-900' : 'text-slate-800'}`}>
                                {step.label}
                              </p>
                              {step.message && (
                                <p className={`text-xs font-medium mt-0.5 ${step.status === 'error' ? 'text-rose-600' : 'text-slate-500'}`}>
                                  {step.message}
                                </p>
                              )}
                            </div>
                          </div>
                          {step.status === 'success' && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {isFinished && (
                <div className="flex flex-col items-center gap-6 pt-6">
                  <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-200 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5" /> Simulare Finalizată cu Succes
                  </div>
                  <button
                    onClick={startTest}
                    className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-all border-b-2 border-transparent hover:border-indigo-200 pb-1"
                  >
                    Reia scenariul de testare
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-10 flex items-center justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
        <span>PSI-2026 Enterprise Validation Engine</span>
        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        <span>Stable Build V1.0.8</span>
      </div>
    </div>
  );
}
