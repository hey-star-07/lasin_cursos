export interface Curso {
  id: number;
  nombre: string;
  nivel: string | null;
  modalidad: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  horaInicio: string | null;
  horaFin: string | null;
  duracion: string | null;
  costo: string | number;
  color: string | null;
  descripcion: string | null;
  totalHoras: number | null;
  instructor: string | null;
  contenido: string | null;
  requisitosPrevios: string | null;
  enlaceWhatsapp: string | null;
  aficheUrl: string | null;
  afichePublicId: string | null;
  publicado: boolean;
  createdAt: string;
  updatedAt: string;
  /**
   * Contadores que calcula el backend:
   *  - preinscripciones: TODOS los formularios recibidos (preinscritos)
   *  - aceptadas: solo los aceptados (inscritos)
   */
  _count?: {
    preinscripciones: number;
    aceptadas: number;
    pendientes: number;
    rechazadas: number;
  };
}

export interface CursoFormData {
  nombre: string;
  nivel?: string | null;
  modalidad?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  horaInicio?: string | null;
  horaFin?: string | null;
  duracion?: string | null;
  costo?: number;
  color?: string | null;
  descripcion?: string | null;
  totalHoras?: number | null;
  instructor?: string | null;
  contenido?: string | null;
  requisitosPrevios?: string | null;
  enlaceWhatsapp?: string | null;
  afiche?: File | null;
}