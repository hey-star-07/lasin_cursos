'use client';

import { use, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Hourglass,
  Layers,
  Monitor,
  PlayCircle,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { PreinscripcionTable } from '@/components/preinscripciones/PreinscripcionTable';
import { display } from '@/components/admin/fonts';
import { useCurso } from '@/hooks/useCursos';
import { formatearMonto, formatearFecha } from '@/lib/utils/format';
import '../preinscripciones-admin.css';

// Campos extra del curso que quizá aún no estén en tu tipo Curso
type CursoExtra = {
  aficheUrl?: string | null;
  nivel?: string | null;
  instructor?: string | null;
  fechaFin?: string | null;
  _count?: { preinscripciones?: number; inscripciones?: number };
};

type Estado = 'proceso' | 'finalizado' | 'proximo';

const estadoMeta: Record<Estado, { label: string; Icon: LucideIcon }> = {
  proceso: { label: 'En proceso', Icon: PlayCircle },
  finalizado: { label: 'Finalizado', Icon: CheckCircle2 },
  proximo: { label: 'Próximo', Icon: Hourglass },
};

const chip =
  'inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 text-base font-semibold backdrop-blur-md';

/* Número que cuenta desde 0 hasta el valor final */
function useContador(objetivo: number, duracion = 900) {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    let raf = 0;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      setValor(Math.round(objetivo * (1 - Math.pow(1 - progreso, 3))));
      if (progreso < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [objetivo, duracion]);

  return valor;
}

function Contador({ valor, sufijo = '' }: { valor: number; sufijo?: string }) {
  const v = useContador(valor);
  return (
    <>
      {v}
      {sufijo}
    </>
  );
}

export default function PreinscripcionesCursoPage({
  params,
}: {
  params: Promise<{ cursoId: string }>;
}) {
  const { cursoId } = use(params);
  const { curso, loading } = useCurso(Number(cursoId));

  /* ---------- Cargando: skeletons ---------- */
  if (loading) {
    return (
      <div className="max-w-7xl space-y-6">
        <div className="pre-skeleton h-10 w-32" />
        <div className="pre-skeleton h-72" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pre-skeleton h-32" />
          ))}
        </div>
        <div className="pre-skeleton h-96" />
      </div>
    );
  }

  /* ---------- No encontrado ---------- */
  if (!curso) {
    return (
      <div className="pre-enter max-w-7xl py-10">
        <EmptyState
          icon={<BookOpen size={56} className="pre-float" />}
          title="Curso no encontrado"
          description="El curso que buscas no existe o fue eliminado."
          action={
            <Link href="/admin/preinscripciones">
              <Button variant="primary" icon={<ArrowLeft size={16} />}>
                Volver a preinscripciones
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const extra = curso as typeof curso & CursoExtra;
  const afiche = extra.aficheUrl ?? null;

  const pre = extra._count?.preinscripciones ?? 0;
  const ins = extra._count?.inscripciones ?? 0;
  const conv = pre === 0 ? 0 : Math.min(100, Math.round((ins / pre) * 100));

  /* Estado y avance del curso según fechas */
  const hoy = Date.now();
  const inicio = curso.fechaInicio ? new Date(curso.fechaInicio).getTime() : null;
  const fin = extra.fechaFin ? new Date(extra.fechaFin).getTime() : null;
  const estado: Estado =
    fin !== null && fin < hoy ? 'finalizado' : inicio === null || inicio > hoy ? 'proximo' : 'proceso';
  const { label: estadoLabel, Icon: EstadoIcon } = estadoMeta[estado];
  const avance =
    inicio !== null && fin !== null && fin > inicio
      ? Math.min(100, Math.max(0, Math.round(((hoy - inicio) / (fin - inicio)) * 100)))
      : null;

  const stats: { label: string; valor: number; sufijo?: string; Icon: LucideIcon; color: string }[] = [
    { label: 'Preinscritos', valor: pre, Icon: Users, color: 'from-amber-500 to-orange-500' },
    { label: 'Inscritos', valor: ins, Icon: UserCheck, color: 'from-cyan-500 to-indigo-500' },
    { label: 'Conversión', valor: conv, sufijo: '%', Icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="relative max-w-7xl space-y-7">
      {/* Fondo decorativo */}
      <div className="pre-blob pointer-events-none absolute -top-24 -right-20 h-96 w-96 rounded-full bg-brand-primary/15 blur-3xl" />
      <div className="pre-blob pointer-events-none absolute top-2/3 -left-24 h-80 w-80 rounded-full bg-brand-accent/10 blur-3xl [animation-delay:4s]" />

      <Link href="/admin/preinscripciones" className="pre-enter inline-block">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
          Volver
        </Button>
      </Link>

      {/* ---------------- Hero del curso ---------------- */}
      <section
        className="pre-enter pre-hero relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 p-8 text-white shadow-2xl shadow-indigo-500/25 md:p-10"
        style={{ animationDelay: '100ms' }}
      >
        {/* Afiche difuminado de fondo */}
        {afiche && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={afiche}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 mix-blend-overlay blur-[2px]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />

        {/* Esferas flotantes */}
        <div className="pre-float pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-xl" />
        <div className="pre-float pointer-events-none absolute bottom-4 left-1/3 h-24 w-24 rounded-full bg-cyan-300/20 blur-lg [animation-delay:1.5s]" />

        <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className={chip}>
                <ClipboardList size={17} />
                Preinscripciones
              </span>
              <span className={chip}>
                {estado === 'proceso' ? (
                  <span className="pre-live-dot h-2.5 w-2.5 rounded-full bg-emerald-300" />
                ) : (
                  <EstadoIcon size={17} />
                )}
                {estadoLabel}
              </span>
              {curso.publicado ? (
                <Badge variant="aceptado" size="sm">
                  Publicado
                </Badge>
              ) : (
                <Badge size="sm">Borrador</Badge>
              )}
            </div>

            <h1 className={`${display.className} text-4xl font-black leading-tight md:text-5xl`}>
              {curso.nombre}
            </h1>

            <div className="flex flex-wrap gap-3">
              {extra.instructor && (
                <span className={chip}>
                  <GraduationCap size={17} />
                  {extra.instructor}
                </span>
              )}
              {curso.modalidad && (
                <span className={chip}>
                  <Monitor size={17} />
                  {curso.modalidad}
                </span>
              )}
              {extra.nivel && (
                <span className={chip}>
                  <Layers size={17} />
                  {extra.nivel}
                </span>
              )}
              {curso.fechaInicio && (
                <span className={chip}>
                  <CalendarDays size={17} />
                  {formatearFecha(curso.fechaInicio)}
                </span>
              )}
              <span className={chip}>
                <Wallet size={17} />
                {formatearMonto(curso.costo)}
              </span>
            </div>

            {/* Avance del curso (solo si hay fecha de inicio y fin) */}
            {avance !== null && (
              <div className="max-w-md space-y-2">
                <div className="flex items-center justify-between text-sm font-bold text-white/90">
                  <span>Avance del curso</span>
                  <span>{avance}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="pre-bar-fill !bg-none bg-white"
                    style={{ ['--w' as string]: `${avance}%` } as CSSProperties}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Afiche en 3D */}
          {afiche && (
            <div className="pre-poster hidden shrink-0 md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={afiche}
                alt={`Afiche de ${curso.nombre}`}
                className="h-60 w-44 rounded-2xl border border-white/30 object-cover shadow-2xl shadow-black/40"
              />
            </div>
          )}
        </div>
      </section>

      {/* ---------------- Estadísticas ---------------- */}
      <section className="grid gap-5 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="pre-enter pre-stat glass relative overflow-hidden rounded-3xl p-5"
            style={{ animationDelay: `${200 + i * 100}ms` }}
          >
            <div
              className={`mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}
            >
              <s.Icon size={22} />
            </div>
            <div className={`${display.className} pre-title-gradient text-5xl font-black leading-none`}>
              <Contador valor={s.valor} sufijo={s.sufijo} />
            </div>
            <div className="mt-2 text-sm font-bold uppercase tracking-wide text-text-secondary">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ---------------- Tabla de preinscritos ---------------- */}
      <section
        className="pre-enter glass relative rounded-3xl p-4 md:p-7"
        style={{ animationDelay: '500ms' }}
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
            <ClipboardList size={26} />
          </div>
          <div>
            <h2 className={`${display.className} pre-title-gradient text-3xl font-extrabold`}>
              Listado de preinscritos
            </h2>
            <p className="text-base text-text-secondary">Gestiona las solicitudes recibidas para este curso.</p>
          </div>
        </div>

        {/* .pre-table-xl agranda la letra y anima las filas de la tabla */}
        <div className="pre-table-xl">
          <PreinscripcionTable cursoId={curso.id} cursoNombre={curso.nombre} />
        </div>
      </section>
    </div>
  );
}