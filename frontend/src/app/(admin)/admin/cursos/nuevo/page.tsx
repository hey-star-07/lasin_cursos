'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CursoForm } from '@/components/cursos/CursoForm';
import { Button } from '@/components/ui/Button';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { useCursos } from '@/hooks/useCursos';
import '../cursos-admin.css';

export default function NuevoCursoPage() {
  const router = useRouter();
  const { crear } = useCursos({ autoFetch: false });

  return (
    <div className="relative space-y-8 max-w-6xl">
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
          eyebrow="Catálogo · Crear"
          title="Nuevo Curso"
          subtitle="Completa la información del curso."
        />
      </div>

      <div
        className="admin-enter form-frame relative glass rounded-3xl p-6 md:p-8 shadow-2xl"
        style={{ animationDelay: '150ms' }}
      >
        <CursoForm
          onSubmit={async (data) => {
            await crear(data);
            router.push('/admin/cursos');
          }}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}