import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      register: async (name, email, password) => {
        const res = await fetch(`${API}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        set({ user: data.data, token: data.data.token });
        return data.data;
      },

      login: async (email, password) => {
        const res = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        set({ user: data.data, token: data.data.token });
        return data.data;
      },

      loadUser: async () => {
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

      logout: () => set({ user: null, token: null }),
    }),
    { name: 'productStoreAuth' }
  )
);
