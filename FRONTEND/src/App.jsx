import { Box, useColorModeValue } from "@chakra-ui/react"
import { Route, Routes } from "react-router-dom";
import CreatePage from "./pages/CreatePage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/ui/Navbar";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <Box minH={"100vh"} bg = {useColorModeValue("gray.100","gray.900")}>
      <Navbar />
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" 
          element={
          <ProtectedRoute>
 <CreatePage />
          </ProtectedRoute>
           
        
            } />
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/login" element={<Login/>}/>
      </Routes>
    </Box>
  )
}

export default App
