import { Container, Text, VStack, Select } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { SimpleGrid } from "@chakra-ui/react"
import React, { useEffect, useState } from 'react';
import { useProductStore } from '../store/product';
import ProductCard from '../components/ui/ProductCard';

const HomePage = () => {
  const { fetchProducts,products } = useProductStore();
  const [sort, setSort] = useState("");

  useEffect(() => {
  fetchProducts(sort);
}, [fetchProducts, sort]);

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
      </VStack>
    </Container>
  );
};

export default HomePage