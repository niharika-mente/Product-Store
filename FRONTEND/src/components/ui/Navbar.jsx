import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Container, Flex, HStack, Text, Input, useColorMode, useDisclosure,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  VStack, Box, Badge, useColorModeValue, useToast, InputGroup, InputRightElement, Tag, TagLabel, TagCloseButton
} from '@chakra-ui/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher.jsx';
import { PlusSquareIcon } from "@chakra-ui/icons";
import { IoMoon } from "react-icons/io5";
import { LuSun, LuShoppingCart, LuHeart, LuSearch } from "react-icons/lu";
import { useCart } from "../../store/cart";
import { LuSun, LuShoppingCart, LuHeart } from "react-icons/lu";
import { useCart } from "../../store/cart";
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
  const { cartItems, removeFromCart, emptyCart, totalPrice } = useCart();
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, finalTotal }

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // --- Colour tokens matched to the site's cyan/blue palette ---
  const navBg         = useColorModeValue("rgba(255,255,255,0.97)", "rgba(17,24,39,0.97)");
  const border        = useColorModeValue("blue.100",  "blue.900");
  const labelColor    = useColorModeValue("gray.500",  "gray.400");
  const iconColor     = useColorModeValue("gray.600",  "gray.300");
  const iconHoverBg   = useColorModeValue("cyan.50",   "blue.900");
  const iconHoverColor= useColorModeValue("blue.600",  "cyan.300");
  const searchBg      = useColorModeValue("gray.50",   "gray.800");
  const searchBorder  = useColorModeValue("blue.100",  "blue.800");
  const dividerColor  = useColorModeValue("blue.100",  "blue.800");
  const cartItemBorder= useColorModeValue("blue.50",   "blue.900");
  const drawerBg      = useColorModeValue("white",     "gray.900");
  const drawerText    = useColorModeValue("gray.900",  "white");
  // Announcement bar uses the site's blue.500 → cyan.400 gradient direction
  const currencyBg    = useColorModeValue("white",     "gray.800");
  const currencyColor = useColorModeValue("blue.700",  "cyan.300");
  const currencyBorder= useColorModeValue("blue.200",  "blue.700");
  const totalColor    = useColorModeValue("cyan.500",  "cyan.300");

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("authToken"));
  }, [location]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ✅ Wrapped in useCallback so it's stable and safe to use in useEffect deps
  const handleCartOpen = useCallback(() => {
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    const handleOpenCart = () => handleCartOpen();
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
      if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
      const data = await res.json();
      if (!data.success) {
        toast({ title: "Checkout Error", description: data.message, status: "error", duration: 3000, isClosable: true });
        return;
      }
      setAppliedCoupon(null);
      onClose();
      window.location.href = data.url;
    } catch (err) {
      let message = err instanceof TypeError
        ? "Network error — please check your connection"
        : err.message?.startsWith("Server error:")
          ? "Something went wrong on our end. Please try again later."
          : "Failed to process checkout";
      toast({ title: "Error", description: message, status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Failed to call logout API:", err);
      }
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    await logout();
    emptyCart();
    clearWishlist();
    navigate("/login");
  };

  // Shared icon button — cyan/blue hover to match site palette
  const iconBtnStyle = {
    size: "sm",
    variant: "ghost",
    color: iconColor,
    borderRadius: "lg",
    _hover: { bg: iconHoverBg, color: iconHoverColor },
    _active: { bg: iconHoverBg },
    transition: "all 0.15s ease",
  };

  return (
    <Box position="sticky" top="0" zIndex="1000">

      {/* Main header */}
      <Box
        bg={navBg}
        backdropFilter="blur(12px)"
        borderBottom="1px solid"
        borderColor={isScrolled ? border : "transparent"}
        boxShadow={isScrolled ? "0 1px 16px rgba(56,178,172,0.08)" : "none"}
        transition="border-color 0.2s ease, box-shadow 0.2s ease"
      >
        <Container maxW="1200px" px={5}>
          <Flex h="64px" alignItems="center" justifyContent="space-between" gap={4}>

            {/* ── LOGO — identical to original ── */}
            <Text
              as={Link}
              to="/"
              fontSize={{ base: "18px", sm: "22px" }}
              fontWeight="extrabold"
              letterSpacing="tight"
              textTransform="uppercase"
              bgGradient="linear(to-r, cyan.400, blue.500)"
              bgClip="text"
              textDecoration="none"
              flexShrink={0}
              display="inline-block"
              _hover={{ transform: "scale(1.03)" }}
              transition="all 0.3s"
            >
              Product Store 🛒
            </Text>

            {/* SEARCH — desktop */}
            <Box display={{ base: "none", md: "flex" }} flex="1" maxW="320px" mx={4}>
              <Box position="relative" w="full">
                <Box
                  position="absolute"
                  left="10px"
                  top="50%"
                  transform="translateY(-50%)"
                  color={labelColor}
                  pointerEvents="none"
                  zIndex={1}
                >
                  <LuSearch size={14} />
                </Box>
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
                  pl="32px"
                  bg={searchBg}
                  borderColor={searchBorder}
                  borderRadius="lg"
                  fontSize="13px"
                  _placeholder={{ color: labelColor }}
                  _hover={{ borderColor: "cyan.300" }}
                  _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px var(--chakra-colors-cyan-400)" }}
                  transition="all 0.15s"
                />
              </Box>
            </Box>

            {/* RIGHT ACTIONS — desktop */}
            <HStack spacing={1} display={{ base: "none", sm: "flex" }} alignItems="center">

              {/* Add product */}
              <Link to="/create">
                <Button {...iconBtnStyle} aria-label={t('nav.addProduct')}>
                  <PlusSquareIcon fontSize={17} />
                </Button>
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist">
                <Button {...iconBtnStyle} position="relative" aria-label="Open wishlist">
                  <LuHeart size={17} />
                  {wishlistCount > 0 && (
                    <Badge
                      colorScheme="pink"
                      borderRadius="full"
                      position="absolute"
                      top="-4px" right="-4px"
                      px="5px" fontSize="9px"
                      lineHeight="16px" h="16px" minW="16px"
                    >
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Compare */}
              <Link to="/compare">
                <Button {...iconBtnStyle} position="relative" aria-label="Compare products">
                  <FaBalanceScale size={16} />
                  {compareList.length > 0 && (
                    <Badge
                      colorScheme="purple"
                      borderRadius="full"
                      position="absolute"
                      top="-4px" right="-4px"
                      px="5px" fontSize="9px"
                      lineHeight="16px" h="16px" minW="16px"
                    >
                      {compareList.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <Button
                {...iconBtnStyle}
                onClick={handleCartOpen}
                position="relative"
                aria-label={t('cart.openCart')}
              >
                <LuShoppingCart size={17} />
                {totalItemsCount > 0 && (
                  <Badge
                    colorScheme="cyan"
                    borderRadius="full"
                    position="absolute"
                    top="-4px" right="-4px"
                    px="5px" fontSize="9px"
                    lineHeight="16px" h="16px" minW="16px"
                  >
                    {totalItemsCount}
                  </Badge>
                )}
              </Button>

              {/* Divider */}
              <Box h="20px" w="1px" bg={dividerColor} mx={1} />

              {/* Currency */}
              <Box
                as="select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                aria-label="Select currency"
                fontSize="12px"
                fontWeight="700"
                px="8px"
                py="5px"
                borderRadius="lg"
                border="1px solid"
                borderColor={currencyBorder}
                bg={currencyBg}
                color={currencyColor}
                cursor="pointer"
                letterSpacing="0.02em"
                _hover={{ borderColor: "cyan.400" }}
                transition="border-color 0.15s"
                outline="none"
              >
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="INR">₹ INR</option>
              </Box>

              {/* Theme toggle */}
              <Button {...iconBtnStyle} onClick={toggleColorMode} aria-label={t('common.toggleTheme')}>
                {colorMode === "light" ? <IoMoon size={16} /> : <LuSun size={16} />}
              </Button>

              {isLoggedIn && <Box h="20px" w="1px" bg={dividerColor} mx={1} />}

              {isLoggedIn && (
                <>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm" colorScheme="purple">Dashboard</Button>
                    </Link>
                  )}
                  <Link to="/profile">
                    <Button
                      size="sm" variant="ghost"
                      color={iconColor} fontSize="13px" fontWeight="500"
                      borderRadius="lg"
                      _hover={{ bg: iconHoverBg, color: iconHoverColor }}
                    >
                      Profile
                    </Button>
                  </Link>
                  <Button
                    size="sm" variant="outline" colorScheme="red"
                    fontSize="13px" fontWeight="500" borderRadius="lg"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              )}
            </HStack>

            {/* HAMBURGER — mobile */}
            <HStack display={{ base: "flex", sm: "none" }} spacing={2}>
              <Button
                {...iconBtnStyle}
                onClick={handleCartOpen}
                position="relative"
                aria-label={t('cart.openCart')}
              >
                <LuShoppingCart size={18} />
                {totalItemsCount > 0 && (
                  <Badge colorScheme="cyan" borderRadius="full" position="absolute" top="-4px" right="-4px" px="5px" fontSize="9px">
                    {totalItemsCount}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm" variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Open menu"
                color={iconColor}
                borderRadius="lg"
                _hover={{ bg: iconHoverBg }}
                fontSize="20px" px={2}
              >
                {isMobileMenuOpen ? "✕" : "☰"}
              </Button>
            </HStack>
          </Flex>

          {/* MOBILE MENU */}
          {isMobileMenuOpen && (
            <VStack
              display={{ base: "flex", sm: "none" }}
              spacing={2} pb={4} pt={2}
              borderTop="1px solid"
              borderColor={border}
              w="full" align="stretch"
            >
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search')}
                aria-label={t('common.search')}
                size="sm"
                bg={searchBg}
                borderColor={searchBorder}
                borderRadius="lg"
                _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px var(--chakra-colors-cyan-400)" }}
              />

              {[
                { to: "/create",   label: t('nav.addProduct'), icon: <PlusSquareIcon />, badge: 0,                  scheme: "cyan"   },
                { to: "/wishlist", label: "Wishlist",          icon: <LuHeart />,        badge: wishlistCount,      scheme: "pink"   },
                { to: "/compare",  label: "Compare",           icon: <FaBalanceScale />, badge: compareList.length, scheme: "purple" },
              ].map(({ to, label, icon, badge, scheme }) => (
                <Link key={to} to={to} onClick={() => setIsMobileMenuOpen(false)} style={{ width: '100%' }}>
                  <Button
                    w="full" size="sm" variant="ghost"
                    leftIcon={icon} justifyContent="flex-start"
                    borderRadius="lg" color={iconColor}
                    _hover={{ bg: iconHoverBg, color: iconHoverColor }}
                    position="relative"
                  >
                    {label}
                    {badge > 0 && (
                      <Badge colorScheme={scheme} borderRadius="full" position="absolute" right="12px">
                        {badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}

              {isLoggedIn && (
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ width: '100%' }}>
                  <Button w="full" size="sm" variant="ghost" justifyContent="flex-start" borderRadius="lg" color={iconColor}
                    _hover={{ bg: iconHoverBg, color: iconHoverColor }}>
                    My Profile
                  </Button>
                </Link>
              )}

              <Button
                w="full" size="sm" variant="ghost"
                leftIcon={colorMode === "light" ? <IoMoon /> : <LuSun />}
                justifyContent="flex-start" borderRadius="lg"
                color={iconColor}
                _hover={{ bg: iconHoverBg, color: iconHoverColor }}
                onClick={() => { toggleColorMode(); setIsMobileMenuOpen(false); }}
              >
                {colorMode === "light" ? "Dark mode" : "Light mode"}
              </Button>
            </VStack>
          )}
        </Container>
      </Box>

      {/* CART DRAWER */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg={drawerBg} color={drawerText}>
          <DrawerCloseButton />
          <DrawerHeader
            borderBottomWidth="1px"
            borderColor={cartItemBorder}
            fontSize="15px" fontWeight="600" letterSpacing="-0.01em"
          >
            {t('cart.title')}
            {totalItemsCount > 0 && (
              <Badge ml={2} colorScheme="cyan" borderRadius="full" fontSize="11px">{totalItemsCount}</Badge>
            )}
          </DrawerHeader>

          <DrawerBody px={4}>
            {cartItems.length === 0 ? (
              <VStack mt={16} spacing={3} opacity={0.4}>
                <LuShoppingCart size={40} />
                <Text fontSize="14px">{t('cart.empty')}</Text>
              </VStack>
            ) : (
              <VStack align="stretch" spacing={3} mt={4}>
                {cartItems.map((item) => {
                  const latestProduct = products.find((p) => p._id === item._id);
                  const currentPrice = latestProduct?.price ?? item.price;
                  return (
                    <HStack
                      key={item._id}
                      justify="space-between"
                      p={3}
                      borderWidth="1px"
                      borderRadius="xl"
                      borderColor={cartItemBorder}
                    >
                      <Box flex={1} minW={0}>
                        <Text fontWeight="600" fontSize="13px" noOfLines={1}>{item.name}</Text>
                        <Text fontSize="12px" color={labelColor} mt={0.5}>
                          {item.quantity} × {formatPrice(currentPrice, currency, rates)}
                        </Text>
                      </Box>
                      <Button
                        size="xs" variant="ghost" colorScheme="red"
                        borderRadius="lg"
                        onClick={() => removeFromCart(item._id)}
                        flexShrink={0}
                      >
                        Remove
                      </Button>
                    </HStack>
                  );
                })}
              </VStack>
            )}
          </DrawerBody>

          <DrawerFooter
            borderTopWidth="1px"
            borderColor={cartItemBorder}
            flexDirection="column"
            alignItems="stretch"
            gap={3} px={4}
          >
            <HStack justify="space-between">
              <Text fontWeight="600" fontSize="14px" color={labelColor}>{t('cart.total')}</Text>
              <Text fontWeight="700" fontSize="18px" letterSpacing="-0.02em" color={totalColor}>
                {formatPrice(totalPrice ?? 0, currency, rates)}
              </Text>
            </HStack>
            <Button
              size="lg" w="full" borderRadius="xl"
              bgGradient="linear(to-r, cyan.400, blue.500)"
              color="white"
              _hover={{ bgGradient: "linear(to-r, cyan.500, blue.600)", opacity: 0.92 }}
              _active={{ opacity: 0.8 }}
              fontWeight="600" fontSize="14px" letterSpacing="0.01em"
              onClick={handleCheckout}
              isLoading={isCheckoutLoading}
              isDisabled={cartItems.length === 0}
              transition="opacity 0.15s"
            >
              Proceed to Checkout
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
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