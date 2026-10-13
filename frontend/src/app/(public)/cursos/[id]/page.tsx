'use client';

import { use } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Monitor,
  Award,
  Users,
  CheckCircle2,
  FileText,
  Info,
} from 'lucide-react';
import { useCurso } from '@/hooks/useCursos';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { PreinscripcionForm } from '@/components/preinscripciones/PreinscripcionForm';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  formatearFecha,
  formatearHorario,
  formatearMonto,
} from '@/lib/utils/format';

export default function CursoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { curso, loading, error } = useCurso(Number(id));

  if (loading) return <Spinner size="lg" label="Cargando curso..." />;

  if (error || !curso) {
    return (
      <div className="py-20">
        <EmptyState
          icon={<Info size={56} />}
          title="Curso no encontrado"
          description="El curso que buscas no existe o fue eliminado."
        />
      </div>
    );
  }

  const contenidoArr = curso.contenido
    ? curso.contenido
        .split(/\r\n|\r|\n/)
        .filter(Boolean)
        .map((t) => t.replace(/^[-•*·]\s*/, ''))
    : [];

  const requisitosArr = curso.requisitosPrevios
    ? curso.requisitosPrevios
        .split(/\r\n|\r|\n/)
        .filter(Boolean)
        .map((r) => r.replace(/^[-•*·]\s*/, ''))
    : [];

  return (
    <div className="pb-20">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary pt-16 pb-12">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:45px_45px]" />
        <div className="container-custom relative">
          <div className="grid gap-12 md:grid-cols-[1fr_auto] items-center">
            <div className="animate-fade-up">
              <div className="flex flex-wrap gap-2 mb-4">
                {curso.modalidad && (
                  <Badge variant="primary">{curso.modalidad}</Badge>
                )}
                {curso.nivel && <Badge variant="info">{curso.nivel}</Badge>}
              </div>

              <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                {curso.nombre}
              </h1>

              {curso.descripcion && (
                <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
                  {curso.descripcion}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-8">
                {curso.fechaInicio && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
                    <Calendar size={16} className="text-brand-primary" />
                    {formatearFecha(curso.fechaInicio)}
                  </div>
                )}
                {(curso.horaInicio || curso.horaFin) && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
                    <Clock size={16} className="text-brand-primary" />
                    {formatearHorario(curso.horaInicio, curso.horaFin)}
                  </div>
                )}
                {curso.totalHoras && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
                    <Award size={16} className="text-brand-primary" />
                    {curso.totalHoras} hrs
                  </div>
                )}
              </div>
            </div>

            {curso.aficheUrl && (
              <div className="relative w-full max-w-sm animate-fade-up">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border-2 border-brand-primary/30 shadow-2xl shadow-brand-primary/20">
                  <Image
                    src={curso.aficheUrl}
                    alt={curso.nombre}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INFO + FORM */}
      <section className="container-custom pt-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Columna principal */}
          <div className="space-y-8">
            {contenidoArr.length > 0 && (
              <Card>
                <CardBody>
                  <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <FileText size={22} className="text-brand-primary" />
                    Contenido del curso
                  </h2>
                  <ul className="space-y-3">
                    {contenidoArr.map((tema, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-bg-primary/50 border border-border hover:border-brand-primary/40 transition-colors"
                      >
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg gradient-brand text-white text-xs font-black flex items-center justify-center">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm text-text-primary pt-1">
                          {tema}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            )}

            {requisitosArr.length > 0 && (
              <Card>
                <CardBody>
                  <h2 className="text-2xl font-black mb-6">
                    Requisitos previos
                  </h2>
                  <ul className="space-y-3">
                    {requisitosArr.map((req, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm text-text-secondary"
                      >
                        <CheckCircle2
                          size={18}
                          className="text-emerald-400 flex-shrink-0"
                        />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Sidebar con info + formulario */}
          <aside className="space-y-6">
            <Card className="sticky top-24">
              <CardBody className="space-y-5">
                <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-text-muted mb-1">
                    Inversión
                  </p>
                  <p className="text-4xl font-black gradient-text">
                    {formatearMonto(curso.costo)}
                  </p>
                </div>

                <div className="space-y-3 py-4 border-y border-border">
                  {curso.instructor && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted flex items-center gap-2">
                        <Users size={14} />
                        Instructor
                      </span>
                      <span className="font-bold text-text-primary">
                        {curso.instructor}
                      </span>
                    </div>
                  )}
                  {curso.duracion && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted flex items-center gap-2">
                        <Clock size={14} />
                        Duración
                      </span>
                      <span className="font-bold text-text-primary">
                        {curso.duracion}
                      </span>
                    </div>
                  )}
                  {curso.modalidad && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted flex items-center gap-2">
                        <Monitor size={14} />
                        Modalidad
                      </span>
                      <span className="font-bold text-text-primary">
                        {curso.modalidad}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Award size={14} />
                    Certificado incluido
                  </p>
                </div>
              </CardBody>
            </Card>
          </aside>
        </div>

        {/* Formulario de preinscripción */}
        <div id="preinscripcion" className="mt-16 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black mb-3">
              Preinscríbete <span className="gradient-text">Ahora</span>
            </h2>
            <p className="text-text-secondary">
              Completa tus datos y sube tu comprobante de pago.
            </p>
          </div>
          <PreinscripcionForm
            cursoId={curso.id}
            cursoNombre={curso.nombre}
          />
        </div>
      </section>
    </div>
  );
}