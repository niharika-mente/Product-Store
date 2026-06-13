import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Select,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  Image,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  DrawerFooter,
  HStack,
  useDisclosure,
  Skeleton
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useProductStore, useRecentlyViewed } from "../store/product";
import ProductCard from "../components/ui/ProductCard";
import Footer from "../components/ui/footer";
import ScrollToTop from "../components/ui/ScrollToTop";
import useDebounce from "../hooks/useDebounce";

const HomePage = () => {
  const { fetchProducts, products, isLoading, searchQuery, searchProducts } = useProductStore();
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const [sort, setSort] = useState("");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const drawerBg = useColorModeValue("white", "gray.800");
  const drawerTagBg = useColorModeValue("gray.50", "gray.700");
  const drawerBorder = useColorModeValue("gray.200", "gray.600");
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

  const debounceSearch = useDebounce(searchQuery, 500);

  // When sort or debounceSearch changes, fetch or search products via API
  useEffect(() => {
    if (debounceSearch.trim() === "") {
      fetchProducts(sort);
    } else {
      searchProducts(debounceSearch);
    }
  }, [debounceSearch, sort, fetchProducts, searchProducts]);

  // Client-side fallback filter
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = debounceSearch.trim()
    ? products
    : products.filter((product) =>
        (product.name?.toLowerCase() ?? "").includes(normalizedQuery)
      );

  return (
    <>
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8}>
          <Text
            fontSize={"30"}
            fontWeight={"bold"}
            bgGradient={"linear(to-r,cyan.400,blue.500)"}
            bgClip={"text"}
            textAlign={"center"}
          >
            Current Products🚀
          </Text>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            maxW="250px"
            aria-label="Sort products"
          >
            <option value="">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </Select>
          <VStack gap={2}>
            <Text
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="extrabold"
              bgGradient="linear(to-r, cyan.400, blue.500)"
              bgClip="text"
              textAlign="center"
            >
              Discover Amazing Products 🚀
            </Text>

            <Text
              color={labelColor}
              textAlign="center"
              maxW="600px"
            >
              Browse and manage your product collection with ease.
            </Text>
            <Box
              display="inline-block"
              bg="blue.500"
              color="white"
              px={6}
              py={3}
              borderRadius="xl"
              minW="140px"
              textAlign="center"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-3px)",
                boxShadow: "lg",
              }}
            >
              <Text fontSize="sm">Products</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {filteredProducts.length}
              </Text>
            </Box>
          </VStack>

          <SimpleGrid
            columns={{
              base: 1,
              md: 2,
              lg: 3,
            }}
            spacing={10}
            w={"full"}
          >
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} height="300px" borderRadius="xl" />
              ))
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </SimpleGrid>

          {!isLoading && products.length === 0 && (
            <VStack gap={4} py={12}>
              <Image
                src="/empty-state.svg"
                alt="Empty products"
                width={{
                  base: "200px",
                  md: "300px",
                  lg: "400px",
                }}
                objectFit="contain"
              />

              <Text fontSize="2xl" fontWeight="bold">
                No Products Yet
              </Text>

              <Text color={labelColor} textAlign="center">
                Start building your store by adding your first product.
              </Text>

              <Link to="/create">
                <Button
                  colorScheme="blue"
                  animation="pulse 2s infinite"
                  transition="all 0.25s ease"
                  _hover={{
                    transform: "translateY(-3px) scale(1.05)",
                    boxShadow: "xl",
                  }}
                  _active={{
                    transform: "scale(0.98)",
                  }}
                  sx={{
                    "@keyframes pulse": {
                      "0%": { boxShadow: "0 0 0 0 rgba(66, 153, 225, 0.6)" },
                      "70%": { boxShadow: "0 0 0 10px rgba(66, 153, 225, 0)" },
                      "100%": { boxShadow: "0 0 0 0 rgba(66, 153, 225, 0)" },
                    },
                  }}
                >
                  Create Product
                </Button>
              </Link>
            </VStack>
          )}

          {!isLoading && products.length > 0 && filteredProducts.length === 0 && (
            <VStack gap={4} py={12}>
              <Text fontSize="6xl">🔎</Text>

              <Text fontSize="2xl" fontWeight="bold">
                No matching products
              </Text>

              <Text color={labelColor} textAlign="center">
                Try a different search term.
              </Text>
            </VStack>
          )}
        </VStack>
      </Container>

      {recentlyViewed.length > 0 && (
        <Button
          position="fixed" bottom="20px" right="20px"
          zIndex={99} colorScheme="teal" size="sm" shadow="lg"
          onClick={onDrawerOpen}
        >
          Recently Viewed ({recentlyViewed.length})
        </Button>
      )}

      <Drawer isOpen={isDrawerOpen} onClose={onDrawerClose} placement="right" size="sm">
        <DrawerOverlay />
        <DrawerContent bg={drawerBg}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Recently Viewed</DrawerHeader>
          <DrawerBody px={3} py={4}>
            <VStack spacing={3} align="stretch">
              {recentlyViewed.map((p) => (
                <HStack
                  key={p._id} spacing={3} p={3}
                  bg={drawerTagBg} borderRadius="md"
                  border="1px solid" borderColor={drawerBorder}
                  as="a" href={`/product/${p._id}`}
                  _hover={{ textDecoration: "none", borderColor: "teal.400" }}
                  transition="all 0.2s"
                >
                  <Image src={p.image} alt={p.name} boxSize="48px" objectFit="cover" borderRadius="md" />
                  <VStack align="start" spacing={0} flex={1} minW={0}>
                    <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{p.name}</Text>
                    <Text fontSize="sm" color="teal.400">${p.price}</Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <Button size="sm" variant="ghost" colorScheme="red" onClick={clearRecentlyViewed}>
              Clear History
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default HomePage;
