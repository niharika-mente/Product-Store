
//import { Provider } from "./components/ui/provider";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import { BrowserRouter } from "react-router-dom";


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
