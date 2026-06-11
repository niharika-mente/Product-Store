import { useEffect } from "react";
import { Box, useColorModeValue } from "@chakra-ui/react"
import { Route, Routes } from "react-router-dom";
import CreatePage from "./pages/CreatePage";
import HomePage from "./pages/HomePage";
import SuccessPage from "./pages/SuccessPage";
import ProductPage from "./pages/ProductPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import Navbar from "./components/ui/Navbar";
import { useAuthStore } from "./store/auth";

function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <Box minH={"100vh"} bg = {useColorModeValue("gray.100","gray.900")}>
      <Navbar />
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
    </Box>
  )
}

export default App