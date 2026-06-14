import { Box, useColorModeValue } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import SuccessPage from './pages/SuccessPage';
import ProductPage from './pages/ProductPage';
import WishlistPage from './pages/WishlistPage';
import NotFound from "./pages/NotFound";
import { WishlistProvider } from './context/WishlistContext';
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  return (
    <WishlistProvider>
      <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
        <Navbar />
        <Routes>
          <Route path="/" element={
            user ? <HomePage /> : <Navigate to="/signup" replace />
          } />
          <Route path="/create" element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          } />

          <Route path="/signup" element={
            user ? <Navigate to="/" replace /> : <Signup />
          } />

          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <Login />
          } />

          <Route path="/success" element={<SuccessPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </WishlistProvider>
  );
}

export default App;