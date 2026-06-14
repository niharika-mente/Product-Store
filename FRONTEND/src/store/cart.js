import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      cartItems: [],

      addToCart: (product) => {
        set((state) => {
          const existingItem = state.cartItems.find((item) => item._id === product._id);
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          return { cartItems: [...state.cartItems, { ...product, quantity: 1 }] };
        });
      },

      removeFromCart: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item._id !== id),
        }));
      },

      emptyCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'productStoreCart',
    }
  )
);

export const useCart = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const emptyCart = useCartStore((state) => state.emptyCart);
  
  const totalPrice = cartItems.reduce((total, item) => total + (Number(item.price) || 0) * (item.quantity || 1), 0);

  return { cartItems, addToCart, removeFromCart, emptyCart, totalPrice };
};