'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api/auth.api';
import { toast } from 'sonner';

export function useAuth() {
  const router = useRouter();
  const { usuario, token, isAuthenticated, login, logout, _hasHydrated } =
    useAuthStore();

  const loginWithApi = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      login(response.token, response.usuario);
      return response;
    } catch (error) {
      // Re-lanzar para que el componente lo maneje
      throw error;
    }
  };

  const logoutWithRedirect = (redirectTo: string = '/') => {
    logout();
    router.push(redirectTo);
  };

  return {
    usuario,
    token,
    isAuthenticated,
    isLoading: !_hasHydrated,
    login: loginWithApi,
    logout: logoutWithRedirect,
  };
}

/**
 * Hook para páginas protegidas del admin.
 * Redirige a /login si no está autenticado (solo si NO estamos ya en /login).
 */
export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // 1. Esperar a que Zustand rehidrate
    if (!_hasHydrated) return;

    // 2. Si ya estamos en /login, no hacer nada (evita loop)
    if (pathname === '/login') return;

    // 3. Si no está autenticado, redirigir
    if (!isAuthenticated) {
      console.warn('🚪 Redirigiendo a login: no autenticado');
      router.replace('/login');
    }
  }, [isAuthenticated, _hasHydrated, router, pathname]);

  return { isAuthenticated, isLoading: !_hasHydrated };
}