import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  CalendarCheck,
  Clock,
  Hourglass,
  Monitor,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Dato } from '@/components/cursos/Dato';
import {
  formatearFecha,
  formatearHorario,
  formatearMonto,
  truncarTexto,
} from '@/lib/utils/format';
import type { Curso } from '@/types/curso.types';
import { cn } from '@/lib/utils/cn';

interface CursoCardProps {
  curso: Curso;
  variant?: 'default' | 'compact';
}

export function CursoCard({ curso, variant = 'default' }: CursoCardProps) {
  const isCompact = variant === 'compact';

  const horas = curso.totalHoras
    ? `${curso.totalHoras} hrs`
    : curso.duracion || 'Por definir';

  return (
    <Link
      href={`/cursos/${curso.id}`}
      className={cn(
        'group flex h-full flex-col bg-bg-secondary border border-border rounded-2xl overflow-hidden',
        'transition-all duration-300',
        'hover:border-brand-primary/50 hover:shadow-2xl hover:shadow-brand-primary/20 hover:-translate-y-2'
      )}
    >
      {/* Afiche: se muestra completo (sin tapar con etiquetas) sobre un fondo difuminado */}
      <div
        className={cn(
          'relative overflow-hidden bg-bg-primary',
          isCompact ? 'h-48' : 'h-56'
        )}
      >
        {curso.aficheUrl ? (
          <>
            <Image
              src={curso.aficheUrl}
              alt=""
              aria-hidden
              fill
              className="object-cover scale-125 blur-2xl opacity-40"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <Image
              src={curso.aficheUrl}
              alt={curso.nombre}
              fill
              className="object-contain transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-bg-secondary to-bg-primary flex items-center justify-center">
            <Award size={48} className="text-text-muted opacity-30" />
          </div>
        )}
      </div>

      <div className={cn('flex flex-1 flex-col', isCompact ? 'p-5' : 'p-6')}>
        {/* Etiquetas */}
        {(curso.nivel || curso.modalidad) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {curso.modalidad && (
              <Badge variant="primary" size="sm">
                <Monitor size={11} />
                {curso.modalidad}
              </Badge>
            )}
            {curso.nivel && (
              <Badge variant="info" size="sm">
                {curso.nivel}
              </Badge>
            )}
          </div>
        )}

        <h3 className="font-bold text-text-primary text-lg leading-tight line-clamp-2 mb-2 group-hover:text-brand-primary transition-colors">
          {curso.nombre}
        </h3>

        {curso.descripcion && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-4">
            {truncarTexto(curso.descripcion, 15)}
          </p>
        )}

        {/* Datos del curso en cuadrícula ordenada */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <Dato
            icon={Calendar}
            label="Inicio"
            value={formatearFecha(curso.fechaInicio)}
          />
          <Dato
            icon={CalendarCheck}
            label="Fin"
            value={formatearFecha(curso.fechaFin)}
            acento="text-emerald-400"
          />
          <Dato
            icon={Clock}
            label="Horario"
            value={formatearHorario(curso.horaInicio, curso.horaFin)}
          />
          <Dato
            icon={Hourglass}
            label="Duración"
            value={horas}
            acento="text-amber-400"
          />
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted leading-none mb-1">
              Inversión
            </p>
            <span className="text-xl font-black gradient-text">
              {formatearMonto(curso.costo)}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary group-hover:gap-2 transition-all">
            Ver detalles
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
