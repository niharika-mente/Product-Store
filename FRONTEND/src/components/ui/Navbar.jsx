import React, { useState, useEffect } from 'react';
import {
  Button, Container, Flex, HStack, Text, Input, useColorMode, useDisclosure,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  VStack, Box, Badge, useColorModeValue, useToast, Tooltip,
  InputGroup, InputLeftElement, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Avatar
} from '@chakra-ui/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher.jsx';
import { IoMoon } from "react-icons/io5";
import { LuSun, LuShoppingCart, LuHeart, LuPackage, LuSearch, LuPlus, LuLogOut, LuShoppingBag } from "react-icons/lu";
import { useCart } from "../../store/cart";
import { useWishlist } from "../../context/WishlistContext.jsx";
import { useProductStore } from "../../store/product";

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const Navbar = () => {
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { cartItems, removeFromCart, totalPrice, emptyCart } = useCart();
  const { wishlistCount, clearWishlist } = useWishlist();
  const { searchQuery, setSearchQuery, products, fetchProducts } = useProductStore();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("authToken"));
  }, [location]);

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Top-level hook color definitions (violates rules of hooks if called conditionally)
  const navBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(26, 32, 44, 0.85)");
  const border = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(74, 85, 104, 0.8)");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const inputBg = useColorModeValue("gray.50", "gray.900");
  const inputBorder = useColorModeValue("gray.200", "gray.700");
  const buttonHoverBg = useColorModeValue("gray.100", "gray.700");
  
  const logoTextColor = useColorModeValue("gray.700", "gray.300");
  const badgeBorderColor = useColorModeValue("white", "gray.850");
  const menuItemHoverBg = useColorModeValue("gray.50", "gray.700");
  const logoutItemHoverBg = useColorModeValue("red.50", "rgba(229, 62, 62, 0.1)");

  const handleCartOpen = async () => {
    await fetchProducts();
    onOpen();
  };

  const authUser = (() => {
    try {
      const userStr = localStorage.getItem('authUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        await fetch(`${API}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.error("Failed to call logout API:", err);
      }
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    emptyCart();
    clearWishlist();
    toast({
      title: t('auth.loggedOut', 'Logged Out'),
      description: t('auth.loggedOutDesc', 'Successfully logged out of your account.'),
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/login");
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckoutLoading(true);

    try {
      const token = localStorage.getItem('authToken');
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

  return (
    <Box
      bg={navBg}
      backdropFilter="blur(12px)"
      borderBottom="1px solid"
      borderColor={border}
      mb={{ base: 6, sm: 4 }}
      position="sticky"
      top="0"
      zIndex="1000"
      boxShadow="sm"
      transition="all 0.3s ease-in-out"
    >
      <Container maxW={"1200px"} px={4}>
        <Flex
          minH={16}
          py={{ base: 3, md: 0 }}
          alignItems="center"
          justifyContent="space-between"
          flexDir={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 0 }}
        >
          {/* Logo Brand Area */}
          <HStack spacing={2} as={Link} to={"/"} _hover={{ textDecoration: 'none' }} className="brand-logo-area">
            <Box
              p={2}
              borderRadius="xl"
              bgGradient="linear(to-tr, blue.500, purple.500)"
              color="white"
              boxShadow="0 4px 12px rgba(102, 126, 234, 0.4)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <LuShoppingBag size="20" />
            </Box>
            <Text
              fontSize={{ base: "20px", sm: "24px" }}
              fontWeight="900"
              letterSpacing="tight"
              bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
              bgClip={"text"}
              transition="all 0.3s"
              _hover={{ transform: "scale(1.02)", filter: "brightness(1.1)" }}
            >
              PRODUCT<Text as="span" fontWeight="400" color={logoTextColor}>STORE</Text>
            </Text>
          </HStack>

          {/* Search Box */}
          <Box w={{ base: "full", md: "320px", lg: "400px" }}>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none" children={<LuSearch color="gray.400" />} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search')}
                aria-label={t('common.search')}
                bg={inputBg}
                border="1px solid"
                borderColor={inputBorder}
                borderRadius="full"
                focusBorderColor="purple.400"
                _placeholder={{ color: "gray.400" }}
                _hover={{ borderColor: useColorModeValue("gray.300", "gray.600") }}
                transition="all 0.2s"
                boxShadow="inner"
              />
            </InputGroup>
          </Box>

          {/* Action Area */}
          <HStack spacing={3} alignItems="center" w={{ base: "full", md: "auto" }} justifyContent={{ base: "space-between", md: "flex-end" }}>
            
            {/* Globalized Switchers & Pages */}
            <HStack spacing={2}>
              <LanguageSwitcher />

              <Tooltip label={t('common.toggleTheme')} hasArrow>
                <Button 
                  onClick={toggleColorMode} 
                  aria-label={t('common.toggleTheme')}
                  variant="ghost"
                  borderRadius="full"
                  p={0}
                  w={10}
                  h={10}
                  _hover={{ bg: buttonHoverBg, transform: "scale(1.05)" }}
                >
                  {colorMode === "light" ? <IoMoon size="18" /> : <LuSun size="20" />}
                </Button>
              </Tooltip>
            </HStack>

            <Box height="20px" width="1px" bg={border} display={{ base: "none", md: "block" }} />

            {/* Shopping Features & Profile */}
            <HStack spacing={2}>
              <Tooltip label={t('nav.addProduct', 'Add Product')} hasArrow>
                <Link to={"/create"}>
                  <Button 
                    aria-label={t('nav.addProduct')}
                    variant="ghost"
                    borderRadius="full"
                    p={0}
                    w={10}
                    h={10}
                    _hover={{ bg: buttonHoverBg, transform: "scale(1.05)" }}
                  >
                    <LuPlus size="20" />
                  </Button>
                </Link>
              </Tooltip>

              <Tooltip label="Wishlist" hasArrow>
                <Link to={"/wishlist"}>
                  <Button 
                    position="relative" 
                    aria-label="Open wishlist"
                    variant="ghost"
                    borderRadius="full"
                    p={0}
                    w={10}
                    h={10}
                    _hover={{ bg: buttonHoverBg, transform: "scale(1.05)" }}
                  >
                    <LuHeart size="20" />
                    {wishlistCount > 0 && (
                      <Badge
                        colorScheme="pink"
                        variant="solid"
                        borderRadius="full"
                        position="absolute"
                        top="1px"
                        right="1px"
                        fontSize="10px"
                        px={1.5}
                        py={0.2}
                        border="2px solid"
                        borderColor={badgeBorderColor}
                      >
                        {wishlistCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </Tooltip>

              <Tooltip label={t('cart.openCart')} hasArrow>
                <Button 
                  onClick={handleCartOpen} 
                  position="relative" 
                  aria-label={t('cart.openCart')}
                  variant="ghost"
                  borderRadius="full"
                  p={0}
                  w={10}
                  h={10}
                  _hover={{ bg: buttonHoverBg, transform: "scale(1.05)" }}
                >
                  <LuShoppingCart size="20" />
                  {totalItemsCount > 0 && (
                    <Badge
                      colorScheme="purple"
                      variant="solid"
                      borderRadius="full"
                      position="absolute"
                      top="1px"
                      right="1px"
                      fontSize="10px"
                      px={1.5}
                      py={0.2}
                      border="2px solid"
                      borderColor={badgeBorderColor}
                    >
                      {totalItemsCount}
                    </Badge>
                  )}
                </Button>
              </Tooltip>

              {/* User authentication or profile menu */}
              {isLoggedIn ? (
                <Menu isLazy>
                  <MenuButton 
                    as={Button} 
                    variant="ghost" 
                    borderRadius="full" 
                    p={0} 
                    w={10} 
                    h={10}
                    _hover={{ transform: "scale(1.05)" }}
                  >
                    <Avatar 
                      size="sm" 
                      name={authUser?.name || "User"} 
                      src={authUser?.avatar} 
                      bg="purple.500" 
                      color="white"
                    />
                  </MenuButton>
                  <MenuList borderRadius="xl" border="1px solid" borderColor={border} boxShadow="lg" p={2}>
                    <Box px={3} py={2}>
                      <Text fontWeight="bold" fontSize="sm">{authUser?.name || "User Account"}</Text>
                      <Text fontSize="xs" color="gray.500" isTruncated>{authUser?.email}</Text>
                    </Box>
                    <MenuDivider />
                    <MenuItem 
                      as={Link} 
                      to="/orders" 
                      icon={<LuPackage size="16" />} 
                      borderRadius="lg"
                      _hover={{ bg: menuItemHoverBg }}
                    >
                      {t('orders.title', 'My Orders')}
                    </MenuItem>
                    <MenuItem 
                      as={Link} 
                      to="/wishlist" 
                      icon={<LuHeart size="16" />} 
                      borderRadius="lg"
                      _hover={{ bg: menuItemHoverBg }}
                    >
                      {t('wishlist.title', 'My Wishlist')}
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem 
                      onClick={handleLogout} 
                      icon={<LuLogOut size="16" />} 
                      color="red.500"
                      borderRadius="lg"
                      _hover={{ bg: logoutItemHoverBg }}
                    >
                      {t('common.logout', 'Log Out')}
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <HStack spacing={2} display={{ base: "none", sm: "flex" }} pl={1}>
                  <Button 
                    as={Link} 
                    to="/login" 
                    variant="ghost" 
                    size="sm" 
                    borderRadius="full"
                    fontWeight="medium"
                  >
                    {t('auth.login', 'Sign In')}
                  </Button>
                  <Button 
                    as={Link} 
                    to="/signup" 
                    colorScheme="purple" 
                    size="sm" 
                    borderRadius="full"
                    bgGradient="linear(to-r, blue.500, purple.500)"
                    boxShadow="sm"
                    _hover={{ bgGradient: "linear(to-r, blue.600, purple.600)", boxShadow: "md" }}
                    fontWeight="semibold"
                  >
                    {t('auth.signup', 'Sign Up')}
                  </Button>
                </HStack>
              )}
            </HStack>

          </HStack>
        </Flex>

        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
          <DrawerOverlay />
          <DrawerContent bg={colorMode === "light" ? "white" : "gray.850"} color={colorMode === "light" ? "black" : "white"}>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px" fontWeight="bold">{t('cart.title')}</DrawerHeader>

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
                        borderRadius="xl"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                        bg={colorMode === "light" ? "gray.50" : "gray.800"}
                      >
                        <Box>
                          <Text fontWeight="bold" fontSize="sm">{item.name}</Text>
                          <Text fontSize="xs" color={labelColor}>
                            {t('cart.quantity')}: {item.quantity} × ${currentPrice}
                          </Text>
                        </Box>

                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          borderRadius="md"
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
                <Text fontWeight="bold" fontSize="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                  ${Number(totalPrice ?? 0).toFixed(2)}
                </Text>
              </HStack>
              <Button 
                colorScheme="purple" 
                size="lg" 
                width="100%" 
                onClick={handleCheckout} 
                isLoading={isCheckoutLoading} 
                isDisabled={cartItems.length === 0}
                borderRadius="xl"
                bgGradient="linear(to-r, blue.500, purple.500)"
                _hover={{ bgGradient: "linear(to-r, blue.600, purple.600)" }}
              >
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