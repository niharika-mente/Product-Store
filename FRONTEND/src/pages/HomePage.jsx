import { Box, Container, Select, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useProductStore } from '../store/product';
import ProductCard from '../components/ui/ProductCard';
import Footer from "../components/ui/footer";
import ScrollToTop from "../components/ui/ScrollToTop";

const HomePage = () => {
  const { fetchProducts, products, searchQuery } = useProductStore();
  const [sort, setSort] = useState("");

  useEffect(() => {
  fetchProducts(sort);
}, [fetchProducts, sort]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) =>
    (product.name?.toLowerCase() ?? "").includes(normalizedQuery)
  );

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

  <Text
    color="gray.500"
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
            lg: 3
          }}
          spacing={10}
          w={"full"}
        >
          {filteredProducts.map((product) =>(
            <ProductCard key={product._id} product={product} />
          ))}
          
        </SimpleGrid>

        {products.length === 0 && (
  <VStack gap={4} py={12}>
    <Text fontSize="6xl">📦</Text>

    <Text
      fontSize="2xl"
      fontWeight="bold"
    >
      No Products Yet
    </Text>

    <Text color="gray.500" textAlign="center">
      Start building your store by adding your first product.
    </Text>

    <Link to="/create">
      <Text
        color="blue.500"
        fontWeight="bold"
        display="inline-block"
        transition="all 0.2s"
        _hover={{
          color: "blue.600",
          transform: "translateY(-2px)",
        }}
      >
        Create Product ✨
      </Text>
    </Link>
  </VStack>
)}

        {products.length > 0 && filteredProducts.length === 0 && (
  <VStack gap={4} py={12}>
    <Text fontSize="6xl">🔎</Text>

    <Text
      fontSize="2xl"
      fontWeight="bold"
    >
      No matching products
    </Text>

    <Text color="gray.500" textAlign="center">
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
