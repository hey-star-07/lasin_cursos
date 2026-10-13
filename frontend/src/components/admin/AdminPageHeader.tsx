import type { ReactNode } from 'react';
import { display } from './fonts';

interface AdminPageHeaderProps {
  /** Texto pequeño sobre el título */
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  /** Botones o acciones a la derecha */
  actions?: ReactNode;
  /** Contenido extra bajo el subtítulo (chips, etc.) */
  children?: ReactNode;
}

/** Cabecera con título 3D + gradiente animado, reutilizable en el admin. */
export function AdminPageHeader({
  eyebrow = 'Panel de administración',
  title,
  subtitle,
  actions,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="admin-enter flex items-end justify-between flex-wrap gap-5">
      <div className="min-w-0">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-primary mb-2">
          {eyebrow}
        </p>
        <h1
          className={`${display.className} text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-2`}
        >
          <span className="admin-title-3d inline-block">
            <span className="admin-title-gradient">{title}</span>
          </span>
        </h1>
        {subtitle && (
          <p className="text-lg text-text-secondary">{subtitle}</p>
        )}
        {children}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}