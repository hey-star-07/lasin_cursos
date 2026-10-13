'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sora } from 'next/font/google';
import {
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Hourglass,
} from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useCursos } from '@/hooks/useCursos';
import { usePreinscripciones } from '@/hooks/usePreinscripciones';
import './dashboard.css';

// Tipografía de títulos y números (solo visual)
const display = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
});

/** Número que sube animado desde 0 hasta el valor real (solo efecto visual). */
function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{shown}</>;
}

export default function DashboardPage() {
  const { cursos, loading: loadingCursos } = useCursos();
  const { preinscripciones, loading: loadingPre } = usePreinscripciones();

  // Solo para animar las barras al montar
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(id);
  }, []);

  const pendientes = preinscripciones.filter(
    (p) => p.estado === 'pendiente'
  ).length;
  const aceptados = preinscripciones.filter(
    (p) => p.estado === 'aceptado'
  ).length;
  const rechazados = preinscripciones.filter(
    (p) => p.estado === 'rechazado'
  ).length;

  const stats = [
    {
      label: 'Cursos',
      value: cursos.length,
      icon: BookOpen,
      color: 'from-brand-primary to-brand-secondary',
      href: '/admin/cursos',
    },
    {
      label: 'Preinscripciones',
      value: preinscripciones.length,
      icon: Users,
      color: 'from-brand-secondary to-brand-accent',
      href: '/admin/preinscripciones',
    },
    {
      label: 'Pendientes',
      value: pendientes,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      href: '/admin/preinscripciones',
    },
    {
      label: 'Aceptados',
      value: aceptados,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
      href: '/admin/preinscripciones',
    },
  ];

  const estados = [
    {
      label: 'Pendientes',
      value: pendientes,
      color: 'bg-amber-500',
      hex: '#f59e0b',
      icon: Hourglass,
    },
    {
      label: 'Aceptados',
      value: aceptados,
      color: 'bg-emerald-500',
      hex: '#10b981',
      icon: CheckCircle2,
    },
    {
      label: 'Rechazados',
      value: rechazados,
      color: 'bg-red-500',
      hex: '#ef4444',
      icon: XCircle,
    },
  ];

  // Donut de resumen (conic-gradient)
  const totalPre = preinscripciones.length;
  let acumulado = 0;
  const donut =
    totalPre === 0
      ? 'conic-gradient(rgba(148,163,184,0.25) 0 100%)'
      : `conic-gradient(${estados
          .map((e) => {
            const desde = (acumulado / totalPre) * 100;
            acumulado += e.value;
            const hasta = (acumulado / totalPre) * 100;
            return `${e.hex} ${desde}% ${hasta}%`;
          })
          .join(', ')})`;

  return (
    <div className="relative space-y-10 max-w-7xl">
      {/* Fondo decorativo */}
      <div className="dash-blob pointer-events-none absolute -top-24 -right-20 w-96 h-96 rounded-full bg-brand-primary/15 blur-3xl" />
      <div className="dash-blob pointer-events-none absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl [animation-delay:3s]" />

      {/* Encabezado */}
      <div className="relative dash-enter">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-primary mb-2">
          Panel de administración
        </p>
        <h1
          className={`${display.className} text-5xl md:text-6xl font-extrabold mb-2 tracking-tight`}
        >
          <span className="dash-title-3d inline-block">
            <span className="dash-title-gradient">Dashboard</span>
          </span>
        </h1>
        <p className="text-lg text-text-secondary">
          Resumen general del sistema de cursos.
        </p>
      </div>

      {(loadingCursos || loadingPre) && (
        <Spinner size="md" label="Cargando métricas..." />
      )}

      {/* Tarjetas de métricas */}
      <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            href={s.href}
            className="dash-enter block"
            style={{ animationDelay: `${i * 110}ms` }}
          >
            <Card hover className="group dash-stat cursor-pointer h-full">
              <CardBody>
                <div
                  className={`dash-icon-float w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-5 shadow-xl`}
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  <s.icon size={26} className="text-white" />
                </div>
                <p
                  className={`${display.className} text-5xl font-extrabold text-text-primary mb-2`}
                >
                  <CountUp value={s.value} />
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase font-bold tracking-wider text-text-muted">
                    {s.label}
                  </p>
                  <ArrowRight
                    size={16}
                    className="text-brand-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100"
                  />
                </div>
                <div
                  className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${s.color}`}
                />
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className="relative grid gap-6 lg:grid-cols-2">
        {/* Cursos recientes */}
        <div className="dash-enter" style={{ animationDelay: '450ms' }}>
          <Card className="h-full">
            <CardBody>
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`${display.className} text-2xl font-bold`}
                >
                  Cursos recientes
                </h2>
                <Link href="/admin/cursos">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ArrowRight size={14} />}
                    iconPosition="right"
                  >
                    Ver todos
                  </Button>
                </Link>
              </div>
              {cursos.length === 0 ? (
                <p className="text-base text-text-muted py-8 text-center">
                  No hay cursos creados.
                </p>
              ) : (
                <ul className="space-y-2">
                  {cursos.slice(0, 5).map((c, i) => (
                    <li
                      key={c.id}
                      className="dash-row flex items-center justify-between gap-3 py-3 px-3 rounded-xl border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`${display.className} shrink-0 w-9 h-9 rounded-xl gradient-brand grid place-items-center text-sm font-bold text-white shadow-md`}
                        >
                          {i + 1}
                        </span>
                        <span className="text-base font-semibold text-text-primary truncate">
                          {c.nombre}
                        </span>
                      </div>
                      <span
                        className={`${display.className} shrink-0 px-3 py-1 rounded-full bg-brand-primary/10 text-sm font-bold text-brand-primary`}
                      >
                        Bs. {Number(c.costo).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Estado de preinscripciones */}
        <div className="dash-enter" style={{ animationDelay: '560ms' }}>
          <Card className="h-full">
            <CardBody>
              <h2
                className={`${display.className} text-2xl font-bold mb-6`}
              >
                Estado de preinscripciones
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Donut */}
                <div className="relative shrink-0">
                  <div
                    className="w-40 h-40 rounded-full shadow-xl transition-transform duration-700 hover:rotate-12"
                    style={{ background: donut }}
                  />
                  <div className="absolute inset-4 rounded-full bg-bg-secondary grid place-items-center">
                    <div className="text-center">
                      <p
                        className={`${display.className} text-3xl font-extrabold text-text-primary leading-none`}
                      >
                        <CountUp value={totalPre} />
                      </p>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mt-1">
                        Total
                      </p>
                    </div>
                  </div>
                </div>

                {/* Barras */}
                <div className="w-full space-y-5">
                  {estados.map((item) => {
                    const total = preinscripciones.length || 1;
                    const pct = Math.round((item.value / total) * 100);
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between items-center text-base mb-2">
                          <span className="flex items-center gap-2 text-text-secondary font-semibold">
                            <item.icon size={16} />
                            {item.label}
                          </span>
                          <span className="font-bold text-text-primary">
                            {item.value} ({pct}%)
                          </span>
                        </div>
                        <div className="h-3 bg-bg-primary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                            style={{ width: mounted ? `${pct}%` : '0%' }}
                          >
                            <div className="dash-bar-fill h-full w-full rounded-full" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}