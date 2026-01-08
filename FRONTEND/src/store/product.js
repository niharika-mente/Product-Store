import {create} from "zustand";
const API = ( import.meta.env.VITE_API_URL || "" ).replace( /\/$/, "" );


export const useProductStore = create((set) =>({
    products: [],
    setProducts: (products) => set({ products }),
    createProduct: async (newProduct) =>{

        if(!newProduct.name || !newProduct.image || !newProduct.price){
            return {success:false,message:"Please fill in all fields."};
        }
        try
        {
            const res = await fetch( `${ API }/api/products`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify( newProduct ),
            } );

            if ( !res.ok )
            {
                const errorData = await res.json().catch( () => ( {} ) );
                return { success: false, message: errorData.message || "Failed to create product." };
            }

            const data = await res.json();
            set( ( state ) => ( { products: [ ...state.products, data.data ] } ) );
            return { success: true, message: "Product created successfully" };
        } catch ( error )
        {
            console.error( "Network error creating product:", error );
            return { success: false, message: "Network error - could not reach API" };
        }
        },
    fetchProducts: async() =>{
        try
        {
            const res = await fetch( `${ API }/api/products` );
            if ( !res.ok )
            {
                const errorData = await res.json().catch( () => ( {} ) );
                console.error( "Failed to fetch products:", errorData.message );
                return;
            }
            const data = await res.json();
            set( { products: data.data } );
        } catch ( error )
        {
            console.error( "Network error fetching products:", error );
        }
    },
    deleteProduct: async(pid) => {
        try
        {
            const res = await fetch( `${ API }/api/products/${ pid }`, {
                method: "DELETE",
            } );
        const data = await res.json();
        if(!data.success) return { success: false,message: data.message};

        // update the ui immediately, without needing a refresh
        set(state => ({ products: state.products.filter(product => product._id !== pid) }));
        return { success: true, message: data.message};
        } catch ( error )
        {
            console.error( "Network error deleting product:", error );
            return { success: false, message: "Network error - could not reach API" };
        },
    updateProduct: async(pid, updatedProduct) => {
        try
        {
            const res = await fetch( `${ API }/api/products/${ pid }`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify( updatedProduct ),
            } );
            const data = await res.json();
            if ( !data.success ) return { success: false, message: data.message };
            //update the UI immediately without needing a refresh
            set( state => ( {
                products: state.products.map( product => product._id === pid ? data.data : product )
            } ) );
            return { success: true, message: data.message };
        } catch ( error )
        {
            console.error( "Network error updating product:", error );
            return { success: false, message: "Network error - could not reach API" };
        }
    }
}));

