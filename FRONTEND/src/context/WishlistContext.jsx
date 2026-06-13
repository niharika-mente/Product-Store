import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from '../utils/axios';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ No token check — direct API call
  const fetchWishlist = useCallback(async () => {
    try {
      setError(null);
      const { data } = await axios.get('/wishlist');
      const products = data.products || [];
      setWishlist(products);
      setWishlistCount(products.length);
    } catch (err) {
      console.error('Fetch wishlist error:', err);
      setError(err.response?.data?.message || 'Failed to fetch wishlist');
      setWishlist([]);
      setWishlistCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (productId) => {
    try {
      setError(null);
      await axios.post('/wishlist/add', { productId });
      await fetchWishlist();
      return { success: true };
    } catch (err) {
      console.error('Add to wishlist error:', err);
      setError(err.response?.data?.message || 'Failed to add to wishlist');
      return { success: false, message: err.response?.data?.message };
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      setError(null);
      await axios.delete(`/wishlist/remove/${productId}`);
      await fetchWishlist();
      return { success: true };
    } catch (err) {
      console.error('Remove from wishlist error:', err);
      setError(err.response?.data?.message || 'Failed to remove from wishlist');
      return { success: false, message: err.response?.data?.message };
    }
  }, [fetchWishlist]);

  const checkInWishlist = useCallback((productId) => {
    return wishlist.some((item) => item._id === productId);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    setWishlistCount(0);
    setError(null);
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const value = {
    wishlist,
    wishlistCount,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    fetchWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}; 