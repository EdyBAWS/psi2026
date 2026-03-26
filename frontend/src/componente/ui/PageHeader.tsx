import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

// `PageHeader` standardizează antetul paginilor și al secțiunilor mari.
// În stânga punem titlul și descrierea, iar în dreapta putem trimite butoane
// sau alte acțiuni prin prop-ul `actions`.
interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  actions?: ReactNode;
  description?: string;
  title: string;
}

export function PageHeader({
  actions,
  className,
  description,
  title,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
      {...props}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
