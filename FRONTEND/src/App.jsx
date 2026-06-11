import { Box, useColorModeValue } from "@chakra-ui/react"
import { Route, Routes } from "react-router-dom";
import CreatePage from "./pages/CreatePage";
import HomePage from "./pages/HomePage";
import SuccessPage from "./pages/SuccessPage";
import ProductPage from "./pages/ProductPage";
import Navbar from "./components/ui/Navbar";
import ErrorBoundary from "./components/ui/ErrorBoundary";

function App() {
  return (
    <Box minH={"100vh"} bg = {useColorModeValue("gray.100","gray.900")}>
      <Navbar />
      <ErrorBoundary>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
      </ErrorBoundary>
    </Box>
  )
}

export default App