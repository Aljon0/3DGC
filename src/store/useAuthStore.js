import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ── State ─────────────────────────────────────────────
        user:            null,
        token:           null,
        isAuthenticated: false,
        isLoading:       false,
        error:           null,
        _hasHydrated:    false,   // runtime only — not persisted

        // ── Derived helpers ────────────────────────────────────
        isAdmin:    () => get().user?.role === 'admin',
        isCustomer: () => get().user?.role === 'customer',

        // ── Actions ───────────────────────────────────────────
        setHasHydrated: (val) => set({ _hasHydrated: val }),

        setAuth: (user, token) => set({
          user,
          token,
          isAuthenticated: true,
          error:           null,
        }),

        updateUser: (fields) => set((state) => ({
          user: { ...state.user, ...fields },
        })),

        logout: () => set({
          user:            null,
          token:           null,
          isAuthenticated: false,
          error:           null,
          // DO NOT reset _hasHydrated here — it should stay true
          // after hydration regardless of login state
        }),

        setLoading: (isLoading) => set({ isLoading }),
        setError:   (error)     => set({ error }),
        clearError: ()          => set({ error: null }),
      }),
      {
        name: 'ds-auth',

        // ── Only persist auth state — NOT runtime flags ────────
        partialize: (state) => ({
          user:            state.user,
          token:           state.token,
          isAuthenticated: state.isAuthenticated,
          // _hasHydrated intentionally excluded
        }),

        onRehydrateStorage: () => (state) => {
          // Called once when Zustand finishes reading from localStorage
          state?.setHasHydrated(true);
        },
      }
    ),
    { name: 'AuthStore' }
  )
);

export default useAuthStore;