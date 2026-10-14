import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Usuario } from '@/types/auth.types';

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

/** Indica si un JWT tiene formato válido y todavía no expiró. */
function tokenVigente(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(base64));
    // Si el token no trae "exp" lo damos por válido; el backend decide
    return typeof json.exp !== 'number' || json.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      login: (token, usuario) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('usuario', JSON.stringify(usuario));
        }
        set({ token, usuario, isAuthenticated: true });
      },

      // Limpia TODO el rastro de la sesión (store persistido + claves sueltas)
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
        }
        set({ token: null, usuario: null, isAuthenticated: false });
      },

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Sesión guardada pero sin token válido o ya vencida -> se descarta.
        // Esto evita que /login y /admin se redirijan entre sí en bucle.
        if (state.isAuthenticated && !tokenVigente(state.token)) {
          state.logout();
        } else if (state.token && typeof window !== 'undefined') {
          // Mantener sincronizada la clave "token" que usa axios como respaldo
          localStorage.setItem('token', state.token);
        }

        state.setHasHydrated(true);
      },
    }
  )
);