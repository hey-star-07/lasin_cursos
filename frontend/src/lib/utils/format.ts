/**
 * Formatea una fecha ISO a formato local Bolivia (DD/MM/YYYY)
 */
export function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return 'Por definir';
  try {
    // Extraer solo la parte YYYY-MM-DD para evitar shift de timezone
    const match = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }

    // Fallback para otros formatos
    return new Date(fecha).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return 'Fecha inválida';
  }
}

/**
 * Formatea un monto a Bolivianos
 */
export function formatearMonto(monto: string | number | null | undefined): string {
  if (monto === null || monto === undefined) return 'Consultar';
  const num = typeof monto === 'string' ? parseFloat(monto) : monto;
  if (isNaN(num)) return 'Consultar';
  return `Bs. ${num.toFixed(2)}`;
}

/**
 * Formatea un rango horario
 */
export function formatearHorario(
  inicio: string | null | undefined,
  fin: string | null | undefined
): string {
  if (!inicio && !fin) return 'Por definir';
  if (inicio && fin) return `${inicio} – ${fin}`;
  return inicio || fin || 'Por definir';
}

/**
 * Obtiene las iniciales de un nombre
 */
export function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');
}

/**
 * Trunca un texto a un número de palabras
 */
export function truncarTexto(texto: string, palabras: number = 20): string {
  const arr = texto.split(' ');
  if (arr.length <= palabras) return texto;
  return arr.slice(0, palabras).join(' ') + '...';
}