import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import './i18n';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
      <AuthProvider>
          <App />
      </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);