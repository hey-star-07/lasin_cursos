export const ESTADOS_PREINSCRIPCION = [
  { value: 'pendiente', label: 'Pendiente', emoji: '⏳', color: 'amber' },
  { value: 'aceptado', label: 'Aceptado', emoji: '✅', color: 'emerald' },
  { value: 'rechazado', label: 'Rechazado', emoji: '❌', color: 'red' },
] as const;

export const MODALIDADES = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
  { value: 'HIBRIDA', label: 'Híbrida' },
] as const;

export const NIVELES = [
  { value: 'BASICO', label: 'Básico' },
  { value: 'INTERMEDIO', label: 'Intermedio' },
  { value: 'AVANZADO', label: 'Avanzado' },
] as const;

export const COLORES_CURSO = [
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#EF4444',
] as const;

/* ============================================================
   Datos de contacto de LASIN (editar aquí y se actualiza en
   la barra, el footer y las páginas Proceso y Contacto)
   ============================================================ */
export const CONTACTO = {
  telefono: '+591 77862862',
  whatsappNumero: '59177862862',
  whatsappUrl: 'https://wa.me/59177862862',
  whatsappMensaje:
    'Hola, quisiera información sobre los cursos del LASIN.',
  direccion: 'UMSA, Campus Universitario, La Paz - Bolivia',
  sitioWeb: 'https://lasin.fcpn.edu.bo',
  mapaEmbed:
    'https://www.google.com/maps?q=Laboratorio+Superior+de+Inform%C3%A1tica+UMSA+La+Paz+Bolivia&output=embed',
} as const;

export const whatsappLink = (mensaje: string = CONTACTO.whatsappMensaje) =>
  `${CONTACTO.whatsappUrl}?text=${encodeURIComponent(mensaje)}`;
