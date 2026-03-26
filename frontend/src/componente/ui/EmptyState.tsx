import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/cn';

// `EmptyState` este afișat atunci când o listă sau o secțiune nu are încă date.
// Componenta oferă un mesaj mai prietenos decât un tabel gol și sugerează
// utilizatorului care este următorul pas.
interface EmptyStateProps {
  className?: string;
  description: string;
  icon?: ReactNode;
  title: string;
}

export function EmptyState({
  className,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center',
        className,
      )}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
