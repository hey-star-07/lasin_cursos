'use client';

import { useState } from 'react';
import {
  FileText,
  Search,
  Eye,
  Check,
  X,
  Clock,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, EstadoBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatearFecha } from '@/lib/utils/format';
import { usePreinscripciones } from '@/hooks/usePreinscripciones';
import { exportApi } from '@/lib/api/export.api';
import { toast } from 'sonner';
import type { EstadoPreinscripcion } from '@/types/preinscripcion.types';

interface PreinscripcionTableProps {
  cursoId: number;
  cursoNombre: string;
}

export function PreinscripcionTable({
  cursoId,
  cursoNombre,
}: PreinscripcionTableProps) {
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoPreinscripcion | ''>(
    ''
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    id: number;
    estado: EstadoPreinscripcion;
  } | null>(null);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const {
    preinscripciones,
    loading,
    cambiarEstado,
  } = usePreinscripciones({ cursoId });

  const filtered = preinscripciones.filter((p) => {
    const matchSearch =
      !search ||
      p.nombres.toLowerCase().includes(search.toLowerCase()) ||
      p.apellidoPaterno.toLowerCase().includes(search.toLowerCase()) ||
      p.correo.toLowerCase().includes(search.toLowerCase()) ||
      (p.ci && p.ci.includes(search));

    const matchEstado = !estadoFilter || p.estado === estadoFilter;

    return matchSearch && matchEstado;
  });

  const selected = preinscripciones.find((p) => p.id === selectedId);

  const handleExport = async (tipo: 'pdf' | 'excel') => {
    try {
      setExporting(tipo);
      if (tipo === 'pdf') {
        await exportApi.descargarPDF(cursoId, cursoNombre);
      } else {
        await exportApi.descargarExcel(cursoId, cursoNombre);
      }
      toast.success(`Archivo ${tipo.toUpperCase()} descargado`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(msg);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, correo o CI..."
            icon={<Search size={18} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {(['', 'pendiente', 'aceptado', 'rechazado'] as const).map((est) => (
            <button
              key={est}
              onClick={() => setEstadoFilter(est)}
              className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                estadoFilter === est
                  ? 'bg-brand-primary/15 text-brand-primary border-brand-primary/40'
                  : 'bg-bg-secondary text-text-secondary border-border hover:border-brand-primary/40'
              }`}
            >
              {est === '' ? 'Todos' : est}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="danger"
            size="sm"
            icon={<FileText size={16} />}
            onClick={() => handleExport('pdf')}
            loading={exporting === 'pdf'}
            disabled={filtered.length === 0}
          >
            PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<FileSpreadsheet size={16} />}
            onClick={() => handleExport('excel')}
            loading={exporting === 'excel'}
            disabled={filtered.length === 0}
          >
            Excel
          </Button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <Spinner size="lg" label="Cargando preinscripciones..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={56} />}
          title="No hay preinscripciones"
          description={
            search || estadoFilter
              ? 'Prueba con otros filtros de búsqueda.'
              : 'Aún no hay estudiantes preinscritos en este curso.'
          }
        />
      ) : (
        <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-primary border-b-2 border-border">
                <tr>
                  <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Estudiante
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Contacto
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    CI
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Comprobante
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Estado
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border hover:bg-bg-hover transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-text-primary">
                        {p.nombres} {p.apellidoPaterno} {p.apellidoMaterno}
                      </div>
                      <div className="text-xs text-text-muted">
                        {formatearFecha(p.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs">✉️ {p.correo}</div>
                      {p.telefono && (
                        <div className="text-xs text-text-secondary">
                          📞 {p.telefono}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">{p.ci || '-'}</td>
                    <td className="px-4 py-4 text-center">
                      {p.comprobanteUrl ? (
                        <a
                          href={p.comprobanteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline"
                        >
                          <Eye size={14} />
                          Ver
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted">Sin archivo</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <EstadoBadge estado={p.estado} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() =>
                            setConfirmAction({ id: p.id, estado: 'aceptado' })
                          }
                          disabled={p.estado === 'aceptado'}
                          className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Aceptar"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmAction({ id: p.id, estado: 'pendiente' })
                          }
                          disabled={p.estado === 'pendiente'}
                          className="p-2 rounded-lg text-amber-400 hover:bg-amber-500/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Marcar pendiente"
                        >
                          <Clock size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmAction({ id: p.id, estado: 'rechazado' })
                          }
                          disabled={p.estado === 'rechazado'}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Rechazar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (!confirmAction) return;
          await cambiarEstado(confirmAction.id, confirmAction.estado);
          setConfirmAction(null);
        }}
        title="¿Confirmar cambio de estado?"
        description={`El estudiante será marcado como ${confirmAction?.estado}. Se le enviará un email automáticamente.`}
        variant={confirmAction?.estado === 'rechazado' ? 'danger' : 'primary'}
        confirmText="Sí, confirmar"
      />

      {/* Ver detalle */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title="Detalle de Preinscripción"
        size="lg"
      >
        {selected && (
          <div className="space-y-3">
            {[
              ['Nombre completo', `${selected.nombres} ${selected.apellidoPaterno} ${selected.apellidoMaterno || ''}`],
              ['Correo', selected.correo],
              ['Teléfono', selected.telefono || '-'],
              ['CI', selected.ci || '-'],
              ['Institución', selected.institucionEstudios || '-'],
              ['Estado', selected.estado],
              ['Observaciones', selected.observaciones || 'Sin observaciones'],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  {k}
                </span>
                <span className="text-sm text-text-primary text-right">
                  {v}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}