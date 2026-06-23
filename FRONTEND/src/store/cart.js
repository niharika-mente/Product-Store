import { create } from 'zustand';
import axios from 'axios';

export const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const response = await axios.get('/api/cart');
      set({ cart: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching cart:', error);
    }
  },

  addToCart: async (productId, variantId = null, quantity = 1) => {
    set({ loading: true });
    try {
      const response = await axios.post('/api/cart', { productId, variantId, quantity });
      set({ cart: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Error adding to cart:', error);
    }
  },

  removeFromCart: async (productId, variantId = null) => {
    set({ loading: true });
    try {
      const response = await axios.delete('/api/cart', { data: { productId, variantId } });
      set({ cart: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Error removing from cart:', error);
    }
  }
}));