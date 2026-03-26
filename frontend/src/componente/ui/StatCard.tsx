import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const statCardVariants = cva('rounded-xl border px-4 py-3', {
  variants: {
    tone: {
      default: 'border-slate-200 bg-slate-50',
      info: 'border-sky-200 bg-sky-50',
      success: 'border-emerald-200 bg-emerald-50',
      warning: 'border-amber-200 bg-amber-50',
      danger: 'border-rose-200 bg-rose-50',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});

interface StatCardProps extends VariantProps<typeof statCardVariants> {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}

export function StatCard({ icon, label, tone, value }: StatCardProps) {
  return (
    <div className={cn(statCardVariants({ tone }))}>
      <div className="flex items-center gap-2">
        {icon ? <div className="text-slate-500">{icon}</div> : null}
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
