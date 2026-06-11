import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Container, Flex, HStack, Text, useColorMode, useDisclosure,
  Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  VStack, Box, Badge, useColorModeValue
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { PlusSquareIcon } from "@chakra-ui/icons";
import { IoMoon } from "react-icons/io5";
import { LuSun, LuShoppingCart } from "react-icons/lu";
import { useCart } from "../../context/CartContext.jsx";
import { LanguageSwitcher } from '../LanguageSwitcher.jsx';

const Navbar = () => {
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { cartItems, removeFromCart, totalPrice } = useCart();

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

  return (
    <Box bg={navBg} borderBottom="1px solid" borderColor={border} mb={4}>
      <Container maxW={"1140px"} px={4}>
        <Flex
          h={16}
          alignItems={"center"}
          justifyContent={"space-between"}
          flexDir={{ base: "column", sm: "row" }}
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
            <Link to={"/"}>{t('nav.home')} Store 🛒</Link>
          </Text>

          <HStack spacing={2} alignItems={"center"}>
            <Link to={"/create"}>
              <Button aria-label={t('nav.addProduct')}>
                <PlusSquareIcon fontSize={20} />
              </Button>
            </Link>

            <LanguageSwitcher />

            <Button onClick={onOpen} position="relative" aria-label={t('cart.openCart')}>
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

            <Button onClick={toggleColorMode} aria-label={t('common.toggleTheme')}>
              {colorMode === "light" ? <IoMoon /> : <LuSun size='20' />}
            </Button>
          </HStack>
        </Flex>

        {/* Slide-out Cart Panel */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
          <DrawerOverlay />
          <DrawerContent bg={colorMode === "light" ? "white" : "gray.800"} color={colorMode === "light" ? "black" : "white"}>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">{t('cart.title')}</DrawerHeader>

            <DrawerBody>
              {cartItems.length === 0 ? (
                <Text textAlign="center" mt={10} color="gray.500">{t('cart.empty')}</Text>
              ) : (
                <VStack align="stretch" spacing={4} mt={4}>
                  {cartItems.map((item) => (
                    <HStack key={item._id} justify="space-between" p={3} borderWidth="1px" borderRadius="lg" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                      <Box>
                        <Text fontWeight="bold">{item.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {t('cart.quantity')}: {item.quantity} × ${item.price}
                        </Text>
                      </Box>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeFromCart(item._id)}
                      >
                        {t('cart.remove')}
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              )}
            </DrawerBody>

            <DrawerFooter borderTopWidth="1px" display="flex" flexDirection="column" alignItems="stretch">
              <HStack justify="space-between" mb={4}>
                <Text fontWeight="bold" fontSize="lg">{t('cart.total')}:</Text>
                <Text fontWeight="bold" fontSize="lg" color="cyan.500">${totalPrice.toFixed(2)}</Text>
              </HStack>
              <Button colorScheme="blue" size="lg" width="100%">
                {t('cart.checkout')}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Container>
    </Box>
  );
};

export default Navbar;