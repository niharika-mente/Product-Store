import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Text, Select, Button, VStack, HStack, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { getSocket } from '../socket';

const ProductPage = () => {
  const { id } = useParams();
  const toast = useToast();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [displayPrice, setDisplayPrice] = useState(0);
  const [displayStock, setDisplayStock] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get('/api/products/' + id);
        setProduct(data);
        if (!data.hasVariants) {
          setDisplayPrice(data.basePrice);
          setDisplayStock(data.baseStock);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && product.hasVariants && selectedSize && selectedColor) {
      const matched = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
      if (matched) {
        setDisplayPrice(matched.price);
        setDisplayStock(matched.stock);
        setSelectedVariantId(matched._id);
      } else {
        setDisplayStock(0);
        setSelectedVariantId(null);
      }
    }
  }, [selectedSize, selectedColor, product]);

  useEffect(() => {
    if (!product) return;
    
    const socket = getSocket();
    const handleStockUpdate = (data) => {
      if (data.productId === product._id) {
        setProduct((prev) => ({ ...prev, baseStock: data.newStock }));
        if (!product.hasVariants) {
          setDisplayStock(data.newStock);
        }
      }
    };

    socket.on("stockUpdate", handleStockUpdate);

    return () => {
      socket.off("stockUpdate", handleStockUpdate);
    };
  }, [product]);

  const handleAddToCart = async () => {
    try {
      if (product.hasVariants && !selectedVariantId) {
        toast({ title: 'Please select valid options', status: 'warning' });
        return;
      }
      await axios.post('/api/cart', { productId: product._id, variantId: selectedVariantId, quantity: 1 });
      toast({ title: 'Added to cart!', status: 'success' });
    } catch {
      toast({ title: 'Error adding to cart', status: 'error' });
    }
  };

  if (!product) return <Box>Loading...</Box>;

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
            <Box position="sticky" top="100px">
              <Box
                w="full" h={{ base: "400px", md: "550px" }}
                overflow="hidden" borderRadius="2xl"
                border="1px solid" borderColor={borderCol}
                boxShadow="2xl" bg={cardBg} position="relative"
                transition="all 0.3s" _hover={{ boxShadow: "dark-lg" }}
              >
                <Image
                  src={allImages[activeImg]}
                  alt={`${product.name} image ${activeImg + 1}`}
                  objectFit="contain" w="full" h="full" p={4}
                  fallbackSrc="https://via.placeholder.com/600x600?text=Product+Image"
                />
                {allImages.length > 1 && (
                  <>
                    <Button
                      position="absolute" left={2} top="50%" transform="translateY(-50%)"
                      size="sm" borderRadius="full" zIndex={1}
                      onClick={() => setActiveImg((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      aria-label="Previous image"
                    ><Icon as={FaChevronLeft} /></Button>
                    <Button
                      position="absolute" right={2} top="50%" transform="translateY(-50%)"
                      size="sm" borderRadius="full" zIndex={1}
                      onClick={() => setActiveImg((prev) => (prev + 1) % allImages.length)}
                      aria-label="Next image"
                    ><Icon as={FaChevronRight} /></Button>
                  </>
                )}
              </Box>
              {allImages.length > 1 && (
                <HStack spacing={2} mt={3} justify="center" flexWrap="wrap">
                  {allImages.map((img, idx) => (
                    <Box
                      key={idx} as="button" onClick={() => setActiveImg(idx)}
                      borderRadius="md" overflow="hidden" border="2px solid"
                      borderColor={activeImg === idx ? "blue.400" : borderCol}
                      w="60px" h="60px" transition="all 0.2s"
                      _hover={{ borderColor: "blue.300" }}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <Image src={img} alt={`thumb ${idx}`} objectFit="cover" w="full" h="full" />
                    </Box>
                  ))}
                </HStack>
              )}
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
                    isDisabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                  >
                    -
                  </Button>
                  <Text fontSize="xl" fontWeight="bold" minW="50px" textAlign="center">
                    {quantity}
                  </Text>
                  <Button
                    size="md"
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    isDisabled={quantity >= maxQty || isOutOfStock}
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
                isDisabled={isOutOfStock}
                boxShadow="lg"
                _hover={{
                  transform: isOutOfStock ? "none" : "translateY(-3px)",
                  boxShadow: isOutOfStock ? "lg" : "2xl",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
              >
                {isOutOfStock ? "Out of Stock" : `Add ${quantity > 1 ? `${quantity} items` : ''} to Cart`}
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
                    <Text as="span" textDecoration={isFullBundle ? "line-through" : "none"} color="gray.400">
                      ${bundleData.bundleTotal}
                    </Text>
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    ${(() => {
                      const selectedTotal = [product, ...bundleData.items
                        .filter(i => selectedBundleItems.includes(i.product._id))
                        .map(i => i.product)]
                        .reduce((sum, p) => sum + p.price, 0);
                      const isFullBundle = selectedBundleItems.length === bundleData.items.length;
                      const discount = isFullBundle
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
export default ProductPage;