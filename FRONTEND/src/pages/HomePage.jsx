import { Container, Text, VStack } from '@chakra-ui/react';
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

  return (
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
      </VStack>
    </Container>
  );
};

export default HomePage