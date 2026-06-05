import React, { useState } from 'react';
import { 
  Button, Container, Flex, HStack, Text, Input, useColorMode, useDisclosure,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  VStack, Box, Badge, useColorModeValue, useToast
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusSquareIcon } from "@chakra-ui/icons"
import { IoMoon } from "react-icons/io5";
import { LuSun, LuShoppingCart } from "react-icons/lu"; // Added LuShoppingCart

import { useCart } from "../../store/cart";
import { useProductStore } from "../../store/product";


const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Controls Drawer sliding state
  const { cartItems, removeFromCart, emptyCart, totalPrice } = useCart();
  const { searchQuery, setSearchQuery } = useProductStore();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("authUser"));

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/login");
    window.location.reload();
  };
  // Calculate total item count (sum of all quantities)
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const labelColor = useColorModeValue("gray.600", "gray.300");

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckoutLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }),
      });
      const data = await res.json();

      if (!data.success) {
        toast({ title: "Checkout Error", description: data.message, status: "error", duration: 3000, isClosable: true });
        return;
      }

      emptyCart();
      onClose();
      navigate("/success");
    } catch {
      toast({ title: "Error", description: "Failed to process checkout", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <Box
    bg={navBg}
  borderBottom="1px solid"
  borderColor={border}
  mb={{ base: 6, sm: 4 }}
  position="sticky"
  top="0"
  zIndex="1000"
  >
    <Container maxW={"1140px"} px={4}>
      <Flex
  minH={16}
  py={{ base: 3, sm: 0 }}
  alignItems="center"
  justifyContent="space-between"
  flexDir={{ base: "column", sm: "row" }}
  gap={{ base: 2, sm: 0 }}
>
        <Text
          fontSize={{ base: "20px", md: "26px" }}
          fontWeight="900"
          letterSpacing="tight"
          bgGradient="linear(to-r, cyan.400, blue.500, purple.500)"
          bgClip="text"
        >
          <Link to={"/"}>Product Store 🛒</Link>
        </Text>

        <HStack spacing={4} alignItems={"center"} justifyContent="flex-end" w={{ base: "full", sm: "auto" }}>
          <Box w={{ base: "full", sm: "240px", md: "300px" }}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              bg={useColorModeValue("gray.50", "gray.700")}
              borderColor={useColorModeValue("gray.200", "gray.600")}
              _placeholder={{ color: useColorModeValue("gray.400", "gray.400") }}
            />
          </Box>

          <HStack spacing={2} alignItems={"center"}>
            <Link to={"/create"}>
              <Button aria-label="Create new product">
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
        </HStack>
      </Flex>

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

          <DrawerBody>
            {cartItems.length === 0 ? (
              <Text textAlign="center" mt={10} color={labelColor}>Your cart is empty.</Text>
            ) : (
              <VStack align="stretch" spacing={4} mt={4}>
                {cartItems.map((item) => (
                  <HStack key={item._id} justify="space-between" p={3} borderWidth="1px" borderRadius="lg" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                    <Box>
                      <Text fontWeight="bold">{item.name}</Text>
                      <Text fontSize="sm" color={labelColor}>
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
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;
