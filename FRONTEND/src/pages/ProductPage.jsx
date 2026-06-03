import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Container, Flex, Image, Heading, Text, Button, 
  Spinner, Alert, AlertIcon, VStack, useColorModeValue, useToast 
} from '@chakra-ui/react';
import { useCart } from '../context/CartContext.jsx';
import RelatedProducts from '../components/ui/RelatedProducts';

const API = ( import.meta.env.VITE_API_URL || "" ).replace( /\/$/, "" );

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { addToCart } = useCart();
  const toast = useToast();
  
  const textColor = useColorModeValue("gray.600", "gray.200");
  const priceColor = useColorModeValue("cyan.600", "cyan.300");
  const borderCol = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/api/products/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch product details");
        }
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch product details");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your shopping cart.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  if (error || !product) {
    return (
      <Container maxW="container.md" py={12}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error || "Product not found."}
        </Alert>
        <Button as={RouterLink} to="/" mt={4} colorScheme="blue">
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={12}>
      <Flex direction={{ base: "column", md: "row" }} gap={10} mb={16} align="center">
        {/* Product Image Section */}
        <Box 
          flex={1} 
          w="full" 
          maxH="450px" 
          overflow="hidden" 
          borderRadius="lg" 
          border="1px solid" 
          borderColor={borderCol}
          boxShadow="lg"
        >
          <Image 
            src={product.image} 
            alt={product.name} 
            objectFit="cover" 
            w="full" 
            h="full" 
            fallbackSrc="https://via.placeholder.com/400"
          />
        </Box>

        {/* Product Details Section */}
        <VStack flex={1} align="stretch" spacing={6}>
          <Heading as="h1" size="2xl">
            {product.name}
          </Heading>

          <Text fontSize="3xl" fontWeight="bold" color={priceColor}>
            ${product.price}
          </Text>

          <Text fontSize="md" color={textColor} lineHeight="tall">
            This premium {product.name} is designed with high-quality materials to ensure durability and style. Perfect for daily use and designed to seamlessly integrate into your lifestyle.
          </Text>

          <Button 
            colorScheme="teal" 
            size="lg" 
            onClick={handleAddToCart}
            w={{ base: "full", md: "200px" }}
            boxShadow="md"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.2s"
          >
            Add to Cart
          </Button>
        </VStack>
      </Flex>

      {/* Related Products Section */}
      <RelatedProducts productId={id} />
    </Container>
  );
};

export default ProductPage;
