import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx"; // Imported CartProvider

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <CartProvider> {/* Wrapped our application with Cart Context */}
          <App />
        </CartProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);