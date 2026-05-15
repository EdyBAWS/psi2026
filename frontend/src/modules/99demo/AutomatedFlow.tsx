import { CheckCircle2, Loader2, AlertCircle, Rocket, Zap, Database, Lock, Terminal, Activity, Play } from 'lucide-react';
import { useDemo } from './DemoContext';
import { cn } from '../../lib/cn';

export default function AutomatedFlow({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const { isRunning, isPaused, steps, visualLog, startDemo, stopDemo } = useDemo();

  const completedCount = steps.filter(s => s.status === 'success').length;
  const progressPercent = Math.round((completedCount / (steps.length || 1)) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Activity className="text-indigo-600" size={32} />
            Simulator Business Flow
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Testează întreg fluxul operațional și financiar într-un mediu controlat.
          </p>
        </div>

        {isRunning && (
          <button
            onClick={stopDemo}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-sm border border-rose-100 hover:bg-rose-100 transition-all shadow-sm"
          >
            <AlertCircle size={16} />
            OPREȘTE SIMULAREA
          </button>
        )}
      </div>

      {/* SCENARIOS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScenarioCard
          icon={<Database className="text-blue-500" />}
          title="1. Setup Date"
          description="Populare automată cu 7 piese, 2 kituri, 5 manopere, clienți și vehicule."
          onClick={() => startDemo('setup', onNavigate)}
          isRunning={isRunning}
          color="blue"
        />
        <ScenarioCard
          icon={<Zap className="text-indigo-500" />}
          title="2. Operațional"
          description="3 recepții variate: PJ-RCA, PJ-Normal (flotă) și PF-CASCO."
          onClick={() => startDemo('operational', onNavigate)}
          isRunning={isRunning}
          color="indigo"
        />
        <ScenarioCard
          icon={<CheckCircle2 className="text-emerald-500" />}
          title="3. Finalizare"
          description="Generare facturi cu discount/penalizări și încasare automată."
          onClick={() => startDemo('incasari', onNavigate)}
          isRunning={isRunning}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* EXECUTION PROGRESS */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                  <Activity size={18} className="text-indigo-600" />
                </div>
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs">Stadiu Execuție</h3>
              </div>
              <div className="flex items-center gap-4">
                {isRunning && !isPaused && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100 animate-pulse">
                    <Lock size={10} />
                    UI Blocat
                  </div>
                )}
                <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {progressPercent}%
                </span>
              </div>
            </div>

            <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide">
              {steps.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-slate-400 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Rocket size={40} className="opacity-20" />
                  </div>
                  <h4 className="font-bold text-slate-600 uppercase tracking-widest text-xs mb-2">Sistem în așteptare</h4>
                  <p className="text-sm max-w-xs">Selectează un scenariu de mai sus pentru a începe simularea vizuală.</p>
                </div>
              ) : (
                steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={cn(
                      "group flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 border",
                      step.status === 'loading' ? 'bg-indigo-50/50 border-indigo-200 shadow-sm scale-[1.02]' : 'bg-white border-transparent hover:bg-slate-50',
                      step.status === 'success' ? 'opacity-60' : ''
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all shadow-sm",
                      step.status === 'success' ? 'bg-emerald-500 text-white' : '',
                      step.status === 'loading' ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400',
                      step.status === 'error' ? 'bg-rose-500 text-white' : ''
                    )}>
                      {step.status === 'success' ? <CheckCircle2 size={18} /> :
                        step.status === 'loading' ? <Loader2 size={18} className="animate-spin" /> :
                          step.status === 'error' ? <AlertCircle size={18} /> :
                            <span className="text-xs font-bold">{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={cn("font-bold text-sm", step.status === 'loading' ? 'text-indigo-900' : 'text-slate-700')}>
                          {step.label}
                        </h4>
                        {step.status === 'loading' && (
                          <div className="flex gap-0.5">
                            <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce" />
                          </div>
                        )}
                      </div>
                      {step.message && <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{step.message}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* CONSOLE LOGS */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 rounded-3xl shadow-2xl h-full flex flex-col border border-slate-800 overflow-hidden min-h-[600px]">
            <div className="px-6 py-4 border-b border-white/5 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Console Output</span>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <div className="w-2 h-2 rounded-full bg-slate-700" />
              </div>
            </div>
            <div className="flex-1 p-6 font-mono text-[11px] leading-relaxed text-emerald-400/80 overflow-auto scrollbar-hide">
              <pre className="whitespace-pre-wrap">
                {visualLog || "// Terminal ready. Waiting for events..."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ icon, title, description, onClick, isRunning, color }: any) {
  const colorMap: any = {
    blue: "hover:border-blue-200 hover:bg-blue-50/30 text-blue-600 bg-blue-50",
    indigo: "hover:border-indigo-200 hover:bg-indigo-50/30 text-indigo-600 bg-indigo-50",
    emerald: "hover:border-emerald-200 hover:bg-emerald-50/30 text-emerald-600 bg-emerald-50"
  };

  return (
    <button
      onClick={onClick}
      disabled={isRunning}
      className={cn(
        "group p-6 rounded-3xl border border-slate-200 bg-white text-left transition-all duration-300 shadow-sm relative overflow-hidden",
        isRunning ? "opacity-50 cursor-not-allowed" : "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
      )}
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", colorMap[color])}>
        {isRunning ? <Loader2 className="animate-spin" size={24} /> : icon}
      </div>
      <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2 flex items-center justify-between">
        {title}
        <Play size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
      </h3>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">
        {description}
      </p>
    </button>
  );
}
