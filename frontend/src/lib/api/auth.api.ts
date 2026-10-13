import apiClient from './axios';
import type { LoginPayload, LoginResponse, Usuario } from '@/types/auth.types';

const MAX_INTENTOS = 5;
const ESPERA_BASE_MS = 4000; // 4s, 8s, 12s, 16s entre intentos (~40s en total)

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Solo reintentamos cuando el servidor no respondió (dormido/reiniciando). */
function esErrorDeRed(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : '';
  return msg === 'Network Error' || msg.toLowerCase().includes('timeout');
}

export const authApi = {
  /**
   * Hace un ping a /health para despertar el backend (Render free).
   * Es "fire and forget": nunca lanza error.
   */
  async warmUp(): Promise<void> {
    try {
      const base = apiClient.defaults.baseURL ?? '';
      const healthUrl = base.replace(/\/api\/?$/, '') + '/health';
      await fetch(healthUrl, { method: 'GET', mode: 'no-cors', cache: 'no-store' });
    } catch {
      // ignorar
    }
  },

  async login(
    payload: LoginPayload,
    onRetry?: (intento: number, max: number) => void
  ): Promise<LoginResponse> {
    let ultimoError: unknown;

    for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
      try {
        const { data } = await apiClient.post<LoginResponse>(
          '/auth/login',
          payload
        );
        return data;
      } catch (error) {
        ultimoError = error;

        // Credenciales inválidas, validación, etc.: no reintentar
        if (!esErrorDeRed(error) || intento === MAX_INTENTOS) throw error;

        onRetry?.(intento, MAX_INTENTOS);
        await esperar(ESPERA_BASE_MS * intento);
      }
    }

    throw ultimoError;
  },

  async me(): Promise<{ status: 'ok'; usuario: Usuario }> {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};