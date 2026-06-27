import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import './i18n';
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "./utils/registerSW";
import { useCurrencyStore } from './store/currency';
useCurrencyStore.getState().fetchRates();
registerSW();

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);