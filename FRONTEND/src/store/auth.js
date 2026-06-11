import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        const res = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        set({ user: data.data.user, token: data.data.token });
        return data.data;
      },

      register: async (name, email, password) => {
        const res = await fetch(`${API}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        set({ user: data.data.user, token: data.data.token });
        return data.data;
      },

      setAuth: (token, user) => set({ token, user }),

      logout: () => set({ user: null, token: null }),

      fetchMe: async () => {
        const state = useAuthStore.getState();
        if (!state.token) return;
        try {
          const res = await fetch(`${API}/api/auth/me`, {
            headers: { Authorization: `Bearer ${state.token}` },
          });
          const data = await res.json();
          if (data.success) {
            set({ user: data.data });
          } else {
            set({ user: null, token: null });
          }
        } catch {
          set({ user: null, token: null });
        }
      },
    }),
    { name: 'productStoreAuth' }
  )
);
