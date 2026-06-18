import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, Heading, SimpleGrid, Image, Text, Spinner, Flex, 
  useColorModeValue, LinkBox, LinkOverlay 
} from '@chakra-ui/react';
import { useCurrencyStore } from '../../store/currency';
import { formatPrice } from '../../utils/currency';

const API = ( import.meta.env.VITE_API_URL || "" ).replace( /\/$/, "" );

const RelatedProducts = ({ productId }) => {
  const { currency, rates } = useCurrencyStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.250", "gray.700");
  const titleColor = useColorModeValue("gray.800", "white");
  const priceColor = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/products/related/${productId}`);
        if (!res.ok) throw new Error("Failed to fetch related products");
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRelated();
    }
  }, [productId]);

  if (loading) {
    return (
      <Box mt={12}>
        <Heading as="h3" size="lg" mb={6}>Related Products</Heading>
        <Flex justify="center" py={8}>
          <Spinner size="md" color="blue.500" />
        </Flex>
      </Box>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Box mt={12} borderTop="1px solid" borderColor={borderColor} pt={10}>
      <Heading as="h3" size="lg" mb={6} bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
        Related Products
      </Heading>
      
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6}>
        {products.map((product) => (
          <LinkBox 
            as="article" 
            key={product._id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg={cardBg}
            borderColor={borderColor}
            transition="all 0.3s"
            _hover={{ transform: "translateY(-4px)", shadow: "md" }}
          >
            <Image 
              src={product.image} 
              alt={product.name} 
              h={40} 
              w="full" 
              objectFit="cover" 
              fallbackSrc="https://via.placeholder.com/150"
            />
            
            <Box p={4}>
              <Heading size="xs" my={2}>
                <LinkOverlay as={RouterLink} to={`/product/${product._id}`} color={titleColor} _hover={{ color: "cyan.500" }}>
                  {product.name}
                </LinkOverlay>
              </Heading>
              <Text fontSize="sm" fontWeight="bold" color={priceColor}>
                {formatPrice(product.price, currency, rates)}
              </Text>
            </Box>
          </LinkBox>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default RelatedProducts;
