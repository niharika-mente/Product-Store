import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Text, Select, Button, VStack, HStack, useToast } from '@chakra-ui/react';
import axios from 'axios';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
  setQuantity(1);
}, [id]);
  const [bundleData, setBundleData] = useState(null);
  const [selectedBundleItems, setSelectedBundleItems] = useState([]);
  const [activeImg, setActiveImg] = useState(0);

  const { addToCart, addBundleToCart } = useCart();
  const { addRecentlyViewed } = useRecentlyViewed();
  const toast = useToast();
  const [product, setProduct] = useState(null);
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

  const handleAddToCart = async () => {
    try {
      if (product.hasVariants && !selectedVariantId) {
        toast({ title: 'Please select valid options', status: 'warning' });
        return;
      }
      await axios.post('/api/cart', { productId: product._id, variantId: selectedVariantId, quantity: 1 });
      toast({ title: 'Added to cart!', status: 'success' });
    } catch (err) {
      toast({ title: 'Error adding to cart', status: 'error' });
    }
  };

  if (!product) return <Box>Loading...</Box>;

  return (
    <Box p={5}>
      <Heading>{product.name}</Heading>
      <Text>{product.description}</Text>
      <Text fontSize='2xl' mt={2}>$ {displayPrice}</Text>
      <Text>{displayStock > 0 ? 'In Stock: ' + displayStock : 'Out of Stock'}</Text>
      {product.hasVariants && (
        <VStack align='start' spacing={3} mt={4}>
          <HStack>
            <Text>Size:</Text>
            <Select placeholder='Select Size' onChange={e => setSelectedSize(e.target.value)}>
              {[...new Set(product.variants.map(v => v.size))].map(size => <option key={size} value={size}>{size}</option>)}
            </Select>
          </HStack>
          <HStack>
            <Text>Color:</Text>
            <Select placeholder='Select Color' onChange={e => setSelectedColor(e.target.value)}>
              {[...new Set(product.variants.map(v => v.color))].map(color => <option key={color} value={color}>{color}</option>)}
            </Select>
          </HStack>
        </VStack>
      )}
      <Button colorScheme='blue' mt={5} onClick={handleAddToCart} isDisabled={displayStock === 0}>Add to Cart</Button>
    </Box>
  );
};
export default ProductPage;