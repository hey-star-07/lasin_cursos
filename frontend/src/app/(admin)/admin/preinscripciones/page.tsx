'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Search,
  X,
  ArrowRight,
  BookOpen,
  Monitor,
  CalendarDays,
  CalendarCheck,
  RotateCcw,
  Sparkles,
  PlayCircle,
  CheckCircle2,
  Hourglass,
  GraduationCap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { display } from '@/components/admin/fonts';
import { useCursos } from '@/hooks/useCursos';
import { formatearFecha } from '@/lib/utils/format';
import type { Curso } from '@/types/curso.types';
import './preinscripciones-admin.css';

/* ------------------------------------------------------------------ */
/* Tipos y utilidades                                                  */
/* ------------------------------------------------------------------ */

type PreinscripcionMini = { estado?: string | null };

// Campos extra que quizá aún no estén en tu tipo Curso
type CursoExtra = {
  aficheUrl?: string | null;
  instructor?: string | null;
  fechaFin?: string | null;
  // Opción A (recomendada): lista con el estado de cada preinscripción
  preinscripciones?: PreinscripcionMini[];
  // Contadores que envía el backend (/api/cursos):
  //   preinscripciones = todos los formularios, aceptadas = solo aceptados
  _count?: { preinscripciones?: number; aceptadas?: number };
};
type CursoX = Curso & CursoExtra;

type Estado = 'proceso' | 'finalizado' | 'proximo';
type FiltroEstado = 'todos' | Estado;
type Orden = 'recientes' | 'nombre' | 'preinscritos' | 'inscritos';

const gradientes = [
  'from-indigo-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-sky-500 to-indigo-500',
  'from-rose-500 to-fuchsia-500',
];

const estadoMeta: Record<Estado, { label: string; Icon: LucideIcon; clase: string }> = {
  proceso: { label: 'En proceso', Icon: PlayCircle, clase: 'bg-emerald-500 text-white' },
  finalizado: { label: 'Finalizado', Icon: CheckCircle2, clase: 'bg-slate-600 text-white' },
  proximo: { label: 'Próximo', Icon: Hourglass, clase: 'bg-amber-500 text-white' },
};

const x = (c: Curso) => c as CursoX;
const docente = (c: Curso) => x(c).instructor?.trim() || '';

const esAceptada = (p: PreinscripcionMini) => p.estado?.trim().toLowerCase() === 'aceptado';

/* ------------------------------------------------------------------
   CONTADORES (esta es la lógica corregida)

   - PREINSCRITOS = TODOS los que llenaron y enviaron el formulario,
     sin importar su estado (pendiente, aceptado o rechazado).
   - INSCRITOS    = solo los que tienen estado "aceptado".
   Los inscritos siempre son un subconjunto de los preinscritos.
------------------------------------------------------------------ */

// Preinscritos: total de formularios recibidos (todos los estados)
const preinscritos = (c: Curso) =>
  x(c).preinscripciones?.length ?? x(c)._count?.preinscripciones ?? 0;

// Inscritos: solo los aceptados (nunca más que los preinscritos)
const inscritos = (c: Curso) => {
  const lista = x(c).preinscripciones;
  const aceptados = lista ? lista.filter(esAceptada).length : (x(c)._count?.aceptadas ?? 0);
  return Math.min(aceptados, preinscritos(c));
};

/** Estado calculado por fechas:
 *  - finalizado: ya pasó fechaFin
 *  - próximo: aún no llega fechaInicio (o no tiene fecha)
 *  - en proceso: ya empezó y no terminó
 */
function estadoDe(c: Curso): Estado {
  const hoy = Date.now();
  const inicio = c.fechaInicio ? new Date(c.fechaInicio).getTime() : null;
  const fin = x(c).fechaFin ? new Date(x(c).fechaFin as string).getTime() : null;
  if (fin !== null && fin < hoy) return 'finalizado';
  if (inicio === null || inicio > hoy) return 'proximo';
  return 'proceso';
}

// Conversión = aceptados ÷ preinscritos (todos los que enviaron el formulario)
const conversion = (c: Curso) => {
  const total = preinscritos(c);
  return total === 0 ? 0 : Math.min(100, Math.round((inscritos(c) / total) * 100));
};

/* ------------------------------------------------------------------ */
/* Hook propio: número que "cuenta" desde 0 hasta el valor final       */
/* ------------------------------------------------------------------ */

function useContador(objetivo: number, duracion = 900) {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    let raf = 0;
    const inicio = performance.now();

    const paso = (ahora: number) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      const suave = 1 - Math.pow(1 - progreso, 3);
      setValor(Math.round(objetivo * suave));
      if (progreso < 1) raf = requestAnimationFrame(paso);
    };

    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [objetivo, duracion]);

  return valor;
}

function Contador({ valor }: { valor: number }) {
  const v = useContador(valor);
  return <>{v}</>;
}

/* ------------------------------------------------------------------ */
/* Tarjeta con inclinación 3D y brillo que sigue al mouse              */
/* ------------------------------------------------------------------ */

function TiltCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const mover = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${(px - 0.5) * 14}deg`);
    el.style.setProperty('--rx', `${(0.5 - py) * 14}deg`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  };

  const salir = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div ref={ref} className="pre-tilt relative h-full" onMouseMove={mover} onMouseLeave={salir}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Portada del curso (afiche) con respaldo + estado                    */
/* ------------------------------------------------------------------ */

function PortadaCurso({
  src,
  alt,
  gradiente,
  estado,
}: {
  src: string | null;
  alt: string;
  gradiente: string;
  estado: Estado;
}) {
  const [error, setError] = useState(false);
  const mostrar = !!src && !error;
  const { label, Icon, clase } = estadoMeta[estado];

  return (
    <div className={`pre-cover relative h-44 w-full overflow-hidden bg-gradient-to-br ${gradiente}`}>
      {mostrar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={alt}
          loading="lazy"
          onError={() => setError(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <BookOpen size={48} className="pre-float text-white/80" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />

      <span
        className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg ${clase}`}
      >
        {estado === 'proceso' ? (
          <span className="pre-live-dot h-2 w-2 rounded-full bg-white" />
        ) : (
          <Icon size={13} />
        )}
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function AdminPreinscripcionesPage() {
  const { cursos, loading } = useCursos();

  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState<FiltroEstado>('todos');
  const [docenteSel, setDocenteSel] = useState('todos');
  const [modalidad, setModalidad] = useState('todas');
  const [orden, setOrden] = useState<Orden>('recientes');

  const modalidades = useMemo(
    () => Array.from(new Set(cursos.map((c) => c.modalidad).filter(Boolean))) as string[],
    [cursos],
  );

  const docentes = useMemo(
    () => Array.from(new Set(cursos.map(docente).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')),
    [cursos],
  );

  const conteo = useMemo(() => {
    const base = { proceso: 0, finalizado: 0, proximo: 0 };
    cursos.forEach((c) => {
      base[estadoDe(c)] += 1;
    });
    return base;
  }, [cursos]);

  // Suma de TODOS los formularios recibidos en todos los cursos
  const totalPreinscritos = useMemo(() => cursos.reduce((a, c) => a + preinscritos(c), 0), [cursos]);
  // Suma de los ACEPTADOS en todos los cursos
  const totalInscritos = useMemo(() => cursos.reduce((a, c) => a + inscritos(c), 0), [cursos]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    const lista = cursos.filter((c) => {
      if (q && !c.nombre.toLowerCase().includes(q) && !docente(c).toLowerCase().includes(q)) return false;
      if (modalidad !== 'todas' && c.modalidad !== modalidad) return false;
      if (docenteSel !== 'todos' && docente(c) !== docenteSel) return false;
      if (estado !== 'todos' && estadoDe(c) !== estado) return false;
      return true;
    });

    if (orden === 'nombre') return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    if (orden === 'preinscritos') return [...lista].sort((a, b) => preinscritos(b) - preinscritos(a));
    if (orden === 'inscritos') return [...lista].sort((a, b) => inscritos(b) - inscritos(a));
    return lista; // "recientes": el backend ya los envía por fecha de creación
  }, [cursos, busqueda, estado, docenteSel, modalidad, orden]);

  const hayFiltros =
    busqueda !== '' || estado !== 'todos' || docenteSel !== 'todos' || modalidad !== 'todas' || orden !== 'recientes';

  const limpiarFiltros = () => {
    setBusqueda('');
    setEstado('todos');
    setDocenteSel('todos');
    setModalidad('todas');
    setOrden('recientes');
  };

  const pills: { id: FiltroEstado; label: string; total: number; Icon: LucideIcon }[] = [
    { id: 'todos', label: 'Todos', total: cursos.length, Icon: Sparkles },
    { id: 'proceso', label: 'En proceso', total: conteo.proceso, Icon: PlayCircle },
    { id: 'finalizado', label: 'Finalizados', total: conteo.finalizado, Icon: CheckCircle2 },
    { id: 'proximo', label: 'Próximos', total: conteo.proximo, Icon: Hourglass },
  ];

  const campoSelect =
    'px-4 py-3.5 rounded-2xl bg-brand-primary/5 border border-border text-base font-semibold text-text-primary outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15 cursor-pointer';

  const chipStat =
    'glass inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-base font-bold text-text-primary';

  return (
    <div className="relative max-w-7xl space-y-10">
      {/* Fondo decorativo */}
      <div className="pre-blob pointer-events-none absolute -top-24 -right-20 h-96 w-96 rounded-full bg-brand-primary/15 blur-3xl" />
      <div className="pre-blob pointer-events-none absolute top-1/2 -left-24 h-80 w-80 rounded-full bg-brand-accent/10 blur-3xl [animation-delay:4s]" />

      {/* ---------------- Encabezado con degradado ---------------- */}
      <header className="pre-enter relative space-y-3">
        <h1
          className={`${display.className} pre-title-3d inline-block text-4xl font-black leading-tight md:text-5xl`}
        >
          <span className="pre-title-gradient">Preinscripciones</span>
        </h1>
        <p className="text-lg text-text-secondary">
          Preinscritos son todos los que enviaron el formulario; inscritos son los que fueron aceptados. Entra a un
          curso para ver el detalle.
        </p>

        {!loading && cursos.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2">
            <span className={chipStat}>
              <BookOpen size={18} className="text-brand-primary" />
              <Contador valor={cursos.length} /> {cursos.length === 1 ? 'curso' : 'cursos'}
            </span>
            <span className={chipStat}>
              <PlayCircle size={18} className="text-emerald-500" />
              <Contador valor={conteo.proceso} /> en proceso
            </span>
            <span className={chipStat}>
              <CheckCircle2 size={18} className="text-slate-500" />
              <Contador valor={conteo.finalizado} /> finalizados
            </span>
            <span className={chipStat}>
              <Users size={18} className="text-amber-500" />
              <Contador valor={totalPreinscritos} /> preinscritos
            </span>
            <span className={chipStat}>
              <UserCheck size={18} className="text-cyan-500" />
              <Contador valor={totalInscritos} /> inscritos
            </span>
          </div>
        )}
      </header>

      {/* ---------------- Filtros ---------------- */}
      {!loading && cursos.length > 0 && (
        <div
          className="pre-enter glass relative space-y-4 rounded-3xl p-4 md:p-6"
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search
                size={20}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por curso o docente..."
                aria-label="Buscar curso"
                className="w-full rounded-2xl border border-border bg-brand-primary/5 py-3.5 pl-12 pr-10 text-base text-text-primary outline-none transition placeholder:text-text-secondary focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-secondary transition hover:bg-brand-primary/10 hover:text-text-primary"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Docencia */}
            {docentes.length > 0 && (
              <select
                value={docenteSel}
                onChange={(e) => setDocenteSel(e.target.value)}
                aria-label="Filtrar por docente"
                className={campoSelect}
              >
                <option value="todos" className="text-black">
                  Todos los docentes
                </option>
                {docentes.map((d) => (
                  <option key={d} value={d} className="text-black">
                    {d}
                  </option>
                ))}
              </select>
            )}

            {/* Modalidad */}
            {modalidades.length > 0 && (
              <select
                value={modalidad}
                onChange={(e) => setModalidad(e.target.value)}
                aria-label="Filtrar por modalidad"
                className={campoSelect}
              >
                <option value="todas" className="text-black">
                  Todas las modalidades
                </option>
                {modalidades.map((m) => (
                  <option key={m} value={m} className="text-black">
                    {m}
                  </option>
                ))}
              </select>
            )}

            {/* Orden */}
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as Orden)}
              aria-label="Ordenar cursos"
              className={campoSelect}
            >
              <option value="recientes" className="text-black">
                Más recientes
              </option>
              <option value="nombre" className="text-black">
                Nombre (A-Z)
              </option>
              <option value="inscritos" className="text-black">
                Más inscritos
              </option>
              <option value="preinscritos" className="text-black">
                Más preinscritos
              </option>
            </select>
          </div>

          {/* Pills de estado + contador de resultados */}
          <div className="flex flex-wrap items-center gap-2.5">
            {pills.map((p) => {
              const activo = estado === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => setEstado(p.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-base font-bold transition-all duration-300 ${
                    activo
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-brand-primary/10 text-text-secondary hover:bg-brand-primary/20 hover:text-text-primary'
                  }`}
                >
                  <p.Icon size={16} />
                  {p.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${activo ? 'bg-white/25' : 'bg-brand-primary/15'}`}
                  >
                    {p.total}
                  </span>
                </button>
              );
            })}

            <span className="ml-auto text-base font-semibold text-text-secondary">
              {filtrados.length} de {cursos.length} cursos
            </span>

            {hayFiltros && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-base font-bold text-brand-primary transition hover:bg-brand-primary/10"
              >
                <RotateCcw size={15} />
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---------------- Contenido ---------------- */}
      {loading ? (
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pre-skeleton h-96" />
          ))}
        </div>
      ) : cursos.length === 0 ? (
        <div className="pre-enter" style={{ animationDelay: '150ms' }}>
          <EmptyState
            icon={<Users size={56} className="pre-float" />}
            title="No hay cursos"
            description="Crea un curso primero para recibir preinscripciones."
          />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="pre-enter" style={{ animationDelay: '100ms' }}>
          <EmptyState
            icon={<Search size={56} className="pre-float" />}
            title="Sin resultados"
            description="Ningún curso coincide con los filtros aplicados."
            action={
              <Button variant="primary" icon={<RotateCcw size={16} />} onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            }
          />
        </div>
      ) : (
        <div className="relative grid gap-9 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((curso, i) => {
            const grad = gradientes[i % gradientes.length];
            const afiche = x(curso).aficheUrl ?? null;
            const pre = preinscritos(curso);
            const ins = inscritos(curso);
            const conv = conversion(curso);
            const doc = docente(curso);

            return (
              <div
                key={curso.id}
                className="pre-enter"
                style={{ animationDelay: `${Math.min(i, 8) * 90 + 200}ms` }}
              >
                <Link
                  href={`/admin/preinscripciones/${curso.id}`}
                  aria-label={`Ver detalle de ${curso.nombre}`}
                  className="block h-full rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/40"
                >
                  <TiltCard>
                    <Card hover className="pre-card relative h-full cursor-pointer overflow-hidden">
                      <span className="pre-glare" />

                      <PortadaCurso src={afiche} alt={curso.nombre} gradiente={grad} estado={estadoDe(curso)} />

                      <CardBody className="space-y-5">
                        <div className="space-y-1.5">
                          <h3
                            className={`${display.className} pre-title-gradient line-clamp-2 text-2xl font-extrabold leading-snug`}
                          >
                            {curso.nombre}
                          </h3>
                          {doc && (
                            <p className="inline-flex items-center gap-2 text-base font-semibold text-text-secondary">
                              <GraduationCap size={17} className="text-brand-primary" />
                              {doc}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm font-medium text-text-secondary">
                          {curso.modalidad && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1.5">
                              <Monitor size={15} className="text-brand-primary" />
                              {curso.modalidad}
                            </span>
                          )}
                          {curso.fechaInicio && (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1.5"
                              title="Inicio de clases"
                            >
                              <CalendarDays size={15} className="text-brand-primary" />
                              Inicio: {formatearFecha(curso.fechaInicio)}
                            </span>
                          )}
                          {x(curso).fechaFin && (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5"
                              title="Fin de clases"
                            >
                              <CalendarCheck size={15} className="text-emerald-500" />
                              Fin: {formatearFecha(x(curso).fechaFin)}
                            </span>
                          )}
                        </div>

                        {/* Inscritos = aceptados · Preinscritos = todos los que enviaron el formulario */}
                        <div className="grid grid-cols-2 gap-3">
                          <div
                            className="pre-stat rounded-2xl bg-brand-primary/10 p-3.5 text-center"
                            title="Solo los que están en estado aceptado"
                          >
                            <UserCheck size={18} className="mx-auto mb-1 text-cyan-500" />
                            <div className={`${display.className} pre-title-gradient text-3xl font-black`}>
                              <Contador valor={ins} />
                            </div>
                            <div className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                              Inscritos
                            </div>
                            <div className="text-[11px] font-medium text-text-secondary/80">Aceptados</div>
                          </div>
                          <div
                            className="pre-stat rounded-2xl bg-brand-primary/10 p-3.5 text-center"
                            title="Todos los que enviaron el formulario, sin importar su estado"
                          >
                            <Users size={18} className="mx-auto mb-1 text-amber-500" />
                            <div className={`${display.className} pre-title-gradient text-3xl font-black`}>
                              <Contador valor={pre} />
                            </div>
                            <div className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                              Preinscritos
                            </div>
                            <div className="text-[11px] font-medium text-text-secondary/80">Total de formularios</div>
                          </div>
                        </div>

                        {/* Conversión: aceptados sobre el total de preinscritos */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm font-bold text-text-secondary">
                            <span>Aceptados de los preinscritos</span>
                            <span className="text-text-primary">{conv}%</span>
                          </div>
                          <div className="pre-bar">
                            <div className="pre-bar-fill" style={{ ['--w' as string]: `${conv}%` } as CSSProperties} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-4">
                          <span className="inline-flex items-center gap-2 text-base font-bold text-brand-primary">
                            Ver detalle
                            <ArrowRight size={18} className="pre-arrow" />
                          </span>
                          <Badge variant="primary" size="sm">
                            {ins} {ins === 1 ? 'inscrito' : 'inscritos'}
                          </Badge>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Medalla flotante en 3D (fuera del Card para que no se recorte) */}
                    <div
                      className={`pre-pop absolute -right-3 -top-4 z-10 grid h-[4.5rem] w-[4.5rem] place-items-center rounded-2xl bg-gradient-to-br ${grad} text-white shadow-xl`}
                    >
                      <div className="text-center leading-none">
                        <UserCheck size={15} className="mx-auto mb-1 opacity-90" />
                        <span className={`${display.className} text-2xl font-extrabold`}>{ins}</span>
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}