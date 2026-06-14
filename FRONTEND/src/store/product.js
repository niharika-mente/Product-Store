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

export const useProductStore = create((set) =>({
    products: [],
    isLoading: false,
    isSubmitting: false,
    isDeleting: false,
    error: null,
    searchQuery: "",
    setProducts: (products) => set({ products }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    clearError: () => set({ error: null }),

    createProduct: async (newProduct) => {
        if (!newProduct.name || !newProduct.price) {
            return { success: false, message: "Please fill in all fields." };
        }
        if (!newProduct.imageFile && !newProduct.image) {
            return { success: false, message: "Please provide a product image." };
        }

        set({ isSubmitting: true, error: null });
        try {
            const formData = new FormData();
            formData.append("name", newProduct.name);
            formData.append("price", newProduct.price);

            if (newProduct.imageFile) {
                formData.append("image", newProduct.imageFile);
            } else {
                formData.append("image", newProduct.image);
            }

            if (newProduct.description) formData.append("description", newProduct.description);
            if (newProduct.category) formData.append("category", newProduct.category);
            if (newProduct.brand) formData.append("brand", newProduct.brand);
            if (newProduct.stock !== undefined && newProduct.stock !== '') formData.append("stock", newProduct.stock);
            if (newProduct.originalPrice !== undefined && newProduct.originalPrice !== '') formData.append("originalPrice", newProduct.originalPrice);
            if (newProduct.discount !== undefined && newProduct.discount !== '') formData.append("discount", newProduct.discount);

            const res = await fetch(`${API}/api/products`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                set({ isSubmitting: false });
                return { success: false, message: errorData.message || "Failed to create product." };
            }

            const data = await res.json();
            set((state) => ({ products: [...state.products, data.data], isSubmitting: false }));
            return { success: true, message: "Product created successfully" };
        } catch (error) {
            console.error("Network error creating product:", error);
            set({ isSubmitting: false, error: "Network error - could not reach API" });
            return { success: false, message: "Network error - could not reach API" };
        }
    },

    fetchProducts: async (page = 1, limit = 10, sort = "", category = "") => {
        set({ isLoading: true, error: null });
        try {
            let url = `${API}/api/products?page=${page}&limit=${limit}`;
            if (sort) url += `&sort=${sort}`;
            if (category) url += `&category=${encodeURIComponent(category)}`;
            const res = await fetch(url);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Failed to fetch products:", errorData.message);
                set({ isLoading: false, error: errorData.message || "Failed to fetch products" });
                return { success: false, message: errorData.message || "Failed to fetch products" };
            }
            const data = await res.json();
            set({ products: data.data, isLoading: false });
            return {
                success: true,
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalProducts: data.totalProducts,
                limit: data.limit,
            };
        } catch (error) {
            console.error("Network error fetching products:", error);
            set({ isLoading: false, error: "Network error - could not reach API" });
            return { success: false, message: "Network error fetching products." };
        }
    },

    fetchCategories: async () => {
        try {
            const res = await fetch(`${API}/api/products/categories`);
            if (!res.ok) return { success: false, data: [] };
            const data = await res.json();
            return { success: true, data: data.data };
        } catch (error) {
            console.error("Network error fetching categories:", error);
            return { success: false, data: [] };
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

            set(state => ({ products: state.products.filter(product => product._id !== pid), isDeleting: false }));
            return { success: true, message: data.message };
        } catch (error) {
            console.error("Network error deleting product:", error);
            set({ isDeleting: false, error: "Network error - could not reach API" });
            return { success: false, message: "Network error - could not reach API" };
        }
    },

    updateProduct: async (pid, updatedProduct) => {
        set({ isSubmitting: true, error: null });
        try {
            const formData = new FormData();
            formData.append("name", updatedProduct.name);
            formData.append("price", updatedProduct.price);

            if (updatedProduct.imageFile) {
                formData.append("image", updatedProduct.imageFile);
            } else if (updatedProduct.image) {
                formData.append("image", updatedProduct.image);
            }

            if (updatedProduct.description !== undefined) formData.append("description", updatedProduct.description);
            if (updatedProduct.category !== undefined) formData.append("category", updatedProduct.category);
            if (updatedProduct.brand !== undefined) formData.append("brand", updatedProduct.brand);
            if (updatedProduct.stock !== undefined && updatedProduct.stock !== '') formData.append("stock", updatedProduct.stock);
            if (updatedProduct.originalPrice !== undefined && updatedProduct.originalPrice !== '') formData.append("originalPrice", updatedProduct.originalPrice);
            if (updatedProduct.discount !== undefined && updatedProduct.discount !== '') formData.append("discount", updatedProduct.discount);

            const res = await fetch(`${API}/api/products/${pid}`, {
                method: "PUT",
                body: formData,
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
            set({ isSubmitting: false, error: "Network error - could not reach API" });
            return { success: false, message: "Network error - could not reach API" };
        }
    },
compareList: [],
    addToCompare: (product) => set((state) => {
      if (state.compareList.find((p) => p._id === product._id)) return state;
      if (state.compareList.length >= 2) return state;
      return { compareList: [...state.compareList, product] };
    }),
    removeFromCompare: (pid) => set((state) => ({
      compareList: state.compareList.filter((p) => p._id !== pid),
    })),
    clearCompare: () => set({ compareList: [] }),

    searchProducts: async (query) => {
        try {
            const res = await fetch(`${API}/api/products/search?q=${encodeURIComponent(query)}`);
            if(!res.ok){
                return {success:false,message:"Failed to search products."};
            }
            const data = await res.json();
            set({products:data.data});
            return {success:true};
        }
        catch(error){
            console.error("Network error searching products:", error);
            return {success:false,message:"Network error - could not reach API"};
        }
    }
}));