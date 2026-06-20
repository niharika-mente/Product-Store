import React, { useEffect, useState } from "react";
import {
  Box, Button, Container, Select, SimpleGrid, Text, VStack, useColorModeValue, Image,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton, DrawerFooter,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  Table, Thead, Tbody, Tr, Th, Td, HStack, Badge, useDisclosure, Skeleton, SkeletonText
} from "@chakra-ui/react";
import { Link, useSearchParams } from "react-router-dom";
import { useProductStore, useRecentlyViewed } from "../store/product";
import ProductCard from "../components/ui/ProductCard";
import Pagination from '../components/ui/Pagination';
import Footer from "../components/ui/footer";
import ScrollToTop from "../components/ui/ScrollToTop";
import useDebounce from "../hooks/useDebounce";
import { useCurrencyStore } from '../store/currency';
import { formatPrice } from '../utils/currency';
import RecentlyViewedCarousel from "../components/ui/RecentlyViewedCarousel";
import FilterPanel from "../components/ui/FilterPanel";

const ProductCardSkeleton = () => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      shadow="lg"
      rounded="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor={borderColor}
      bg={bg}
    >
      <Skeleton height="192px" />
      <Box p={4}>
        <Skeleton height="20px" mb={3} />
        <SkeletonText noOfLines={1} width="40%" mb={4} />
        <Skeleton height="36px" borderRadius="md" />
      </Box>
    </Box>
  );
};

const HomePage = () => {
  const { fetchProducts, products, searchQuery, setSearchQuery, searchProducts, compareList, removeFromCompare, clearCompare } = useProductStore();
  const { currency, rates } = useCurrencyStore();
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { isOpen: isCompareOpen, onOpen: onCompareOpen, onClose: onCompareClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 10;

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 5000,
    brand: "",
    minRating: 0,
    inStock: false,
    categories: []
  });

  const [searchParams] = useSearchParams();

  const labelColor = useColorModeValue("gray.600", "gray.300");
  const drawerBg = useColorModeValue("white", "gray.800");
  const drawerTagBg = useColorModeValue("gray.50", "gray.700");
  const drawerBorder = useColorModeValue("gray.200", "gray.600");
  const compareBg = useColorModeValue("white", "gray.800");
  const compareTagBg = useColorModeValue("gray.100", "gray.700");

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams, setSearchQuery]);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      setLoading(true);

      try {
        const query = debouncedSearch.trim();

        if (query !== "") {
          await searchProducts(query);
          return;
        }
        const { categories, ...restFilters } = filters;
        const categoryStr = (categories || []).join(',');
        const response = await fetchProducts({ page, limit, sort, ...restFilters, category: categoryStr });
        if (response && response.success && !ignore) {
          const normalizedPage = response.totalPages === 0 ? 1 : Math.min(page, response.totalPages);
          if (page !== normalizedPage) {
            setPage(normalizedPage);
            return;
          }

          setTotalPages(response.totalPages);
          setTotalProducts(response.totalProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, sort, page, filters, fetchProducts, searchProducts]);

  const isSearching = debouncedSearch.trim() !== "";
  const hasNoProducts = !loading && products.length === 0 && !isSearching;
  const hasNoSearchMatch = !loading && products.length === 0 && isSearching;
  const displayCount = isSearching ? products.length : (totalProducts > 0 ? totalProducts : products.length);

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
            <Text color={labelColor} textAlign="center" maxW="600px">
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
              _hover={{ transform: "translateY(-3px)", boxShadow: "lg" }}
            >
              <Text fontSize="sm">Products</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {loading ? "-" : displayCount}
              </Text>
            </Box>
          </VStack>

          <Box w="full" display={{ base: "block", lg: "grid" }} gridTemplateColumns="300px 1fr" gap={8} alignItems="start">
            {/* Sidebar with Filters */}
            <Box position={{ lg: "sticky" }} top={{ lg: "100px" }} mb={{ base: 8, lg: 0 }}>
              <FilterPanel filters={filters} setFilters={setFilters} />
            </Box>

            {/* Product grid — skeletons while loading, real cards when ready */}
            <Box>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={10} w="full">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))
                  : products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
              </SimpleGrid>

              {/* Empty state — no products in store */}
              {hasNoProducts && (
                <VStack gap={4} py={12}>
                  <Image
                    src="/empty-state.svg"
                    alt="No products"
                    width={{ base: "200px", md: "300px", lg: "400px" }}
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
                      _active={{ transform: "scale(0.98)" }}
                      sx={{
                        "@keyframes pulse": {
                          "0%":   { boxShadow: "0 0 0 0 rgba(66,153,225,0.6)" },
                          "70%":  { boxShadow: "0 0 0 10px rgba(66,153,225,0)" },
                          "100%": { boxShadow: "0 0 0 0 rgba(66,153,225,0)" },
                        },
                      }}
                    >
                      Create Product
                    </Button>
                  </Link>
                </VStack>
              )}

              {/* Pagination */}
              {!loading && products.length > 0 && !isSearching && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(newPage) => {
                    if (newPage >= 1 && newPage <= totalPages) {
                      setPage(newPage);
                    }
                  }}
                />
              )}

              {/* Empty state — search returned nothing */}
              {hasNoSearchMatch && (
                <VStack gap={4} py={12}>
                  <Text fontSize="6xl">🔎</Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    No matching products
                  </Text>
                  <Text color={labelColor} textAlign="center">
                    Try a different search term or adjust your filters.
                  </Text>
                </VStack>
              )}
            </Box>
          </Box>
        </VStack>
      </Container>

      {recentlyViewed.length > 0 && (
        <Button
          position="fixed"
          bottom="20px"
          right="20px"
          zIndex={99}
          colorScheme="teal"
          size="sm"
          shadow="lg"
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
                  key={p._id}
                  spacing={3}
                  p={3}
                  bg={drawerTagBg}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={drawerBorder}
                  as="a"
                  href={`/product/${p._id}`}
                  _hover={{ textDecoration: "none", borderColor: "teal.400" }}
                  transition="all 0.2s"
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    boxSize="48px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <VStack align="start" spacing={0} flex={1} minW={0}>
                    <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                      {p.name}
                    </Text>
                    <Text fontSize="sm" color="teal.400">
                      {formatPrice(p.price, currency, rates)}
                    </Text>
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

      {compareList.length > 0 && (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          zIndex={100}
          bg={compareBg}
          borderTop="2px solid"
          borderColor="cyan.400"
          px={6}
          py={3}
          shadow="2xl"
        >
          <HStack justify="space-between" maxW="container.xl" mx="auto">
            <HStack spacing={3}>
              {compareList.map((p) => (
                <HStack key={p._id} bg={compareTagBg} px={3} py={1} borderRadius="md">
                  <Text fontSize="sm" fontWeight="bold" noOfLines={1} maxW="120px">
                    {p.name}
                  </Text>
                  <Button size="xs" variant="ghost" colorScheme="red" onClick={() => removeFromCompare(p._id)}>
                    ✕
                  </Button>
                </HStack>
              ))}
              {compareList.length < 2 && (
                <Text fontSize="sm" color="gray.400">
                  Add {2 - compareList.length} more to compare
                </Text>
              )}
            </HStack>
            <HStack>
              <Button size="sm" variant="ghost" onClick={clearCompare}>
                Clear
              </Button>
              <Button
                size="sm"
                colorScheme="cyan"
                isDisabled={compareList.length < 2}
                onClick={onCompareOpen}
              >
                Compare Now
              </Button>
            </HStack>
          </HStack>
        </Box>
      )}

      <Modal isOpen={isCompareOpen} onClose={onCompareClose} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Product Comparison</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} overflowX="auto">
            {compareList.length === 2 && (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Feature</Th>
                    <Th>{compareList[0].name}</Th>
                    <Th>{compareList[1].name}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {[
                    { label: "Price", key: "price", format: (v) => formatPrice(v, currency, rates) },
                    { label: "Brand", key: "brand", format: (v) => v || "—" },
                    { label: "Category", key: "category", format: (v) => v || "—" },
                    { label: "Stock", key: "stock", format: (v) => v ?? "—" },
                    { label: "Discount", key: "discount", format: (v) => (v ? `${v}%` : "—") },
                    { label: "Original Price", key: "originalPrice", format: (v) => (v ? formatPrice(v, currency, rates) : "—") },
                    { label: "Avg Rating", key: "averageRating", format: (v) => (v ? `${v} / 5` : "—") },
                    { label: "Reviews", key: "reviewCount", format: (v) => v ?? 0 },
                    { label: "Description", key: "description", format: (v) => v || "—" },
                  ].map(({ label, key, format }) => (
                    <Tr key={key}>
                      <Td fontWeight="bold">{label}</Td>
                      <Td>{format(compareList[0][key])}</Td>
                      <Td>{format(compareList[1][key])}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <RecentlyViewedCarousel />
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default HomePage;
