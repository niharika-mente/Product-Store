import { Container, Text, VStack, Select,Box } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { SimpleGrid } from "@chakra-ui/react";
import React, { useEffect, useState } from 'react';
import { useProductStore } from '../store/product';
import ProductCard from '../components/ui/ProductCard';
import Footer from "../components/ui/footer";
import ScrollToTop from "../components/ui/ScrollToTop";

const HomePage = () => {
  const { fetchProducts,products } = useProductStore();
  const [sort, setSort] = useState("");

  useEffect(() => {
  fetchProducts(sort);
}, [fetchProducts, sort]);

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
      {products.length}
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
          {products.map((product) =>(
            <ProductCard key={product._id} product={product} />
          ))}
          
        </SimpleGrid>

        {products.length === 0 && (
          <Text fontSize='xl' textAlign={"center"} fontWeight='bold' color='gray.500'>
          No products found😢
        </Text>
        )}
      </VStack>
    </Container>
    <Footer />
    <ScrollToTop />
</>
  );
};

export default HomePage;
