import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Container, Flex, Image, Heading, Text, Button, 
  Spinner, Alert, AlertIcon, VStack, HStack, useColorModeValue, 
  useToast, Badge, Divider, Icon, Grid, GridItem, SimpleGrid, Checkbox
} from '@chakra-ui/react';
import { FaArrowLeft, FaShoppingCart, FaCheckCircle, FaTruck, FaShieldAlt, FaUndo, FaInfoCircle, FaGift } from 'react-icons/fa';
import {useCart}  from "../store/cart.js";

import RelatedProducts from '../components/ui/RelatedProducts';
import ProductReviews from '../components/ui/ProductReviews';

const API = ( import.meta.env.VITE_API_URL || "" ).replace( /\/$/, "" );

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [bundleData, setBundleData] = useState(null);
  const [selectedBundleItems, setSelectedBundleItems] = useState([]);
  
  const { addToCart, addBundleToCart } = useCart();
  const toast = useToast();
  
  const textColor = useColorModeValue("gray.700", "gray.300");
  const priceColor = useColorModeValue("blue.600", "blue.300");
  const borderCol = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const featureBg = useColorModeValue("gray.50", "gray.700");
  const infoColor = useColorModeValue("gray.700", "gray.300");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API}/api/products/${id}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Product not found. It may have been deleted or the link is invalid.");
          } else if (res.status === 500) {
            throw new Error("Server error. Please try again later.");
          } else {
            throw new Error(`HTTP ${res.status}: Failed to fetch product`);
          }
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

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchBundle = async () => {
      try {
        const res = await fetch(`${API}/api/products/${id}/bundle`);
        const data = await res.json();
        if (data.success && data.data.items.length > 0) {
          setBundleData(data.data);
          setSelectedBundleItems(data.data.items.map(i => i.product._id));
        }
      } catch {
      }
    };
    fetchBundle();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} added to your cart.`,
        status: "success",
        duration: 2500,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleAddBundleToCart = () => {
    const allItems = [product, ...bundleData.items
      .filter(i => selectedBundleItems.includes(i.product._id))
      .map(i => i.product)];
    addBundleToCart(allItems);
    toast({
      title: "Bundle Added!",
      description: `${allItems.length} items added to your cart.`,
      status: "success",
      duration: 2500,
      isClosable: true,
      position: "top-right",
    });
  };

  const toggleBundleItem = (productId) => {
    setSelectedBundleItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <Flex minH="70vh" align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
        <Text color={textColor} fontSize="lg">Loading product details...</Text>
      </Flex>
    );
  }

  if (error || !product) {
    return (
      <Container maxW="container.md" py={20}>
        <Alert status="error" borderRadius="lg" variant="left-accent" p={6}>
          <AlertIcon boxSize={6} />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold" fontSize="lg">Error Loading Product</Text>
            <Text fontSize="sm">{error || "Product not found or has been removed."}</Text>
          </VStack>
        </Alert>
        <Button 
          as={RouterLink} 
          to="/" 
          mt={6} 
          colorScheme="blue" 
          leftIcon={<FaArrowLeft />}
          size="lg"
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxW="container.xl" py={8}>
        {/* Breadcrumb */}
        <Button
          as={RouterLink}
          to="/"
          variant="ghost"
          leftIcon={<FaArrowLeft />}
          mb={6}
          size="sm"
          _hover={{ bg: featureBg }}
        >
          Back to Products
        </Button>

        <Grid 
          templateColumns={{ base: "1fr", lg: "1fr 1fr" }} 
          gap={12} 
          mb={16}
        >
          {/* Product Image Section */}
          <GridItem>
            <Box 
              position="sticky"
              top="100px"
              w="full" 
              h={{ base: "400px", md: "550px" }}
              overflow="hidden" 
              borderRadius="2xl" 
              border="1px solid" 
              borderColor={borderCol}
              boxShadow="2xl"
              bg={cardBg}
              transition="all 0.3s"
              _hover={{ boxShadow: "dark-lg" }}
            >
              <Image 
                src={product.image} 
                alt={product.name} 
                objectFit="contain" 
                w="full" 
                h="full" 
                p={4}
                fallbackSrc="https://via.placeholder.com/600x600?text=Product+Image"
              />
            </Box>
          </GridItem>

          {/* Product Details Section */}
          <GridItem>
            <VStack align="stretch" spacing={6}>
              {/* Product Title */}
              <Box>
                {/* Stock Badge - Only show if stock data exists */}
                {product.stock !== undefined && product.stock !== null && (
                  <Badge 
                    colorScheme={product.stock > 0 ? "green" : "red"} 
                    fontSize="sm" 
                    mb={3} 
                    px={3} 
                    py={1} 
                    borderRadius="full"
                  >
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                  </Badge>
                )}
                
                <Heading 
                  as="h1" 
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                  fontWeight="extrabold"
                  lineHeight="1.2"
                  mb={2}
                >
                  {product.name}
                </Heading>

                {/* Average Rating */}
                {product.reviewCount > 0 && (
                  <HStack spacing={2} mt={2}>
                    {[1,2,3,4,5].map(s => (
                      <Box key={s} as="span" color={s <= Math.round(product.averageRating) ? 'yellow.400' : 'gray.300'} fontSize="sm">
                        ★
                      </Box>
                    ))}
                    <Text fontSize="sm" color={infoColor}>
                      {product.averageRating} ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                    </Text>
                  </HStack>
                )}

                {/* Category & Brand - Only show if exists */}
                <HStack spacing={3} mt={2} flexWrap="wrap">
                  {product.category && (
                    <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
                      {product.category}
                    </Badge>
                  )}
                  {product.brand && (
                    <Text fontSize="sm" color={textColor}>
                      Brand: <Text as="span" fontWeight="bold">{product.brand}</Text>
                    </Text>
                  )}
                </HStack>
              </Box>

              {/* Price */}
              <HStack spacing={4} align="baseline" flexWrap="wrap">
                <Text fontSize={{ base: "4xl", md: "5xl" }} fontWeight="bold" color={priceColor}>
                  ${product.price}
                </Text>
                
                {/* Show original price and discount only if data exists */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <Text fontSize="lg" color={textColor} textDecoration="line-through">
                      ${product.originalPrice}
                    </Text>
                    <Badge colorScheme="red" fontSize="md" px={2} py={1}>
                      {product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </HStack>

              <Divider />

              {/* Description */}
              <Box>
                <Heading as="h3" size="md" mb={3}>
                  Product Description
                </Heading>
                {product.description && product.description.trim() ? (
                  <Text fontSize="md" color={textColor} lineHeight="tall" whiteSpace="pre-wrap">
                    {product.description}
                  </Text>
                ) : (
                  <Box 
                    p={4} 
                    bg={featureBg} 
                    borderRadius="md" 
                    borderWidth="1px" 
                    borderColor={borderCol}
                    borderStyle="dashed"
                  >
                    <HStack spacing={2} color={infoColor}>
                      <Icon as={FaInfoCircle} />
                      <Text fontSize="sm">
                        No detailed description available for this product yet. Check back later for more information.
                      </Text>
                    </HStack>
                  </Box>
                )}
              </Box>

              <Divider />

              {/* Quantity Selector */}
              <Box>
                <Text fontWeight="semibold" mb={2}>Quantity</Text>
                <HStack spacing={3}>
                  <Button 
                    size="md" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    isDisabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </Button>
                  <Text fontSize="xl" fontWeight="bold" minW="50px" textAlign="center">
                    {quantity}
                  </Text>
                  <Button 
                    size="md" 
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    isDisabled={quantity >= 10}
                    aria-label="Increase quantity"
                  >
                    +
                  </Button>
                </HStack>
              </Box>

              {/* Add to Cart Button */}
              <Button 
                colorScheme="blue" 
                size="lg" 
                fontSize="lg"
                h="60px"
                onClick={handleAddToCart}
                leftIcon={<FaShoppingCart />}
                boxShadow="lg"
                _hover={{ 
                  transform: "translateY(-3px)", 
                  boxShadow: "2xl" 
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
              >
                Add {quantity > 1 ? `${quantity} items` : ''} to Cart
              </Button>

              {/* Features Grid */}
              <SimpleGrid columns={2} spacing={4} mt={4}>
                <FeatureBox 
                  icon={FaTruck} 
                  title="Free Delivery" 
                  desc="On orders over $50"
                  bg={featureBg}
                />
                <FeatureBox 
                  icon={FaShieldAlt} 
                  title="Secure Payment" 
                  desc="100% protected"
                  bg={featureBg}
                />
                <FeatureBox 
                  icon={FaUndo} 
                  title="Easy Returns" 
                  desc="30-day guarantee"
                  bg={featureBg}
                />
                <FeatureBox 
                  icon={FaCheckCircle} 
                  title="Verified Quality" 
                  desc="Premium standard"
                  bg={featureBg}
                />
              </SimpleGrid>
            </VStack>
          </GridItem>
        </Grid>

        {/* Frequently Bought Together */}
        {bundleData && bundleData.items.length > 0 && (
          <Box mb={16}>
            <Divider mb={8} />
            <Flex align="center" gap={3} mb={6}>
              <Icon as={FaGift} boxSize={6} color="blue.500" />
              <Heading as="h2" size="lg" fontWeight="bold">
                Frequently Bought Together
              </Heading>
            </Flex>

            <Box
              border="1px solid"
              borderColor={borderCol}
              borderRadius="2xl"
              p={6}
              bg={cardBg}
              boxShadow="lg"
            >
              <VStack align="stretch" spacing={4}>
                <HStack spacing={4}>
                  <Checkbox
                    isChecked
                    isDisabled
                    size="lg"
                    colorScheme="blue"
                  />
                  <Image
                    src={product.image}
                    alt={product.name}
                    boxSize="60px"
                    objectFit="cover"
                    borderRadius="md"
                    fallbackSrc="https://via.placeholder.com/60"
                  />
                  <Box flex={1}>
                    <Text fontWeight="semibold">{product.name}</Text>
                    <Text fontSize="sm" color={textColor}>${product.price}</Text>
                  </Box>
                </HStack>

                {bundleData.items.map((ci) => (
                  <HStack key={ci.product._id} spacing={4}>
                    <Checkbox
                      isChecked={selectedBundleItems.includes(ci.product._id)}
                      onChange={() => toggleBundleItem(ci.product._id)}
                      size="lg"
                      colorScheme="blue"
                    />
                    <Image
                      src={ci.product.image}
                      alt={ci.product.name}
                      boxSize="60px"
                      objectFit="cover"
                      borderRadius="md"
                      fallbackSrc="https://via.placeholder.com/60"
                    />
                    <Box flex={1}>
                      <Text fontWeight="semibold">{ci.product.name}</Text>
                      <Text fontSize="sm" color={textColor}>${ci.product.price}</Text>
                      {ci.reason && (
                        <Text fontSize="xs" color="blue.400" fontStyle="italic">
                          {ci.reason}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                ))}
              </VStack>

              <Divider my={6} />

              <Flex
                direction={{ base: "column", md: "row" }}
                align={{ base: "stretch", md: "center" }}
                justify="space-between"
                gap={4}
              >
                <Box>
                  <Text fontSize="sm" color={textColor}>
                    Bundle Total:{' '}
                    <Text as="span" textDecoration="line-through" color="gray.400">
                      ${bundleData.bundleTotal}
                    </Text>
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    ${(() => {
                      const selectedTotal = [product, ...bundleData.items
                        .filter(i => selectedBundleItems.includes(i.product._id))
                        .map(i => i.product)]
                        .reduce((sum, p) => sum + p.price, 0);
                      const discount = selectedTotal === bundleData.bundleTotal
                        ? bundleData.bundleDiscount
                        : 0;
                      return (selectedTotal * (1 - discount)).toFixed(2);
                    })()}
                  </Text>
                  {selectedBundleItems.length === bundleData.items.length && (
                    <Text fontSize="sm" color="green.500" fontWeight="medium">
                      Save ${bundleData.savings} ({Math.round(bundleData.bundleDiscount * 100)}% off)
                    </Text>
                  )}
                </Box>
                <Button
                  colorScheme="green"
                  size="lg"
                  leftIcon={<FaShoppingCart />}
                  onClick={handleAddBundleToCart}
                  isDisabled={selectedBundleItems.length === 0}
                  boxShadow="lg"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                >
                  Add Bundle to Cart
                </Button>
              </Flex>
            </Box>
          </Box>
        )}

        {/* Reviews Section */}
        <ProductReviews productId={id} />

        {/* Related Products Section */}
        <RelatedProducts productId={id} />
      </Container>
    </>
  );
};

// Feature Box Component
const FeatureBox = ({ icon, title, desc, bg }) => {
  const textColor = useColorModeValue("gray.700", "gray.300");
  
  return (
    <HStack 
      p={4} 
      bg={bg} 
      borderRadius="lg" 
      spacing={3}
      border="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.600")}
    >
      <Icon as={icon} boxSize={6} color="blue.500" />
      <Box>
        <Text fontWeight="bold" fontSize="sm">{title}</Text>
        <Text fontSize="xs" color={textColor}>{desc}</Text>
      </Box>
    </HStack>
  );
};

export default ProductPage;
