import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      cartItems: [],

      addToCart: (product, quantity = 1) => {
        const stockTracked = product.stock != null;
        if (stockTracked && product.stock === 0) return { status: 'out_of_stock', added: 0 };

        let status = 'added';
        let added = 0;

        set((state) => {
          const existingItem = state.cartItems.find((item) => item._id === product._id);
          const currentQty = existingItem ? existingItem.quantity : 0;

          let canAdd = quantity;
          if (stockTracked) {
            const available = product.stock - currentQty;
            if (available <= 0) {
              status = 'capped';
              added = 0;
              return state;
            }
            canAdd = Math.min(quantity, available);
            if (canAdd < quantity) status = 'capped';
          }
          added = canAdd;

          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item._id === product._id ? { ...item, quantity: item.quantity + canAdd } : item
              ),
            };
          }
          return { cartItems: [...state.cartItems, { ...product, quantity: canAdd }] };
        });

        return { status, added };
      },

      removeFromCart: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item._id !== id),
        }));
      },

      addBundleToCart: (items) => {
        let addedCount = 0;
        let skippedCount = 0;
        set((state) => {
          const updated = [...state.cartItems];
          for (const item of items) {
            const stockTracked = item.stock != null;
            const idx = updated.findIndex((i) => i._id === item._id);
            const currentQty = idx >= 0 ? updated[idx].quantity : 0;

            if (stockTracked) {
              const available = item.stock - currentQty;
              if (available <= 0) {
                skippedCount++;
                continue;
              }
            }

            if (idx >= 0) {
              updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
            } else {
              updated.push({ ...item, quantity: 1 });
            }
            addedCount++;
          }
          return { cartItems: updated };
        });
        return { addedCount, skippedCount };
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
  const addBundleToCart = useCartStore((state) => state.addBundleToCart);
  const emptyCart = useCartStore((state) => state.emptyCart);
  
  const totalPrice = cartItems.reduce((total, item) => total + (Number(item.price) || 0) * (item.quantity || 1), 0);

  return { cartItems, addToCart, removeFromCart, addBundleToCart, emptyCart, totalPrice };
};