import { Box, useColorModeValue } from "@chakra-ui/react"
import { Route, Routes } from "react-router-dom";
import CreatePage from "./pages/CreatePage";
import HomePage from "./pages/HomePage";
import SuccessPage from "./pages/SuccessPage";
import ProductPage from "./pages/ProductPage";
import Navbar from "./components/ui/Navbar";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import WishlistPage from './pages/WishlistPage';
import NotFound from "./pages/NotFound";
import { WishlistProvider } from './context/WishlistContext';
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";

function App() {
  return (
    <WishlistProvider>
      <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/create" element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </Box>
    </WishlistProvider>
  );
}

export default App;