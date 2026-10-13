import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// ===== INTERCEPTOR DE REQUEST =====
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;

        // Debug en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `🔐 [API] ${config.method?.toUpperCase()} ${config.url} - Token enviado: ${token.substring(0, 20)}...`
          );
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.warn(
          `⚠️  [API] ${config.method?.toUpperCase()} ${config.url} - Sin token`
        );
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

    // Debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `❌ [API] Error ${status || 'network'} en ${error.config?.method?.toUpperCase()} ${error.config?.url}: ${message}`
      );
    }

    // Token expirado o inválido
    if (status === 401 && typeof window !== 'undefined') {
      // Evitar loop infinito en el login
      const isLoginRequest = error.config?.url?.includes('/auth/login');

      if (!isLoginRequest) {
        console.warn('🚪 [API] Sesión expirada, redirigiendo a login...');
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;