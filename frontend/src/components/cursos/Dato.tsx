import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DatoProps {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Clase de color del ícono */
  acento?: string;
}

/** Celda de información: etiqueta pequeña arriba y valor abajo. */
export function Dato({
  icon: Icon,
  label,
  value,
  acento = 'text-brand-primary',
}: DatoProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-bg-primary/60 border border-border px-3 py-2.5 min-w-0">
      <Icon size={16} className={cn('mt-0.5 shrink-0', acento)} />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted leading-none mb-1">
          {label}
        </p>
        <p className="text-sm font-bold text-text-primary leading-tight truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
