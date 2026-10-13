'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Users,
  Monitor,
  CalendarDays,
  FileEdit,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { display } from '@/components/admin/fonts';
import { useCursos } from '@/hooks/useCursos';
import { formatearMonto, formatearFecha } from '@/lib/utils/format';
import './cursos-admin.css';

// Colores de respaldo de cada tarjeta (solo visual)
const gradientes = [
  'from-indigo-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-sky-500 to-indigo-500',
  'from-rose-500 to-fuchsia-500',
];

// El afiche se sube a Cloudinary: aficheUrl ya es una URL absoluta (https://res.cloudinary.com/...)
function resolverImagen(curso: { aficheUrl?: string | null }): string | null {
  return curso.aficheUrl ? curso.aficheUrl : null;
}

// Portada con respaldo (degradado + ícono) si no hay afiche o falla la carga
function CursoImagen({
  src,
  alt,
  gradiente,
  index,
}: {
  src: string | null;
  alt: string;
  gradiente: string;
  index: number;
}) {
  const [error, setError] = useState(false);
  const mostrarImagen = !!src && !error;

  return (
    <div
      className={`relative w-full h-44 overflow-hidden bg-gradient-to-br ${gradiente}`}
    >
      {mostrarImagen ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={alt}
          loading="lazy"
          onError={() => setError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <BookOpen
            size={48}
            className="admin-float text-white/80"
            style={{ animationDelay: `${(index % 6) * 0.4}s` }}
          />
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}

export default function AdminCursosPage() {
  
  const router = useRouter();
  const { cursos, loading, eliminar } = useCursos();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cursoAEliminar = cursos.find((c) => c.id === deleteId);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await eliminar(deleteId);
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const publicados = cursos.filter((c) => c.publicado).length;
  const borradores = cursos.length - publicados;

  return (
    <div className="relative space-y-10 max-w-7xl">
      {/* Fondo decorativo */}
      <div className="admin-blob pointer-events-none absolute -top-24 -right-20 w-96 h-96 rounded-full bg-brand-primary/15 blur-3xl" />
      <div className="admin-blob pointer-events-none absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl [animation-delay:3s]" />

      <AdminPageHeader
        title="Cursos"
        subtitle="Gestiona el catálogo de cursos disponibles."
        actions={
          <Link href="/admin/cursos/nuevo">
            <Button variant="primary" size="lg" icon={<Plus size={18} />}>
              Nuevo Curso
            </Button>
          </Link>
        }
      >
        {!loading && cursos.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-bold text-text-primary">
              <BookOpen size={15} className="text-brand-primary" />
              {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-bold text-text-primary">
              <span className="admin-live-dot w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {publicados} publicados
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-bold text-text-primary">
              <FileEdit size={15} className="text-amber-500" />
              {borradores} en borrador
            </span>
          </div>
        )}
      </AdminPageHeader>

      {loading ? (
        <Spinner size="lg" label="Cargando cursos..." />
      ) : cursos.length === 0 ? (
        <div className="admin-enter" style={{ animationDelay: '150ms' }}>
          <EmptyState
            icon={<BookOpen size={56} className="admin-float" />}
            title="Aún no hay cursos"
            description="Crea el primero haciendo click en 'Nuevo Curso'."
            action={
              <Link href="/admin/cursos/nuevo">
                <Button variant="primary" icon={<Plus size={16} />}>
                  Crear Curso
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="relative grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {cursos.map((curso, i) => {
            const grad = gradientes[i % gradientes.length];
            const imagenSrc = resolverImagen(curso as { aficheUrl?: string | null });
            return (
              <div
                key={curso.id}
                className="admin-enter cursor-pointer"
                style={{ animationDelay: `${Math.min(i, 8) * 90 + 150}ms` }}
                onClick={() => router.push(`/admin/cursos/${curso.id}`)}
              >
                <Card hover className="curso-card group h-full overflow-hidden">
                  {/* Afiche del curso (con respaldo de degradado + ícono) */}
                  <CursoImagen
                    src={imagenSrc}
                    alt={curso.nombre}
                    gradiente={grad}
                    index={i}
                  />

                  <CardBody className="space-y-5">
                    <div className="min-w-0">
                      <h3
                        className={`${display.className} text-xl font-bold text-text-primary line-clamp-2 leading-snug mb-2`}
                      >
                        {curso.nombre}
                      </h3>
                      {curso.publicado ? (
                        <Badge variant="aceptado" size="sm">
                          Publicado
                        </Badge>
                      ) : (
                        <Badge size="sm">Borrador</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-text-secondary">
                      {curso.modalidad && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10">
                          <Monitor size={14} className="text-brand-primary" />
                          {curso.modalidad}
                        </span>
                      )}
                      {curso.fechaInicio && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10">
                          <CalendarDays
                            size={14}
                            className="text-brand-primary"
                          />
                          {formatearFecha(curso.fechaInicio)}
                        </span>
                      )}
                      {curso._count && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10">
                          <Users size={14} className="text-brand-primary" />
                          {curso._count.preinscripciones} preinscritos
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span
                        className={`${display.className} text-2xl font-extrabold text-brand-primary`}
                      >
                        {formatearMonto(curso.costo)}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/cursos/${curso.id}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-secondary shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                        >
                          <Edit size={16} />
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(curso.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 border-2 border-red-500/40 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar curso?"
        description={`Se eliminará "${cursoAEliminar?.nombre}" y todas sus preinscripciones asociadas. Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        loading={deleting}
      />
    </div>
  );
}