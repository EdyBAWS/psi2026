import { CheckCircle2, Circle, Loader2, AlertCircle, Rocket, Zap, Database, ArrowRight, Lock } from 'lucide-react';
import { useDemo } from './DemoContext';

export default function AutomatedFlow({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const { isRunning, isPaused, steps, visualLog, startDemo, stopDemo } = useDemo();

  return (
    <div className="space-y-8 pb-20">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-12 rounded-[2.5rem] shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 translate-x-12">
          <Rocket size={320} className="text-white" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">E2E Business Simulation</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-black text-white tracking-tighter mb-4 flex items-center gap-4">
                <Zap className="text-amber-400 fill-amber-400" size={48} />
                Simulator Flux Complet
              </h1>
              <p className="text-indigo-200/80 text-xl font-medium leading-relaxed">
                Scenariu E2E: Catalog (7 piese, 2 kituri, 5 manopere), Resurse (5 angajați incl. Inspector, 2 asiguratori), 
                CRM (3 clienți, 5 vehicule), Operațional (3 recepții variate) și Facturare cu Penalități/Discount.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => startDemo(onNavigate)}
                disabled={isRunning}
                className={`
                  group relative flex items-center gap-4 px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300
                  ${isRunning 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                    : 'bg-white text-indigo-900 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.2)] border-none'}
                `}
              >
                {isRunning ? <Loader2 className="animate-spin" /> : <Rocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                {isRunning ? 'SIMULARE ÎN CURS...' : 'PORNEȘTE SIMULAREA'}
              </button>
              
              {isRunning && (
                <button 
                  onClick={stopDemo}
                  className="px-6 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold hover:bg-rose-500/20 transition-all"
                >
                  OPREȘTE FORȚAT
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PROGRESS LIST */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 min-h-[500px]">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
                    Stadiu Execuție
                  </span>
                  {isRunning && !isPaused && (
                    <span title="Interfață Blocată">
                      <Lock size={12} className="text-rose-500" />
                    </span>
                  )}
                </div>
                <span className="text-xl font-black text-slate-800">
                  {Math.round((steps.filter(s => s.status === 'success').length / (steps.length || 1)) * 100)}% Complet
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {steps.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <Database size={48} strokeWidth={1.5} className="opacity-20" />
                  <p className="text-sm font-medium">Așteptare inițializare test...</p>
                </div>
              ) : (
                steps.map((step) => (
                  <div 
                    key={step.id}
                    className={`
                      flex items-center justify-between p-4 rounded-2xl border transition-all duration-300
                      ${step.status === 'loading' ? 'bg-indigo-50 border-indigo-200 scale-[1.01] shadow-md' : 'bg-white border-slate-100'}
                      ${step.status === 'success' ? 'opacity-80' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                        ${step.status === 'success' ? 'bg-emerald-100 text-emerald-600' : ''}
                        ${step.status === 'loading' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}
                        ${step.status === 'error' ? 'bg-rose-100 text-rose-600' : ''}
                      `}>
                        {step.status === 'success' && <CheckCircle2 size={20} />}
                        {step.status === 'loading' && <Loader2 size={20} className="animate-spin" />}
                        {step.status === 'pending' && <Circle size={20} />}
                        {step.status === 'error' && <AlertCircle size={20} />}
                      </div>
                      <div>
                        <p className={`font-bold ${step.status === 'loading' ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {step.label}
                        </p>
                        {step.message && <p className="text-xs text-slate-500 mt-0.5">{step.message}</p>}
                      </div>
                    </div>
                    {step.status === 'loading' && <ArrowRight className="text-indigo-400 animate-bounce-x" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* LOG CONSOLE */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-[2rem] shadow-2xl p-6 h-full flex flex-col border border-white/5">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <PenLine className="text-amber-400" size={18} />
              <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Console Output</span>
            </div>
            <div className="flex-1 font-mono text-[11px] leading-relaxed text-indigo-300/70 overflow-auto scrollbar-hide max-h-[600px]">
              <pre className="whitespace-pre-wrap">
                {visualLog || "// Console is empty. Waiting for execution..."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PenLine(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 5 5"/><path d="m8.5 8.5 1 1"/></svg>
  );
}
