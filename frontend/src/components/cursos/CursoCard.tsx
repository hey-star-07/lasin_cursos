import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Monitor, Award, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatearFecha, formatearMonto, truncarTexto } from '@/lib/utils/format';
import type { Curso } from '@/types/curso.types';
import { cn } from '@/lib/utils/cn';

interface CursoCardProps {
  curso: Curso;
  variant?: 'default' | 'compact';
}

export function CursoCard({ curso, variant = 'default' }: CursoCardProps) {
  const isCompact = variant === 'compact';

  return (
    <Link
      href={`/cursos/${curso.id}`}
      className={cn(
        'group block bg-bg-secondary border border-border rounded-2xl overflow-hidden',
        'transition-all duration-300',
        'hover:border-brand-primary/50 hover:shadow-2xl hover:shadow-brand-primary/20 hover:-translate-y-2'
      )}
    >
      <div className={cn('relative overflow-hidden', isCompact ? 'h-48' : 'h-56')}>
        {curso.aficheUrl ? (
          <Image
            src={curso.aficheUrl}
            alt={curso.nombre}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-bg-secondary to-bg-primary flex items-center justify-center">
            <Award size={48} className="text-text-muted opacity-30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />

        {curso.fechaInicio && (
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            <Badge variant="primary" size="sm">
              <Calendar size={11} />
              Inicio: {formatearFecha(curso.fechaInicio)}
            </Badge>
            {curso.fechaFin && (
              <Badge variant="aceptado" size="sm">
                <Calendar size={11} />
                Fin: {formatearFecha(curso.fechaFin)}
              </Badge>
            )}
          </div>
        )}

        {curso.nivel && (
          <div className="absolute top-4 right-4">
            <Badge variant="info" size="sm">
              {curso.nivel}
            </Badge>
          </div>
        )}
      </div>

      <div className={cn('p-6', isCompact && 'p-5')}>
        <h3 className="font-bold text-text-primary text-lg leading-tight line-clamp-2 mb-3 group-hover:text-brand-primary transition-colors">
          {curso.nombre}
        </h3>

        {curso.descripcion && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-4">
            {truncarTexto(curso.descripcion, 15)}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {curso.modalidad && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-text-secondary">
              <Monitor size={12} className="text-brand-primary" />
              {curso.modalidad}
            </div>
          )}
          {(curso.totalHoras || curso.duracion) && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-text-secondary">
              <Clock size={12} className="text-brand-primary" />
              {curso.totalHoras
                ? `${curso.totalHoras} hrs`
                : curso.duracion}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xl font-black gradient-text">
            {formatearMonto(curso.costo)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary group-hover:gap-2 transition-all">
            Ver detalles
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}