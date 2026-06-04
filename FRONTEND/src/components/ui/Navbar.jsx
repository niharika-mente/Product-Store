import React, { useState } from 'react';
import { 
  Button, Container, Flex, HStack, Text, useColorMode, useDisclosure,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  VStack, Box, Badge, useColorModeValue, useToast
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusSquareIcon } from "@chakra-ui/icons";
import { IoMoon } from "react-icons/io5";
import { LuSun, LuShoppingCart } from "react-icons/lu"; // Added LuShoppingCart
import { useCart } from "../../context/CartContext.jsx";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Controls Drawer sliding state
  const { cartItems, removeFromCart, emptyCart, totalPrice } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Calculate total item count (sum of all quantities)
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

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
    } catch (error) {
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

        <HStack spacing={2} alignItems={"center"}>
          <Link to={"/create"}>
            <Button size={{ base: "sm", sm: "md" }}>
              <PlusSquareIcon fontSize={20} />
            </Button>
          </Link>

          {/* Shopping Cart Button with Dynamic Badge Count */}
          <Button size={{ base: "sm", sm: "md" }} onClick={onOpen} position="relative" aria-label="Open cart">
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

          <Button size={{ base: "sm", sm: "md" }} onClick={toggleColorMode} aria-label="Toggle color mode">
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
            <Button colorScheme="blue" size="lg" width="100%" onClick={handleCheckout} isLoading={isCheckoutLoading} isDisabled={cartItems.length === 0}>
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