import { Button, Container, Flex, HStack, Text } from '@chakra-ui/react';
import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { PlusSquareIcon } from "@chakra-ui/icons"
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { useColorMode } from '@chakra-ui/react';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("authUser"));

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/login");
    window.location.reload();
  };

  return (
    <Container maxW={"full"} px={0}>
import React from 'react';
import { 
  Button, Container, Flex, HStack, Text, useColorMode, useDisclosure,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  VStack, Box, Badge, useColorModeValue
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { PlusSquareIcon } from "@chakra-ui/icons";
import { IoMoon } from "react-icons/io5";
import { LuSun, LuShoppingCart } from "react-icons/lu"; // Added LuShoppingCart
import { useCart } from "../../context/CartContext.jsx";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Controls Drawer sliding state
  const { cartItems, removeFromCart, totalPrice } = useCart();

  // Calculate total item count (sum of all quantities)
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
    bg={navBg}
  borderBottom="1px solid"
  borderColor={border}
  mb={4}
  >
    <Container maxW={"1140px"} px={4}>
      <Flex
        h={16}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDir={{ base: "column", sm: "row" }}
        bg={colorMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)"}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={colorMode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
        borderRadius="0"
        px={6}
        boxShadow={
          colorMode === "dark"
            ? "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)"
        }
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "1px",
          bgGradient: "linear(to-r, transparent, cyan.400, purple.500, transparent)",
        flexDir={{
          base: "column",
          sm: "row"
        }}
      >
        {/* LOGO */}
        <Text
          fontSize={{ base: "20px", md: "26px" }}
          fontWeight="900"
          letterSpacing="tight"
          bgGradient="linear(to-r, cyan.400, blue.500, purple.500)"
          bgClip="text"
          fontSize={{ base: "22px", sm: "28px" }}
          fontWeight={"bold"}
          textTransform={"uppercase"}
          textAlign={"center"}
          bgGradient={"linear(to-r, cyan.400, blue.500)"}
          bgClip={"text"}
          transition="all 0.3s"
          display="inline-block"
_hover={{
  transform: "scale(1.03)",
}}
        >
          <Link to={"/"}>Product Store 🛒</Link>
        </Text>

        {/* RIGHT ACTIONS */}
        <HStack spacing={3} alignItems="center">

          {/* Dark Mode Toggle */}
          <Button
            borderRadius="full"
            variant="ghost"
            size="sm"
            w="40px" h="40px"
            p={0}
            border="1px solid"
            borderColor={colorMode === "dark" ? "whiteAlpha.200" : "blackAlpha.100"}
            bg={colorMode === "dark" ? "whiteAlpha.100" : "whiteAlpha.600"}
            onClick={toggleColorMode}
            _hover={{
              transform: "rotate(20deg) scale(1.1)",
              borderColor: "cyan.400",
              bg: colorMode === "dark" ? "whiteAlpha.200" : "white",
            }}
            transition="all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)"
          >
            {colorMode === "light" ? <IoMoon size={16} /> : <LuSun size={16} />}
          </Button>

          {/* Divider */}
          <Flex w="1px" h="22px" bg={colorMode === "dark" ? "whiteAlpha.200" : "blackAlpha.100"} />

          {user ? (
            <>
              <Link to="/create">
                <Button
                  leftIcon={<PlusSquareIcon />}
                  size="sm"
                  bgGradient="linear(to-r, cyan.400, blue.500)"
                  color="white"
                  borderRadius="xl"
                  fontWeight="700"
                  px={5}
                  boxShadow="0 4px 15px rgba(59,130,246,0.35)"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(59,130,246,0.5)",
                  }}
                  transition="all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)"
                >
                  Create
                </Button>
              </Link>

              <Button
                size="sm"
                borderRadius="xl"
                px={5}
                fontWeight="700"
                bg={colorMode === "dark" ? "rgba(239,68,68,0.12)" : "red.50"}
                color="red.400"
                border="1px solid"
                borderColor={colorMode === "dark" ? "rgba(239,68,68,0.25)" : "red.100"}
                onClick={handleLogout}
                _hover={{
                  bg: colorMode === "dark" ? "rgba(239,68,68,0.22)" : "red.100",
                  transform: "translateY(-2px)",
                  borderColor: "red.400",
                }}
                transition="all 0.22s"
              >
                Logout
              </Button>

              <Text
                bgGradient="linear(to-r, cyan.400, blue.500)"
                bgClip="text"
                fontWeight="800"
                fontSize="15px"
              >
                {user.name}
              </Text>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button
                  size="sm"
                  borderRadius="xl"
                  px={5}
                  fontWeight="700"
                  variant="outline"
                  borderColor={colorMode === "dark" ? "whiteAlpha.200" : "blackAlpha.200"}
                  _hover={{
                    bg: colorMode === "dark" ? "whiteAlpha.100" : "blackAlpha.50",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.22s"
                >
                  Login
                </Button>
              </Link>

              <Link to="/signup">
                <Button
                  size="sm"
                  bgGradient="linear(to-r, cyan.400, blue.500)"
                  color="white"
                  borderRadius="xl"
                  px={5}
                  fontWeight="700"
                  boxShadow="0 4px 15px rgba(34,211,238,0.3)"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(34,211,238,0.5)",
                  }}
                  transition="all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        <HStack spacing={2} alignItems={"center"}>
          <Link to={"/create"}>
            <Button>
              <PlusSquareIcon fontSize={20} />
            </Button>
          </Link>

          {/* Shopping Cart Button with Dynamic Badge Count */}
          <Button onClick={onOpen} position="relative" aria-label="Open cart">
            <LuShoppingCart size="20" />
            {totalItemsCount > 0 && (
              <Badge 
                colorScheme="teal" 
                borderRadius="full" 
                position="absolute" 
                top="-5px" 
                right="-5px" 
                px={2}
              >
                {totalItemsCount}
              </Badge>
            )}
          </Button>

          <Button onClick={toggleColorMode} aria-label="Toggle color mode">
            {colorMode === "light" ? <IoMoon /> : <LuSun size='20' />}
          </Button>
        </HStack>
      </Flex>

      {/* Slide-out Cart Panel overlay */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent bg={colorMode === "light" ? "white" : "gray.800"} color={colorMode === "light" ? "black" : "white"}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Shopping Cart</DrawerHeader>

          <DrawerBody>
            {cartItems.length === 0 ? (
              <Text textAlign="center" mt={10} color="gray.500">Your cart is empty.</Text>
            ) : (
              <VStack align="stretch" spacing={4} mt={4}>
                {cartItems.map((item) => (
                  <HStack key={item._id} justify="space-between" p={3} borderWidth="1px" borderRadius="lg" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                    <Box>
                      <Text fontWeight="bold">{item.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        Qty: {item.quantity} × ${item.price}
                      </Text>
                    </Box>
                    <Button 
                      size="sm" 
                      colorScheme="red" 
                      variant="ghost" 
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </Button>
                  </HStack>
                ))}
              </VStack>
            )}
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px" display="flex" flexDirection="column" alignItems="stretch">
            <HStack justify="space-between" mb={4}>
              <Text fontWeight="bold" fontSize="lg">Total Amount:</Text>
              <Text fontWeight="bold" fontSize="lg" color="cyan.500">${totalPrice.toFixed(2)}</Text>
            </HStack>
            <Button colorScheme="blue" size="lg" width="100%">
              Proceed to Checkout
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Container>
    </Box>
  );
};

export default Navbar;