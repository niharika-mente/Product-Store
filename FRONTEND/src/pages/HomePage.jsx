import { Box, Container, Select, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { SimpleGrid } from "@chakra-ui/react"
import React,{ useEffect, useState } from 'react'
import { useProductStore } from '../store/product';
import ProductCard from '../components/ui/ProductCard';
import Pagination from '../components/ui/Pagination';

const HomePage = () => {
  const { fetchProducts, products } = useProductStore();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 10;

  useEffect(() => {
    const loadProducts = async () => {
      const response = await fetchProducts(page, limit);
      if ( response.success )
      {
        // Keep pagination state aligned with backend metadata.
        const normalizedPage = response.totalPages === 0 ? 1 : Math.min(page, response.totalPages);
        if ( page !== normalizedPage )
        {
          setPage(normalizedPage);
          return;
        }

        setTotalPages(response.totalPages);
        setTotalProducts(response.totalProducts);
      }
    };

    loadProducts();
  }, [fetchProducts, page]);
import React, { useEffect, useState } from 'react';
import { useProductStore } from '../store/product';
import ProductCard from '../components/ui/ProductCard';
import Footer from "../components/ui/footer";
import ScrollToTop from "../components/ui/ScrollToTop";
import useDebounce from '../hooks/useDebounce';

const HomePage = () => {
  const { fetchProducts, products, searchQuery, searchProducts } = useProductStore();
  const [sort, setSort] = useState("");
  const labelColor = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
  fetchProducts(sort);
}, [fetchProducts, sort]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  // const filteredProducts = products.filter((product) =>
  //   (product.name?.toLowerCase() ?? "").includes(normalizedQuery)
  // );

  const debounceSearch=useDebounce(searchQuery,500);

  useEffect(() => {
    if (debounceSearch.trim() === "") {
      fetchProducts(sort);
    } else {
      searchProducts(debounceSearch);
    }
  }, [debounceSearch] );


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
          No products found😢{" "}
          <Link to={"/create"}>
            <Text as='span' color='blue.500' _hover={{ textDecoration: "underline"}}>
              Create a product✨
            </Text>
          </Link>
        </Text>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => {
            if ( newPage >= 1 && newPage <= totalPages ) {
              setPage(newPage);
            }
          }}
        />
  <VStack gap={4} py={12}>
    <Text fontSize="6xl">📦</Text>

    <Text
      fontSize="2xl"
      fontWeight="bold"
    >
      No Products Yet
    </Text>

    <Text color={labelColor} textAlign="center">
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

        {products.length > 0 && searchQuery && (
  <VStack gap={4} py={12}>
    <Text fontSize="6xl">🔎</Text>

    <Text
      fontSize="2xl"  
      fontWeight="bold"
    >
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
