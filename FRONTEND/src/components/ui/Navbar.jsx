import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Container, Flex, HStack, Text, Input, useColorMode, useDisclosure,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  VStack, Box, Badge, useColorModeValue, useToast, InputGroup, InputRightElement, Tag, TagLabel, TagCloseButton
} from '@chakra-ui/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher.jsx';
import { PlusSquareIcon } from "@chakra-ui/icons"
import { IoMoon } from "react-icons/io5";
import { LuSun, LuShoppingCart, LuHeart } from "react-icons/lu";
import { useCartStore } from "../../store/cart";
import { useSavedForLater } from "../../store/savedForLater";
import { Divider } from "@chakra-ui/react";
import { useWishlist } from "../../context/WishlistContext.jsx";
import { useProductStore } from "../../store/product";
import { FaBalanceScale } from "react-icons/fa";
import { useCurrencyStore } from "../../store/currency";
import { formatPrice } from "../../utils/currency";
import { useAuth } from "../../context/AuthContext";

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const Navbar = () => {
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
const { cartItems, removeFromCart, totalPrice, emptyCart, addToCart } = useCartStore();
  const { savedItems, saveForLater, removeFromSaved, fetchSavedItems, clearLocalSavedItems } = useSavedForLater();
  const { currency, rates, setCurrency } = useCurrencyStore();
  const { wishlistCount, clearWishlist } = useWishlist();
  const { searchQuery, setSearchQuery, products, fetchProducts, compareList } = useProductStore();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isLoggedIn, logout, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, finalTotal }

  const handleSaveForLater = async (item) => {
    await saveForLater(item);
    removeFromCart(item._id);
  };

  const handleMoveToCart = async (item) => {
    const res = addToCart(item, item.quantity || 1);
    if (res.status === "added") {
      await removeFromSaved(item._id);
    } else if (res.status === "capped") {
      toast({ title: "Stock Limit", description: "You can't add more of this item.", status: "warning", duration: 3000 });
    } else if (res.status === "out_of_stock") {
      toast({ title: "Out of Stock", description: "This item is currently out of stock.", status: "error", duration: 3000 });
    }
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const mobileInputBg = useColorModeValue("gray.50", "gray.700");
  const mobileInputBorder = useColorModeValue("gray.200", "gray.600");
  const searchBg = useColorModeValue("gray.50", "gray.700");
  const searchBorder = useColorModeValue("gray.200", "gray.600");
useEffect(() => {
    const token = !!localStorage.getItem("authToken");
    setIsLoggedIn(token);

    // Fetch saved items if the user is logged in
    if (token) {
      fetchSavedItems();
    }

    // Check if the user is an admin
    try {
      const user = JSON.parse(localStorage.getItem("authUser") || '{}');
      setIsAdmin(user?.role === 'admin');
    } catch {
      setIsAdmin(false);
    }
  }, [location, fetchSavedItems]);

  // ✅ Wrapped in useCallback so it's stable and safe to use in useEffect deps
  const handleCartOpen = useCallback(() => {
    onOpen();
  }, [onOpen]);

  // ✅ handleCartOpen is now stable — no missing-deps warning
  useEffect(() => {
    const handleOpenCart = () => {
      handleCartOpen();
    };
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, [handleCartOpen]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim(), orderTotal: totalPrice ?? 0 }),
      });
      const data = await res.json();
      if (!data.success) {
        toast({ title: 'Invalid coupon', description: data.message, status: 'error', duration: 3000, isClosable: true });
        return;
      }
      setAppliedCoupon(data.data);
      setPromoInput('');
      toast({ title: `Coupon applied!`, description: `You save $${data.data.discount.toFixed(2)}`, status: 'success', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Error', description: 'Could not validate coupon', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckoutLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, couponCode: appliedCoupon?.code || null }),
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
      setAppliedCoupon(null);
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

  const handleLogout = async () => {
    await logout();
    emptyCart();
    clearWishlist();
    clearLocalSavedItems();
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
          flexDir={{ base: "row" }}
        >
          {/* LEFT SIDE - LOGO */}
          <Text
            fontSize={{ base: "20px", sm: "24px" }}
            fontWeight={"bold"}
            textTransform={"uppercase"}
            bgGradient={"linear(to-r, cyan.400, blue.500)"}
            bgClip={"text"}
            transition="all 0.3s"
            display="inline-block"
            _hover={{ transform: "scale(1.03)" }}
          >
            <Link to={"/"}>Product Store 🛒</Link>
          </Text>

          {/* RIGHT SIDE - ICONS + HAMBURGER */}
          <HStack spacing={3} alignItems={"center"}>
            {/* Search Box - Desktop only */}
            <Box display={{ base: "none", md: "block" }} w="200px">
              <Input
                id="navbar-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    if (location.pathname !== '/') {
                      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
                    } else {
                      fetchProducts();
                    }
                  }
                }}
                placeholder={t('common.search')}
                aria-label={t('common.search')}
                size="sm"
                bg={searchBg}
                borderColor={searchBorder}
              />
            </Box>

            {/* Desktop Icons */}
            <HStack spacing={1} display={{ base: "none", sm: "flex" }}>
              <Link to={"/create"}>
                <Button size="sm" aria-label={t('nav.addProduct')}>
                  <PlusSquareIcon fontSize={18} />
                </Button>
              </Link>

              <Link to={"/wishlist"}>
                <Button size="sm" position="relative" aria-label="Open wishlist">
                  <LuHeart size="18" />
                  {wishlistCount > 0 && (
                    <Badge
                      colorScheme="pink"
                      borderRadius="full"
                      position="absolute"
                      top="-5px"
                      right="-5px"
                      px={1.5}
                      fontSize="10px"
                    >
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link to={"/compare"}>
                <Button size="sm" position="relative" aria-label="Compare products">
                  <FaBalanceScale size="18" />
                  {compareList.length > 0 && (
                    <Badge
                      colorScheme="purple"
                      borderRadius="full"
                      position="absolute"
                      top="-5px"
                      right="-5px"
                      px={1.5}
                      fontSize="10px"
                    >
                      {compareList.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Button size="sm" onClick={handleCartOpen} position="relative" aria-label={t('cart.openCart')}>
                <LuShoppingCart size="18" />
                {totalItemsCount > 0 && (
                  <Badge
                    colorScheme="teal"
                    borderRadius="full"
                    position="absolute"
                    top="-5px"
                    right="-5px"
                    px={1.5}
                    fontSize="10px"
                  >
                    {totalItemsCount}
                  </Badge>
                )}
              </Button>

              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                aria-label="Select currency"
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: colorMode === 'dark' ? '#2D3748' : '#ffffff',
                  color: colorMode === 'dark' ? '#ffffff' : '#1A202C',
                }}
              >
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="INR">₹ INR</option>
              </select>

              <Button size="sm" onClick={toggleColorMode} aria-label={t('common.toggleTheme')}>
                {colorMode === "light" ? <IoMoon /> : <LuSun size='18' />}
              </Button>

              {isLoggedIn && (
                <>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm" colorScheme="purple">Dashboard</Button>
                    </Link>
                  )}
                  <Link to="/profile">
                    <Button variant="ghost" size="sm">My Profile</Button>
                  </Link>
                  <Button onClick={handleLogout} colorScheme="red" variant="outline" size="sm">
                    Logout
                  </Button>
                </>
              )}
            </HStack>

            {/* Hamburger Button - Mobile only */}
            <Button
              display={{ base: "flex", sm: "none" }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Open menu"
              variant="ghost"
              fontSize="22px"
            >
              ☰
            </Button>
          </HStack>
        </Flex>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <VStack
            display={{ base: "flex", sm: "none" }}
            spacing={3}
            p={4}
            borderTop="1px solid"
            borderColor={border}
            bg={navBg}
            w="full"
          >
            <Box w="full">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search')}
                aria-label={t('common.search')}
                bg={mobileInputBg}
                borderColor={mobileInputBorder}
              />
            </Box>

            <Link to="/create" onClick={() => setIsMobileMenuOpen(false)} style={{ width: '100%' }}>
              <Button w="full" leftIcon={<PlusSquareIcon />}>
                {t('nav.addProduct')}
              </Button>
            </Link>

            <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} style={{ width: '100%' }}>
              <Button w="full" leftIcon={<LuHeart />} position="relative">
                Wishlist
                {wishlistCount > 0 && (
                  <Badge
                    colorScheme="pink"
                    borderRadius="full"
                    position="absolute"
                    right="12px"
                    top="50%"
                    transform="translateY(-50%)"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {isLoggedIn && (
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ width: '100%' }}>
                <Button w="full">My Profile</Button>
              </Link>
            )}

            <Link to="/compare" onClick={() => setIsMobileMenuOpen(false)} style={{ width: '100%' }}>
              <Button w="full" leftIcon={<FaBalanceScale />} position="relative">
                Compare
                {compareList.length > 0 && (
                  <Badge
                    colorScheme="purple"
                    borderRadius="full"
                    position="absolute"
                    right="12px"
                    top="50%"
                    transform="translateY(-50%)"
                  >
                    {compareList.length}
                  </Badge>
                )}
              </Button>
            </Link>

            <Button
              w="full"
              leftIcon={<LuShoppingCart />}
              position="relative"
              onClick={() => {
                handleCartOpen();
                setIsMobileMenuOpen(false);
              }}
            >
              Cart
              {totalItemsCount > 0 && (
                <Badge
                  colorScheme="teal"
                  borderRadius="full"
                  position="absolute"
                  right="12px"
                  top="50%"
                  transform="translateY(-50%)"
                >
                  {totalItemsCount}
                </Badge>
              )}
            </Button>

            <Button
              w="full"
              leftIcon={colorMode === "light" ? <IoMoon /> : <LuSun />}
              onClick={() => {
                toggleColorMode();
                setIsMobileMenuOpen(false);
              }}
            >
              {colorMode === "light" ? "Dark Mode" : "Light Mode"}
            </Button>
          </VStack>
        )}

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
                    const latestProduct = products.find((p) => p._id === item._id);
                    const currentPrice = latestProduct?.price ?? item.price;

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
                            {t('cart.quantity')}: {item.quantity} × {formatPrice(currentPrice, currency, rates)}
                          </Text>
                        </Box>
                        <VStack>
                          <Button size="sm" colorScheme="blue" variant="outline" onClick={() => handleSaveForLater(item)} width="100%">
                            Save for Later
                          </Button>
                          <Button size="sm" colorScheme="red" variant="ghost" onClick={() => removeFromCart(item._id)} width="100%">
                            Remove
                          </Button>
                        </VStack>
                      </HStack>
                    );
                  })}
                </VStack>
              )}
              {savedItems && savedItems.length > 0 && (
                <Box mt={6}>
                  <Divider mb={4} />
                  <Text fontWeight="bold" fontSize="lg" mb={3}>{t("cart.savedForLater") || "Saved for Later"} ({savedItems.length})</Text>
                  <VStack align="stretch" spacing={4}>
                    {savedItems.map((item) => (
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
                            {formatPrice(item.price, currency, rates)}
                          </Text>
                        </Box>
                        <VStack>
                          <Button size="sm" colorScheme="teal" variant="outline" onClick={() => handleMoveToCart(item)} width="100%">
                            Move to Cart
                          </Button>
                          <Button size="sm" colorScheme="red" variant="ghost" onClick={() => removeFromSaved(item._id)} width="100%">
                            Remove
                          </Button>
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </DrawerBody>

            <DrawerFooter borderTopWidth="1px" display="flex" flexDirection="column" alignItems="stretch" gap={3}>
              {/* Promo code input */}
              {cartItems.length > 0 && (
                appliedCoupon ? (
                  <HStack justify="space-between">
                    <Tag colorScheme="green" size="md" borderRadius="full">
                      <TagLabel>{appliedCoupon.code} — save ${appliedCoupon.discount.toFixed(2)}</TagLabel>
                      <TagCloseButton onClick={() => setAppliedCoupon(null)} />
                    </Tag>
                  </HStack>
                ) : (
                  <InputGroup size="sm">
                    <Input
                      placeholder="Promo code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      textTransform="uppercase"
                    />
                    <InputRightElement width="4.5rem">
                      <Button h="1.5rem" size="xs" colorScheme="cyan" onClick={handleApplyPromo} isLoading={promoLoading}>
                        Apply
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                )
              )}

              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="lg">{t('cart.total')}:</Text>
                <VStack align="flex-end" spacing={0}>
                  {appliedCoupon && (
                    <Text fontSize="sm" color="gray.400" textDecoration="line-through">
                      {formatPrice(totalPrice ?? 0, currency, rates)}
                    </Text>
                  )}
                  <Text fontWeight="bold" fontSize="lg" color="cyan.500">
                    {formatPrice(appliedCoupon ? appliedCoupon.finalTotal : (totalPrice ?? 0), currency, rates)}
                  </Text>
                </VStack>
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
