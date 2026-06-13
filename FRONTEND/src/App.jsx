// import { Box, useColorModeValue } from "@chakra-ui/react"
// import { Route, Routes } from "react-router-dom";
// import CreatePage from "./pages/CreatePage";
// import HomePage from "./pages/HomePage";
// import SuccessPage from "./pages/SuccessPage";
// import ProductPage from "./pages/ProductPage";
// import Navbar from "./components/ui/Navbar";

// function App() {
//   return (
//     <Box minH={"100vh"} bg = {useColorModeValue("gray.100","gray.900")}>
//       <Navbar />
//       <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/create" element={<CreatePage />} />
//           <Route path="/success" element={<SuccessPage />} />
//           <Route path="/product/:id" element={<ProductPage />} />
//       </Routes>
//     </Box>
//   )
// }

// export default App

import { Box, useColorModeValue } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
import Navbar from './components/ui/Navbar';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import SuccessPage from './pages/SuccessPage';
import ProductPage from './pages/ProductPage';
import WishlistPage from './pages/WishlistPage';  // ✅ Import
import { WishlistProvider } from './context/WishlistContext';

function App() {
  return (
    <WishlistProvider>   {/* ✅ Ye line add karo */}
      <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>
      </Box>
    </WishlistProvider>  
  );
}

export default App;