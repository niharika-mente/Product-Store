import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const FALLBACK_RATES = { USD: 1, EUR: 0.92, INR: 83.5 };

export const useCurrencyStore = create(
  persist(
    (set, get) => ({
      currency: 'USD',
      rates: FALLBACK_RATES,
      ratesLoaded: false,

      setCurrency: (currency) => set({ currency }),

      fetchRates: async () => {
        if (get().ratesLoaded) return;
        try {
          const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,INR');
          if (!res.ok) throw new Error('API error');
          const data = await res.json();
          set({
            rates: { USD: 1, EUR: data.rates.EUR, INR: data.rates.INR },
            ratesLoaded: true,
          });
        } catch {
          set({ rates: FALLBACK_RATES, ratesLoaded: true });
        }
      },
    }),
    { name: 'currency-preference' }
  )
);