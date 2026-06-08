import { Container, Text, VStack, Select, Box, Skeleton, SimpleGrid } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useProductStore } from '../store/product';
import ProductCard from '../components/ui/ProductCard';
import Footer from "../components/ui/footer";
import ScrollToTop from "../components/ui/ScrollToTop";

const HomePage = () => {
  const { fetchProducts, products, isLoading } = useProductStore(); // ✅ Get isLoading
  const [sort, setSort] = useState("");

  useEffect(() => {
    fetchProducts(sort);
  }, [fetchProducts, sort]);

  // ✅ Show loading skeletons when isLoading is true
  if (isLoading) {
    return (
      <>
        <Container maxW='container.xl' py={12}>
          <VStack spacing={8}>
            <Skeleton height="40px" width="250px" />
            <Skeleton height="40px" width="250px" />
            
            <VStack gap={2}>
              <Skeleton height="60px" width="400px" />
              <Skeleton height="40px" width="300px" />
              <Skeleton height="60px" width="140px" />
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w={"full"}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Box key={item} p={4} borderWidth="1px" borderRadius="lg">
                  <Skeleton height="200px" mb={4} />
                  <Skeleton height="24px" width="80%" mb={2} />
                  <Skeleton height="20px" width="60%" mb={2} />
                  <Skeleton height="20px" width="40%" mb={4} />
                  <Skeleton height="36px" width="100%" />
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
        <Footer />
        <ScrollToTop />
      </>
    );
  }

  // ✅ Rest of your original JSX (no changes needed here)
  return (
    <>
      <Container maxW='container.xl' py={12}>
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

            <Text color="gray.500" textAlign="center" maxW="600px">
              Browse and manage your product collection with ease.
            </Text>
            
            <Box
              display="inline-block"
              bg="blue.500"
              color="white"
              px={6} py={3}
              borderRadius="xl"
              minW="140px"
              textAlign="center"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-3px)", boxShadow: "lg" }}
            >
              <Text fontSize="sm">Products</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {products.length}
              </Text>
            </Box>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w={"full"}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </SimpleGrid>

          {products.length === 0 && !isLoading && (
            <VStack gap={4} py={12}>
              <Text fontSize="6xl">📦</Text>
              <Text fontSize="2xl" fontWeight="bold">No Products Yet</Text>
              <Text color="gray.500" textAlign="center">
                Start building your store by adding your first product.
              </Text>
              <Link to="/create">
                <Text color="blue.500" fontWeight="bold" _hover={{ color: "blue.600" }}>
                  Create Product ✨
                </Text>
              </Link>
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