import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Image,
  Select,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/product";
import ProductCard from "../components/ui/ProductCard";
import Footer from "../components/ui/footer";
import ScrollToTop from "../components/ui/ScrollToTop";
import useDebounce from "../hooks/useDebounce";

const ProductCardSkeleton = () => {
  const bg          = useColorModeValue("white", "gray.800");
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
  const { fetchProducts, products, searchQuery, searchProducts } = useProductStore();
  const [sort, setSort]       = useState("");
  const [loading, setLoading] = useState(true);

  const labelColor = useColorModeValue("gray.600", "gray.300");

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
  let ignore = false;

  const run = async () => {
    setLoading(true);

    try {
      const query = debouncedSearch.trim();

      if (query === "") {
        await fetchProducts(sort);
      } else {
        await searchProducts(query);
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
  }, [debouncedSearch, sort, fetchProducts, searchProducts]);
  
  const isSearching      = debouncedSearch.trim() !== "";
  const hasNoProducts    = !loading && products.length === 0 && !isSearching;
  const hasNoSearchMatch = !loading && products.length === 0 && isSearching;

  return (
    <>
      <Container maxW="container.xl" py={12}>
        <VStack spacing={5}>
          <Text
            fontSize="30px"
            fontWeight="bold"
            bgGradient="linear(to-r, cyan.400, blue.500)"
            bgClip="text"
            textAlign="center"
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
                {loading ? "-" : products.length}
              </Text>
            </Box>
          </VStack>

          {/* Product grid — skeletons while loading, real cards when ready */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
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
                  _hover={{ transform: "translateY(-3px) scale(1.05)", boxShadow: "xl" }}
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

          {/* Empty state — search returned nothing */}
          {hasNoSearchMatch && (
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

      <Footer />
      <ScrollToTop />
    </>
  );
};

export default HomePage;
