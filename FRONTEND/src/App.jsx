import { Box, useColorModeValue, useDisclosure } from "@chakra-ui/react"
import { Route, Routes } from "react-router-dom";
import CreatePage from "./pages/CreatePage";
import HomePage from "./pages/HomePage";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import ProductPage from "./pages/ProductPage";
import Navbar from "./components/ui/Navbar";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import WishlistPage from './pages/WishlistPage';
import NotFound from "./pages/NotFound";
import { WishlistProvider } from './context/WishlistContext';
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ComparePage from "./pages/ComparePage";
import KeyboardShortcutsModal from "./components/KeyboardShortcutsModal";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useKeyboardShortcuts({ onOpenShortcuts: onOpen });

  return (
    <WishlistProvider>
      <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/create" element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/cancel" element={<CancelPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
        <KeyboardShortcutsModal isOpen={isOpen} onClose={onClose} />
      </Box>
    </WishlistProvider>
  );
}

export default App;
