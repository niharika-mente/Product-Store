import { Container, Text, VStack, Box } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { SimpleGrid } from "@chakra-ui/react"
import React,{useEffect} from 'react'
import { useProductStore } from '../store/product';
import ProductCard from '../components/ui/ProductCard';
import Footer from "../components/ui/footer";

const HomePage = () => {
  const { fetchProducts,products } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  console.log("products",products);

  return (
    <>
    <Container maxW='container.xl' py={12}>
      <VStack spacing={8}>
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
      {/*products.length*/}3
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
          {/*products.map((product) =>(
            <ProductCard key={product._id} product={product} />
          ))*/}
          {/*mock data*/}
          {[
  {
    _id: "1",
    name: "iPhone 15",
    price: 999,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
  },
  {
    _id: "2",
    name: "MacBook Air",
    price: 1299,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
  },
  {
    _id: "3",
    name: "Headphones",
    price: 199,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
  }
].map((product) => (
  <ProductCard key={product._id} product={product} />
))}
          {/*mock data end*/}
        </SimpleGrid>
{/*false=0*/}
        {products.length === false && (
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
      </VStack>
    </Container>
    <Footer />
</>
  );
};

export default HomePage;