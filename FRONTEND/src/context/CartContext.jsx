import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Try to load an existing cart from browser storage on startup
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('productStoreCart');
    return localData ? JSON.parse(localData) : [];
  });

  // Automatically save to localStorage whenever the cart changes
  useEffect(() => {
    localStorage.setItem('productStoreCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Function to add an item
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Check if the item is already in the cart
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        // If it exists, increase its quantity by 1
        return prevItems.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // If it's new, add it to the array with a starting quantity of 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Function to remove an item completely
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
  };

  // Calculate total price dynamically
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Function to empty the cart
  const emptyCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, emptyCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook so we don't have to repeatedly type useContext(CartContext)
export const useCart = () => useContext(CartContext);