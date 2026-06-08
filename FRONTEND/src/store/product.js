// import {create} from "zustand";
// const API = ( import.meta.env.VITE_API_URL || "" ).replace( /\/$/, "" );


// export const useProductStore = create((set) =>({
//     products: [],
//     setProducts: (products) => set({ products }),
//     createProduct: async (newProduct) =>{

//         if(!newProduct.name || !newProduct.image || !newProduct.price){
//             return {success:false,message:"Please fill in all fields."};
//         }
//         try
//         {
//             const res = await fetch( `${ API }/api/products`, {
//                 method: 'POST',
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify( newProduct ),
//             } );

//             if ( !res.ok )
//             {
//                 const errorData = await res.json().catch( () => ( {} ) );
//                 return { success: false, message: errorData.message || "Failed to create product." };
//             }

//             const data = await res.json();
//             set( ( state ) => ( { products: [ ...state.products, data.data ] } ) );
//             return { success: true, message: "Product created successfully" };
//         } catch ( error )
//         {
//             console.error( "Network error creating product:", error );
//             return { success: false, message: "Network error - could not reach API" };
//         }
//         },
//     fetchProducts: async (sort = "") => {
//         try
//         {
//             const url = sort
//     ? `${API}/api/products?sort=${sort}`
//     : `${API}/api/products`;

// const res = await fetch(url);
//             if ( !res.ok )
//             {
//                 const errorData = await res.json().catch( () => ( {} ) );
//                 console.error( "Failed to fetch products:", errorData.message );
//                 return;
//             }
//             const data = await res.json();
//             set( { products: data.data } );
//         } catch ( error )
//         {
//             console.error( "Network error fetching products:", error );
//         }
//     },
//     deleteProduct: async(pid) => {
//         try
//         {
//             const res = await fetch( `${ API }/api/products/${ pid }`, {
//                 method: "DELETE",
//             } );
//         const data = await res.json();
//         if(!data.success) return { success: false,message: data.message};

//         // update the ui immediately, without needing a refresh
//         set(state => ({ products: state.products.filter(product => product._id !== pid) }));
//         return { success: true, message: data.message};
//         } catch ( error )
//         {
//             console.error( "Network error deleting product:", error );
//             return { success: false, message: "Network error - could not reach API" };
//         }
//     },
//     updateProduct: async(pid, updatedProduct) => {
//         try
//         {
//             const res = await fetch( `${ API }/api/products/${ pid }`, {
//                 method: "PUT",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify( updatedProduct ),
//             } );
//             const data = await res.json();
//             if ( !data.success ) return { success: false, message: data.message };
//             //update the UI immediately without needing a refresh
//             set( state => ( {
//                 products: state.products.map( product => product._id === pid ? data.data : product )
//             } ) );
//             return { success: true, message: data.message };
//         } catch ( error )
//         {
//             console.error( "Network error updating product:", error );
//             return { success: false, message: "Network error - could not reach API" };
//         }
//     }
// }));

import { create } from "zustand";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const useProductStore = create((set, get) => ({
    products: [],
    isLoading: false,      // ✅ For page loading
    isSubmitting: false,   // ✅ For create/update operations
    isDeleting: false,     // ✅ For delete operations
    error: null,           // ✅ For error handling

    setProducts: (products) => set({ products }),

    createProduct: async (newProduct) => {
        if (!newProduct.name || !newProduct.image || !newProduct.price) {
            return { success: false, message: "Please fill in all fields." };
        }

        set({ isSubmitting: true, error: null }); // ✅ Start submitting

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
                set({ isSubmitting: false }); // ✅ Stop submitting
                return { success: false, message: errorData.message || "Failed to create product." };
            }

            const data = await res.json();
            set((state) => ({
                products: [...state.products, data.data],
                isSubmitting: false // ✅ Stop submitting
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
        set({ isLoading: true, error: null }); // ✅ Start loading

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
                isLoading: false // ✅ Stop loading
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
        set({ isDeleting: true, error: null }); // ✅ Start deleting

        try {
            const res = await fetch(`${API}/api/products/${pid}`, {
                method: "DELETE",
            });
            
            const data = await res.json();
            
            if (!data.success) {
                set({ isDeleting: false }); // ✅ Stop deleting
                return { success: false, message: data.message };
            }

            // update the ui immediately, without needing a refresh
            set(state => ({
                products: state.products.filter(product => product._id !== pid),
                isDeleting: false // ✅ Stop deleting
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
        set({ isSubmitting: true, error: null }); // ✅ Start submitting

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
                set({ isSubmitting: false }); // ✅ Stop submitting
                return { success: false, message: data.message };
            }

            // update the UI immediately without needing a refresh
            set(state => ({
                products: state.products.map(product => product._id === pid ? data.data : product),
                isSubmitting: false // ✅ Stop submitting
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

    // ✅ Optional: Reset error state
    clearError: () => set({ error: null }),
}));