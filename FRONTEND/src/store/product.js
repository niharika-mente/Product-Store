import { create } from "zustand";
import { persist } from "zustand/middleware";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const useRecentlyViewed = create(
  persist(
    (set) => ({
      recentlyViewed: [],
      addRecentlyViewed: (product) => set((state) => {
        const filtered = state.recentlyViewed.filter((p) => p._id !== product._id);
        return { recentlyViewed: [product, ...filtered].slice(0, 10) };
      }),
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    { name: "recently-viewed-products" }
  )
);

export const useProductStore = create((set, get) => ({
  products: [],
  isLoading: false,
  isSubmitting: false,
  isDeleting: false,
  error: null,
  searchQuery: "",

  setProducts: (products) => set({ products }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  createProduct: async (newProduct) => {
    if (!newProduct.name || !newProduct.image || !newProduct.price) {
      return { success: false, message: "Please fill in all fields." };
    }

    set({ isSubmitting: true, error: null });

    try {
      const res = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        set({ isSubmitting: false });
        return { success: false, message: errorData.message || "Failed to create product." };
      }

      const data = await res.json();
      set((state) => ({
        products: [...state.products, data.data],
        isSubmitting: false
      }));
      return { success: true, message: "Product created successfully" };

    } catch (error) {
      console.error("Network error creating product:", error);
      set({
        isSubmitting: false,
        error: "Network error - could not reach API"
      });
      return { success: false, message: "Network error - could not reach API" };
    }
  },

  fetchProducts: async (sort = "") => {
    set({ isLoading: true, error: null });

    try {
      const url = sort
        ? `${API}/api/products?sort=${sort}`
        : `${API}/api/products`;

      const res = await fetch(url);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to fetch products:", errorData.message);
        set({
          isLoading: false,
          error: errorData.message || "Failed to fetch products"
        });
        return;
      }

      const data = await res.json();
      set({
        products: data.data,
        isLoading: false
      });

    } catch (error) {
      console.error("Network error fetching products:", error);
      set({
        isLoading: false,
        error: "Network error - could not reach API"
      });
    }
  },

  deleteProduct: async (pid) => {
    set({ isDeleting: true, error: null });

    try {
      const res = await fetch(`${API}/api/products/${pid}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        set({ isDeleting: false });
        return { success: false, message: data.message };
      }

      set(state => ({
        products: state.products.filter(product => product._id !== pid),
        isDeleting: false
      }));
      return { success: true, message: data.message };

    } catch (error) {
      console.error("Network error deleting product:", error);
      set({
        isDeleting: false,
        error: "Network error - could not reach API"
      });
      return { success: false, message: "Network error - could not reach API" };
    }
  },

  updateProduct: async (pid, updatedProduct) => {
    set({ isSubmitting: true, error: null });

    try {
      const res = await fetch(`${API}/api/products/${pid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      const data = await res.json();

      if (!data.success) {
        set({ isSubmitting: false });
        return { success: false, message: data.message };
      }

      set(state => ({
        products: state.products.map(product => product._id === pid ? data.data : product),
        isSubmitting: false
      }));
      return { success: true, message: data.message };

    } catch (error) {
      console.error("Network error updating product:", error);
      set({
        isSubmitting: false,
        error: "Network error - could not reach API"
      });
      return { success: false, message: "Network error - could not reach API" };
    }
  },

  searchProducts: async (query) => {
    try {
      const res = await fetch(`${API}/api/products/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        return { success: false, message: "Failed to search products." };
      }
      const data = await res.json();
      set({ products: data.data });
      return { success: true };
    } catch (error) {
      console.error("Network error searching products:", error);
      return { success: false, message: "Network error - could not reach API" };
    }
  },

  clearError: () => set({ error: null }),
}));