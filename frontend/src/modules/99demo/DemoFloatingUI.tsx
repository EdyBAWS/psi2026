import { useState } from 'react';
import { Play, Pause, Square, ChevronDown, ChevronUp, Terminal, Activity, Loader2, AlertCircle } from 'lucide-react';
import { useDemo } from './DemoContext';
import { cn } from '../../lib/cn';

export default function DemoFloatingUI() {
  const { isRunning, isPaused, steps, visualLog, speedMultiplier, togglePause, stopDemo, setSpeed } = useDemo();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showConsole, setShowConsole] = useState(false);

  if (!isRunning && !steps.some(s => s.status !== 'pending')) return null;

  const currentStep = steps.find(s => s.status === 'loading') || steps.find(s => s.status === 'error');
  const completedCount = steps.filter(s => s.status === 'success').length;
  const progress = (completedCount / (steps.length || 1)) * 100;

  return (
    <div className={cn(
      "fixed bottom-8 right-8 z-[10000] transition-all duration-500 ease-in-out",
      isExpanded ? "w-96" : "w-auto"
    )}>
      {/* MAIN WIDGET */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/20 overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl animate-pulse">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight uppercase">Simulator PSI-2026</h3>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">
                {isRunning ? (isPaused ? 'Pauză' : 'În Execuție') : 'Finalizat'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>

        {isExpanded && (
          <div className="p-6 space-y-6">
            {/* PROGRESS & STATUS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progres Simulator</span>
                <span className="text-sm font-black text-indigo-600">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {currentStep && (
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border animate-in fade-in slide-in-from-bottom-2",
                  currentStep.status === 'error' ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-indigo-50 border-indigo-100 text-indigo-700"
                )}>
                  {currentStep.status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <AlertCircle size={16} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate uppercase tracking-tight">{currentStep.label}</p>
                    {currentStep.message && <p className="text-[10px] opacity-70 font-medium truncate">{currentStep.message}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* CONTROLS */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePause}
                  disabled={!isRunning}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-600 transition-all active:scale-90"
                >
                  {isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
                </button>
                <button
                  onClick={stopDemo}
                  disabled={!isRunning}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition-all active:scale-90"
                >
                  <Square size={20} fill="currentColor" />
                </button>
              </div>

              <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1">
                {[0.5, 1, 2, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black transition-all",
                      speedMultiplier === s ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* CONSOLE TOGGLE */}
            <button 
              onClick={() => setShowConsole(!showConsole)}
              className={cn(
                "w-full py-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black transition-all",
                showConsole ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}
            >
              <Terminal size={14} />
              {showConsole ? 'ASCUNDE CONSOLA' : 'VEZI LOG-URI LIVE'}
            </button>
          </div>
        )}
      </div>

      {/* DETACHED CONSOLE */}
      {isExpanded && showConsole && (
        <div className="absolute bottom-full mb-4 right-0 w-[450px] bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300 origin-bottom-right">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-indigo-400" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Console Output</span>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-rose-500/50" />
              <div className="w-2 h-2 rounded-full bg-amber-500/50" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            </div>
          </div>
          <div className="p-5 h-64 overflow-y-auto scrollbar-hide font-mono text-[11px] leading-relaxed text-indigo-300/80">
            <pre className="whitespace-pre-wrap">
              {visualLog || "// Așteptare execuție..."}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
