'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarCheck,
  Clock,
  MessageCircle,
  Link2,
  ExternalLink,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { cursoSchema, type CursoFormInput } from '@/lib/schemas/curso.schema';
import { MODALIDADES, NIVELES, COLORES_CURSO } from '@/lib/utils/constants';
import type { Curso, CursoFormData } from '@/types/curso.types';

interface CursoFormProps {
  initialData?: Curso;
  onSubmit: (data: CursoFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

/* ------------------------------------------------------------------ */
/* Helpers (solo front)                                                */
/* ------------------------------------------------------------------ */

interface Opcion {
  value: string;
  label: string;
}

/** Acepta ['Básico', ...] o [{ value, label }, ...] */
function normalizarOpciones(lista: readonly unknown[]): Opcion[] {
  return lista.map((o) => {
    if (typeof o === 'string') return { value: o, label: o };
    const obj = o as { value: string | number; label?: string };
    return { value: String(obj.value), label: obj.label ?? String(obj.value) };
  });
}

const pad = (n: number) => String(n).padStart(2, '0');
const aISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const desdeISO = (s?: string | null) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const formatoCorto = (s?: string | null) => {
  const d = desdeISO(s);
  if (!d) return null;
  return d.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });
};

const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const HORAS_RAPIDAS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '18:00', '19:00', '20:00',
];

/* ------------------------------------------------------------------ */
/* Botones de selección (Nivel / Modalidad)                            */
/* ------------------------------------------------------------------ */

interface OpcionesBotonesProps {
  label: string;
  opciones: Opcion[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function OpcionesBotones({ label, opciones, value, onChange, error }: OpcionesBotonesProps) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {opciones.map((op) => {
          const activo = value === op.value;
          return (
            <button
              key={op.value}
              type="button"
              aria-pressed={activo}
              // Click otra vez = deseleccionar (el campo es opcional)
              onClick={() => onChange(activo ? '' : op.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 cursor-pointer ${
                activo
                  ? 'bg-brand-primary text-white border-brand-primary shadow-lg scale-[1.04]'
                  : 'border-border text-text-secondary hover:border-brand-primary/60 hover:text-white hover:-translate-y-0.5'
              }`}
            >
              {op.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Calendario de rango (inicio → fin)                                  */
/* ------------------------------------------------------------------ */

interface CalendarioRangoProps {
  inicio: string;
  fin: string;
  onChange: (inicio: string, fin: string) => void;
  errorInicio?: string;
  errorFin?: string;
}

function CalendarioRango({ inicio, fin, onChange, errorInicio, errorFin }: CalendarioRangoProps) {
  const hoy = useMemo(() => aISO(new Date()), []);
  const [mes, setMes] = useState<Date>(() => {
    const base = desdeISO(inicio) ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const celdas = useMemo(() => {
    const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const offset = (primerDia.getDay() + 6) % 7; // semana empieza en lunes
    const totalDias = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    const lista: (string | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= totalDias; d++) {
      lista.push(aISO(new Date(mes.getFullYear(), mes.getMonth(), d)));
    }
    return lista;
  }, [mes]);

  const nombreMes = mes.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' });

  const cambiarMes = (delta: number) =>
    setMes((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const elegirDia = (iso: string) => {
    // 1er click (o reiniciar) = inicio · 2do click = fin
    if (!inicio || (inicio && fin) || iso < inicio) {
      onChange(iso, '');
    } else {
      onChange(inicio, iso);
    }
  };

  const limpiar = () => onChange('', '');

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
        Fechas del curso
      </label>

      {/* Resumen de la selección */}
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <div
          className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
            inicio && !fin ? 'border-brand-primary' : 'border-border'
          }`}
        >
          <CalendarDays size={20} className="text-brand-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Inicio</p>
            <p className="text-sm font-bold truncate">{formatoCorto(inicio) ?? 'Elige una fecha'}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
            inicio && !fin ? 'border-dashed border-brand-primary/60' : 'border-border'
          }`}
        >
          <CalendarCheck size={20} className="text-brand-accent shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Finalización</p>
            <p className="text-sm font-bold truncate">{formatoCorto(fin) ?? 'Elige una fecha'}</p>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="rounded-2xl border-2 border-border p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => cambiarMes(-1)}
            aria-label="Mes anterior"
            className="p-2 rounded-lg hover:bg-brand-primary/20 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="text-sm font-bold capitalize">{nombreMes}</p>
          <button
            type="button"
            onClick={() => cambiarMes(1)}
            aria-label="Mes siguiente"
            className="p-2 rounded-lg hover:bg-brand-primary/20 transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DIAS.map((d) => (
            <span
              key={d}
              className="text-center text-[10px] font-bold uppercase text-text-muted py-1"
            >
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {celdas.map((iso, i) => {
            if (!iso) return <span key={`v-${i}`} />;
            const esInicio = iso === inicio;
            const esFin = iso === fin;
            const enRango = !!inicio && !!fin && iso > inicio && iso < fin;
            const esHoy = iso === hoy;
            const dia = Number(iso.slice(8));

            return (
              <button
                key={iso}
                type="button"
                onClick={() => elegirDia(iso)}
                className={`h-9 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  esInicio || esFin
                    ? 'bg-brand-primary text-white rounded-lg shadow-md scale-105'
                    : enRango
                      ? 'bg-brand-primary/20 text-white'
                      : 'rounded-lg text-text-secondary hover:bg-brand-primary/25 hover:text-white'
                } ${esHoy && !esInicio && !esFin ? 'ring-1 ring-brand-accent rounded-lg' : ''}`}
              >
                {dia}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <p className="text-[11px] text-text-muted">
            {!inicio
              ? 'Toca el día de inicio'
              : !fin
                ? 'Ahora toca el día de finalización'
                : 'Toca otro día para cambiar el rango'}
          </p>
          {(inicio || fin) && (
            <button
              type="button"
              onClick={limpiar}
              className="flex items-center gap-1 text-[11px] font-bold text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X size={12} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {(errorInicio || errorFin) && (
        <p className="mt-1.5 text-xs text-red-400 font-medium">{errorInicio ?? errorFin}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Formulario                                                          */
/* ------------------------------------------------------------------ */

export function CursoForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: CursoFormProps) {
  const [aficheFile, setAficheFile] = useState<File | null>(null);
  const [afichePreview, setAfichePreview] = useState<string | null>(null);

  const niveles = useMemo(() => normalizarOpciones(NIVELES as readonly unknown[]), []);
  const modalidades = useMemo(() => normalizarOpciones(MODALIDADES as readonly unknown[]), []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CursoFormInput>({
    resolver: zodResolver(cursoSchema) as never,
    defaultValues: initialData
      ? {
          nombre: initialData.nombre,
          nivel: initialData.nivel ?? '',
          modalidad: initialData.modalidad ?? '',
          fechaInicio: initialData.fechaInicio?.split('T')[0] ?? '',
          fechaFin: initialData.fechaFin?.split('T')[0] ?? '',
          horaInicio: initialData.horaInicio ?? '',
          horaFin: initialData.horaFin ?? '',
          duracion: initialData.duracion ?? '',
          costo: Number(initialData.costo),
          color: initialData.color ?? '#6366F1',
          descripcion: initialData.descripcion ?? '',
          totalHoras: initialData.totalHoras ?? 0,
          instructor: initialData.instructor ?? '',
          contenido: initialData.contenido ?? '',
          requisitosPrevios: initialData.requisitosPrevios ?? '',
          enlaceWhatsapp: initialData.enlaceWhatsapp ?? '',
        }
      : {
          color: '#6366F1',
          costo: 0,
          totalHoras: 0,
        },
  });

  const nivel = (watch('nivel') as string | undefined) ?? '';
  const modalidad = (watch('modalidad') as string | undefined) ?? '';
  const fechaInicio = (watch('fechaInicio') as string | undefined) ?? '';
  const fechaFin = (watch('fechaFin') as string | undefined) ?? '';
  const horaInicio = (watch('horaInicio') as string | undefined) ?? '';
  const enlaceWhatsapp = (watch('enlaceWhatsapp') as string | undefined) ?? '';

  useEffect(() => {
    if (initialData?.aficheUrl) {
      setAfichePreview(initialData.aficheUrl);
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAficheFile(file);
    setAfichePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (data: CursoFormInput) => {
    const payload: CursoFormData = {
      ...data,
      costo: Number(data.costo),
      totalHoras: data.totalHoras ? Number(data.totalHoras) : undefined,
      afiche: aficheFile,
    };
    await onSubmit(payload);
  };

  const opts = { shouldValidate: true, shouldDirty: true } as const;
  const enlaceValido = /^https?:\/\//i.test(enlaceWhatsapp.trim());

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Datos básicos */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-bold">Información básica</h3>
        </CardHeader>
        <CardBody className="space-y-5">
          <Input
            label="Nombre del curso"
            placeholder="Ej: Desarrollo Web Full Stack"
            required
            {...register('nombre')}
            error={errors.nombre?.message}
          />

          <OpcionesBotones
            label="Nivel"
            opciones={niveles}
            value={nivel}
            onChange={(v) => setValue('nivel', v as never, opts)}
            error={errors.nivel?.message}
          />

          <OpcionesBotones
            label="Modalidad"
            opciones={modalidades}
            value={modalidad}
            onChange={(v) => setValue('modalidad', v as never, opts)}
            error={errors.modalidad?.message}
          />

          <Textarea
            label="Descripción"
            placeholder="Describe brevemente el curso..."
            rows={4}
            {...register('descripcion')}
            error={errors.descripcion?.message}
          />
        </CardBody>
      </Card>

      {/* Fechas y horarios */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-bold">Fechas y horarios</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Campos reales (ocultos) para que react-hook-form los valide */}
          <input type="hidden" {...register('fechaInicio')} />
          <input type="hidden" {...register('fechaFin')} />

          <CalendarioRango
            inicio={fechaInicio}
            fin={fechaFin}
            onChange={(i, f) => {
              setValue('fechaInicio', i as never, opts);
              setValue('fechaFin', f as never, opts);
            }}
            errorInicio={errors.fechaInicio?.message}
            errorFin={errors.fechaFin?.message}
          />

          {/* Hora de inicio con selección rápida */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
              <Clock size={14} /> Hora de inicio
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {HORAS_RAPIDAS.map((h) => {
                const activo = horaInicio === h;
                return (
                  <button
                    key={h}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => setValue('horaInicio', (activo ? '' : h) as never, opts)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-bold border-2 transition-all duration-200 cursor-pointer ${
                      activo
                        ? 'bg-brand-primary text-white border-brand-primary shadow-md scale-105'
                        : 'border-border text-text-secondary hover:border-brand-primary/60 hover:text-white'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                type="time"
                label="¿Otra hora? Escríbela aquí"
                {...register('horaInicio')}
                error={errors.horaInicio?.message}
              />
              <Input
                type="time"
                label="Hora de finalización"
                {...register('horaFin')}
                error={errors.horaFin?.message}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Duración (ej: 4 semanas)"
              placeholder="4 semanas"
              {...register('duracion')}
              error={errors.duracion?.message}
            />
            <Input
              type="number"
              label="Total de horas"
              placeholder="40"
              {...register('totalHoras')}
              error={errors.totalHoras?.message}
            />
          </div>
        </CardBody>
      </Card>

      {/* Detalles académicos */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-bold">Detalles académicos</h3>
        </CardHeader>
        <CardBody className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Inversión (Bs.)"
              type="number"
              step="0.01"
              placeholder="500.00"
              {...register('costo')}
              error={errors.costo?.message}
            />
            <Input
              label="Instructor"
              placeholder="Nombre del instructor"
              {...register('instructor')}
              error={errors.instructor?.message}
            />
          </div>

          <Textarea
            label="Contenido del curso"
            placeholder="Un tema por línea..."
            rows={6}
            {...register('contenido')}
            error={errors.contenido?.message}
          />

          <Textarea
            label="Requisitos previos (opcional)"
            placeholder="Un requisito por línea..."
            rows={4}
            {...register('requisitosPrevios')}
            error={errors.requisitosPrevios?.message}
          />

          {/* Enlace de WhatsApp con iconos */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
              Enlace de WhatsApp
            </label>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <MessageCircle size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="https://chat.whatsapp.com/..."
                  {...register('enlaceWhatsapp')}
                  error={errors.enlaceWhatsapp?.message}
                />
              </div>
              {enlaceValido && (
                <a
                  href={enlaceWhatsapp.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Probar enlace"
                  className="w-11 h-11 rounded-xl border-2 border-border text-text-secondary hover:text-white hover:border-emerald-400 flex items-center justify-center shrink-0 transition-colors"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-text-muted">
              <Link2 size={12} />
              Pega aquí el link de invitación al grupo del curso. Los alumnos lo usarán para unirse.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Afiche y color */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-bold">Presentación visual</h3>
        </CardHeader>
        <CardBody className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
              Afiche del curso
            </label>
            <div className="flex items-center gap-4">
              {afichePreview ? (
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-border flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={afichePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center flex-shrink-0">
                  <ImageIcon size={24} className="text-text-muted" />
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:bg-brand-primary file:text-white hover:file:bg-brand-secondary file:cursor-pointer cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
              Color del curso
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORES_CURSO.map((color) => (
                <label key={color} className="cursor-pointer">
                  <input
                    type="radio"
                    value={color}
                    {...register('color')}
                    className="peer sr-only"
                  />
                  <span
                    className="block w-10 h-10 rounded-xl border-2 border-transparent peer-checked:border-white peer-checked:scale-110 transition-all shadow-lg"
                    style={{ backgroundColor: color }}
                  />
                </label>
              ))}
            </div>
            {errors.color && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">
                {errors.color.message}
              </p>
            )}
          </div>
        </CardBody>
        <CardFooter className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" loading={loading}>
            {initialData ? 'Actualizar Curso' : 'Crear Curso'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}