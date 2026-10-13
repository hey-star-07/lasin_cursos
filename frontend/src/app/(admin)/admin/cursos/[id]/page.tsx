'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, SearchX } from 'lucide-react';
import { CursoForm } from '@/components/cursos/CursoForm';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { display } from '@/components/admin/fonts';
import { useCurso, useCursos } from '@/hooks/useCursos';
import type { CursoFormData } from '@/types/curso.types';
import '../cursos-admin.css';

export default function EditarCursoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { curso, loading } = useCurso(Number(id));
  const { actualizar } = useCursos({ autoFetch: false });
  const [saving, setSaving] = useState(false);

  if (loading) return <Spinner size="lg" label="Cargando curso..." />;
  if (!curso) {
    return (
      <div className="admin-enter text-center py-24">
        <div className="admin-float mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-fuchsia-500 grid place-items-center shadow-xl mb-6">
          <SearchX size={36} className="text-white" />
        </div>
        <p
          className={`${display.className} text-2xl font-bold text-text-primary mb-2`}
        >
          Curso no encontrado.
        </p>
        <p className="text-text-secondary mb-6">
          Es posible que haya sido eliminado o que el enlace sea incorrecto.
        </p>
        <Button
          variant="outline"
          icon={<ArrowLeft size={16} />}
          onClick={() => router.back()}
        >
          Volver
        </Button>
      </div>
    );
  }

  const handleSubmit = async (data: CursoFormData) => {
    setSaving(true);
    try {
      await actualizar(Number(id), data);
      router.push('/admin/cursos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative space-y-8 max-w-4xl">
      {/* Fondo decorativo */}
      <div className="admin-blob pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-primary/15 blur-3xl" />
      <div className="admin-blob pointer-events-none absolute bottom-10 -left-24 w-72 h-72 rounded-full bg-brand-accent/10 blur-3xl [animation-delay:3s]" />

      <div className="admin-enter relative flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={() => router.back()}
        >
          Volver
        </Button>
      </div>

      <div className="relative">
        <AdminPageHeader
          eyebrow="Catálogo · Editar"
          title="Editar Curso"
          subtitle={
            <span
              className={`${display.className} font-semibold text-text-primary`}
            >
              {curso.nombre}
            </span>
          }
        />
      </div>

      <div
        className="admin-enter form-frame relative glass rounded-3xl p-6 md:p-8 shadow-2xl"
        style={{ animationDelay: '150ms' }}
      >
        <CursoForm
          initialData={curso}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          loading={saving}
        />
      </div>
    </div>
  );
}