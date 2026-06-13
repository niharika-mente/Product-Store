import {create} from "zustand";
import {persist} from "zustand/middleware";
const API = ( import.meta.env.VITE_API_URL || "" ).replace( /\/$/, "" );

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
    searchQuery: "",
    setProducts: (products) => set({ products }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),

    createProduct: async (newProduct) => {
        if (!newProduct.name || !newProduct.price) {
            return { success: false, message: "Please fill in all fields." };
        }
        if (!newProduct.imageFile && !newProduct.image) {
            return { success: false, message: "Please provide a product image." };
        }

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
                return { success: false, message: errorData.message || "Failed to create product." };
            }

            const data = await res.json();
            set((state) => ({ products: [...state.products, data.data] }));
            return { success: true, message: "Product created successfully" };
        } catch (error) {
            console.error("Network error creating product:", error);
            return { success: false, message: "Network error - could not reach API" };
        }
    },

    fetchProducts: async (sort = "") => {
        try {
            const url = sort
                ? `${API}/api/products?sort=${sort}`
                : `${API}/api/products`;

            const res = await fetch(url);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Failed to fetch products:", errorData.message);
                return;
            }
            const data = await res.json();
            set({ products: data.data });
        } catch (error) {
            console.error("Network error fetching products:", error);
        }
    },

    deleteProduct: async (pid) => {
        try {
            const res = await fetch(`${API}/api/products/${pid}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!data.success) return { success: false, message: data.message };

            set(state => ({ products: state.products.filter(product => product._id !== pid) }));
            return { success: true, message: data.message };
        } catch (error) {
            console.error("Network error deleting product:", error);
            return { success: false, message: "Network error - could not reach API" };
        }
    },

    updateProduct: async (pid, updatedProduct) => {
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
            if (!data.success) return { success: false, message: data.message };

            set(state => ({
                products: state.products.map(product => product._id === pid ? data.data : product)
            }));
            return { success: true, message: data.message };
        } catch (error) {
            console.error("Network error updating product:", error);
            return { success: false, message: "Network error - could not reach API" };
        }
    },
    searchProducts:async(query)=>{
        try{
            const res=await fetch(`${API}/api/products/search?q=${encodeURIComponent(query)}`);
            if(!res.ok){
                return {success:false,message:"Failed to search products."};
            }
            const data=await res.json();
            set({products:data.data});
            return {success:true};
        }
        catch(error){
            console.error("Network error searching products:", error);
            return {success:false,message:"Network error - could not reach API"};
        }

    }
}));
