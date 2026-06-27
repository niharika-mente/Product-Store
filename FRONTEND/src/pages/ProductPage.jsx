import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box, VStack, HStack, Text, Image, Button, Badge,
  useToast, Spinner, Grid, GridItem, Heading
} from '@chakra-ui/react';
import { useProductStore } from '../../store/product';

const ProductPage = () => {
  const { id } = useParams();
  const { getProduct } = useProductStore();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await getProduct(id);
      setProduct(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load product',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl">Product not found</Text>
        <Button as={Link} to="/" mt={4} colorScheme="blue">
          Back to Products
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
        <Box>
          <Image src={product.image} alt={product.name} rounded="lg" w="100%" objectFit="cover" />
        </Box>
        <VStack align="start" spacing={4}>
          <Heading as="h1" size="xl">{product.name}</Heading>
          <Text fontSize="2xl" color="blue.600" fontWeight="bold">${product.price}</Text>
          <Text>{product.description}</Text>
          <Badge colorScheme={product.stock > 0 ? 'green' : 'red'} fontSize="md" px={3} py={1} rounded="full">
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </Badge>
          <Button colorScheme="blue" size="lg" w="100%" isDisabled={product.stock === 0}>
            Add to Cart
          </Button>
          <Button as={Link} to="/" variant="outline" size="lg" w="100%">
            Back to Products
          </Button>
        </VStack>
      </Grid>
    </Box>
  );
};

export default ProductPage;