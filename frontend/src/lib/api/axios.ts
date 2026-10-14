import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Evita redirigir varias veces cuando fallan varias peticiones a la vez
let cerrandoSesion = false;

// ===== INTERCEPTOR DE REQUEST =====
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // Fuente principal: el store de sesión. Respaldo: la clave "token".
      const token =
        useAuthStore.getState().token || localStorage.getItem('token');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== INTERCEPTOR DE RESPONSE =====
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || 'Error desconocido';

    // Token expirado o inválido
    if (status === 401 && typeof window !== 'undefined') {
      const isLoginRequest = error.config?.url?.includes('/auth/login');

      if (!isLoginRequest && !cerrandoSesion) {
        cerrandoSesion = true;

        // Cierra la sesión en el store Y en localStorage ("auth-storage" incluido).
        // Antes solo se borraban "token" y "usuario", el store seguía diciendo
        // "autenticado" y /login mandaba de vuelta a /admin: bucle infinito.
        useAuthStore.getState().logout();

        if (!window.location.pathname.startsWith('/login')) {
          window.location.replace('/login');
        } else {
          cerrandoSesion = false;
        }
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;