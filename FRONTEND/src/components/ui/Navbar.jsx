import React, { useState } from 'react';
import {
  Button, Container, Flex, HStack, Text, Input, useColorMode, useDisclosure,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  VStack, Box, Badge, Avatar, Menu, MenuButton, MenuList, MenuItem, useColorModeValue, useToast, Tooltip
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher.jsx';
import { PlusSquareIcon } from "@chakra-ui/icons"
import { IoMoon } from "react-icons/io5";
import { LuSun, LuShoppingCart, LuHeart, LuPackage } from "react-icons/lu";
import { useCart } from "../../store/cart";
import { useWishlist } from "../../context/WishlistContext.jsx";
import { useProductStore } from "../../store/product";
import { useAuthStore } from "../../store/auth";

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const Navbar = () => {
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { cartItems, removeFromCart, totalPrice } = useCart();
  const { wishlistCount } = useWishlist();
  const { searchQuery, setSearchQuery, products, fetchProducts } = useProductStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const labelColor = useColorModeValue("gray.600", "gray.300");

  const handleCartOpen = async () => {
    await fetchProducts();
    onOpen();
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckoutLoading(true);

    try {
      const token = user?.token || localStorage.getItem('authToken');
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify({ items: cartItems }),
      });
      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();

      if (!data.success) {
        toast({
          title: "Checkout Error",
          description: data.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      onClose();
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout failed:", err);

      let message;
      if (err instanceof TypeError) {
        message = "Network error — please check your connection";
      } else if (err.message && err.message.startsWith("Server error:")) {
        message = "Something went wrong on our end. Please try again later.";
      } else {
        message = "Failed to process checkout";
      }

      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            fontSize={{ base: "22px", sm: "28px" }}
            fontWeight={"bold"}
            textTransform={"uppercase"}
            textAlign={"center"}
            bgGradient={"linear(to-r, cyan.400, blue.500)"}
            bgClip={"text"}
            transition="all 0.3s"
            display="inline-block"
            _hover={{ transform: "scale(1.03)" }}
          >
            <Link to={"/"}>Product Store 🛒</Link>
          </Text>

          <HStack spacing={4} alignItems={"center"} justifyContent="flex-end" w={{ base: "full", sm: "auto" }}>
            <Box w={{ base: "full", sm: "240px", md: "300px" }}>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search')}
                aria-label={t('common.search')}
                bg={useColorModeValue("gray.50", "gray.700")}
                borderColor={useColorModeValue("gray.200", "gray.600")}
                _placeholder={{ color: useColorModeValue("gray.400", "gray.400") }}
              />
            </Box>

            <HStack spacing={2} alignItems={"center"}>
              {user?.role === "admin" && (
                <Link to={"/create"}>
                  <Button aria-label={t('nav.addProduct')}>
                    <PlusSquareIcon fontSize={20} />
                  </Button>
                </Link>
              )}

              <Link to={"/wishlist"}>
                <Button position="relative" aria-label="Open wishlist">
                  <LuHeart size="20" />
                  {wishlistCount > 0 && (
                    <Badge
                      colorScheme="pink"
                      borderRadius="full"
                      position="absolute"
                      top="-5px"
                      right="-5px"
                      px={2}
                    >
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {user && (
                <Tooltip label="My Orders" hasArrow>
                  <Link to={"/orders"}>
                    <Button aria-label="My Orders">
                      <LuPackage size="20" />
                    </Button>
                  </Link>
                </Tooltip>
              )}

              <Button onClick={handleCartOpen} position="relative" aria-label={t('cart.openCart')}>
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

              {user ? (
                <Menu>
                  <MenuButton as={Button} variant="ghost" borderRadius="full" p={0}>
                    <Avatar size="sm" name={user.name} />
                  </MenuButton>
                  <MenuList>
                    <MenuItem fontSize="sm" isDisabled>{user.email}</MenuItem>
                    <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button size="sm" colorScheme="blue" onClick={() => navigate("/login")}>Sign In</Button>
              )}

              <Button onClick={toggleColorMode} aria-label={t('common.toggleTheme')}>
                {colorMode === "light" ? <IoMoon /> : <LuSun size='20' />}
              </Button>
            </HStack>
          </HStack>
        </Flex>

        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
          <DrawerOverlay />
          <DrawerContent bg={colorMode === "light" ? "white" : "gray.800"} color={colorMode === "light" ? "black" : "white"}>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">{t('cart.title')}</DrawerHeader>

            <DrawerBody>
              {cartItems.length === 0 ? (
                <Text textAlign="center" mt={10} color={labelColor}>{t('cart.empty')}</Text>
              ) : (
                <VStack align="stretch" spacing={4} mt={4}>
                  {cartItems.map((item) => {
                    const latestProduct = products.find(
                      (p) => p._id === item._id
                    );

                    const currentPrice =
                      latestProduct?.price ?? item.price;

                    return (
                      <HStack
                        key={item._id}
                        justify="space-between"
                        p={3}
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                      >
                        <Box>
                          <Text fontWeight="bold">{item.name}</Text>
                          <Text fontSize="sm" color={labelColor}>
                            {t('cart.quantity')}: {item.quantity} × ${currentPrice}
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
                    );
                  })}
                </VStack>
              )}
            </DrawerBody>

            <DrawerFooter borderTopWidth="1px" display="flex" flexDirection="column" alignItems="stretch">
              <HStack justify="space-between" mb={4}>
                <Text fontWeight="bold" fontSize="lg">{t('cart.total')}:</Text>
                <Text fontWeight="bold" fontSize="lg" color="cyan.500">${Number(totalPrice ?? 0).toFixed(2)}</Text>
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