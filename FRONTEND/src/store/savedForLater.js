import { create } from "zustand";
import { persist } from "zustand/middleware";
import { notify } from "../utils/toastService";

export const useSavedForLaterStore = create(
  persist(
    (set, get) => ({
      savedItems: [],

      // Load items from backend and merge with local items
      syncWithBackend: async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        try {
          const localItems = get().savedItems.map((item) => item._id);
          const res = await fetch("/api/saved-for-later/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items: localItems }),
          });

          if (res.ok) {
            const json = await res.json();
            set({ savedItems: json.data?.products || [] });
          }
        } catch (error) {
          console.error("Failed to sync saved items:", error);
        }
      },

      fetchSavedItems: async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        try {
          const res = await fetch("/api/saved-for-later", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            set({ savedItems: json.data?.products || [] });
          }
        } catch (error) {
          console.error("Failed to fetch saved items:", error);
        }
      },

      saveForLater: async (product) => {
        const token = localStorage.getItem("authToken");
        set((state) => {
          if (state.savedItems.some((item) => item._id === product._id)) {
            return state; // Already saved
          }
          return { savedItems: [...state.savedItems, product] };
        });

        if (token) {
          try {
            await fetch("/api/saved-for-later/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ productId: product._id }),
            });
          } catch (error) {
            console.error("Failed to save product to backend:", error);
          }
        }
        
        notify.success("Item saved for later");
      },

      removeFromSaved: async (productId) => {
        const token = localStorage.getItem("authToken");
        set((state) => ({
          savedItems: state.savedItems.filter((item) => item._id !== productId),
        }));

        if (token) {
          try {
            await fetch(`/api/saved-for-later/remove/${productId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (error) {
            console.error("Failed to remove product from backend:", error);
          }
        }
      },
      
      clearLocalSavedItems: () => set({ savedItems: [] }),

    }),
    {
      name: "savedForLaterStore",
    }
  )
);

export const useSavedForLater = () => {
  const store = useSavedForLaterStore();
  return store;
};
