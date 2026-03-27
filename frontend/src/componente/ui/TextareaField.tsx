import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

// `TextareaField` completează familia de câmpuri comune.
// Îl folosim pentru explicații mai lungi, observații sau descrieri,
// păstrând același stil vizual ca la celelalte componente de formular.
interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  hint?: string;
  label: string;
  wrapperClassName?: string;
}

export function TextareaField({
  className,
  error,
  hint,
  label,
  wrapperClassName,
  ...props
}: TextareaFieldProps) {
  return (
    <div className={cn('space-y-1.5', wrapperClassName)}>
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <textarea
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500',
          error && 'border-rose-300 focus:border-rose-300 focus:ring-rose-500',
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
