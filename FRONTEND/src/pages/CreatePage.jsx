import { useProductStore } from '../store/product';
import { 
  Box, Button, Container, Heading, Input, useColorModeValue, 
  useToast, VStack, Collapse, Text, HStack, Icon, Textarea,
  Select, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, Divider
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaInfoCircle } from 'react-icons/fa';

const CreatePage = () => {
  const[newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    // Optional fields
    description: "",
    category: "",
    brand: "",
    stock: "",
    originalPrice: "",
    discount: ""
  });

  const [showExtraDetails, setShowExtraDetails] = useState(false);

  const toast = useToast();
  const {createProduct} = useProductStore();

  const handleAddProduct = async() => {
    const {success,message}= await createProduct(newProduct);
    if(!success){
      toast({
        title:"Error",
        description: message,
        status: "error",
        isClosable: true,
        duration: 3000
      });
    } else{
      toast({
        title:"Success",
        description: message,
        status: "success",
        isClosable: true,
        duration: 3000
      });
    }
    setNewProduct({ 
      name: "", 
      price: "", 
      image: "",
      description: "",
      category: "",
      brand: "",
      stock: "",
      originalPrice: "",
      discount: ""
    });
    setShowExtraDetails(false);
  };

  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toggleBg = useColorModeValue("blue.50", "blue.900");
  const infoColor = useColorModeValue("gray.700", "gray.300");

  return (
   <Container maxW = {"container.sm"} py={12}>
    <VStack spacing={8}>
      <Heading as={"h1"} size={"2xl"} textAlign={"center"} mb={4}>
        Create New Product
      </Heading>

      <Box
        w={"full"} 
        bg={useColorModeValue("white","gray.800")}
        p={6} 
        rounded={"lg"} 
        shadow={"md"}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={4}>
          {/* Required Fields Section */}
          <Box w="full">
            <Text fontSize="sm" fontWeight="semibold" mb={3} color={infoColor}>
              Basic Information (Required)
            </Text>
            
            <VStack spacing={3}>
              <Input 
                placeholder = 'Product Name'
                name = 'name'
                aria-label="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                size="lg"
              />
              <Input
                placeholder = 'Price ($)'
                name = 'price'
                type='number'
                aria-label="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                size="lg"
              />
              <Input 
                placeholder = 'Image URL'
                name = 'image'
                aria-label="Image URL"
                value={newProduct.image}
                onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                size="lg"
              />
            </VStack>
          </Box>

          <Divider my={2} />

          {/* Toggle Button for Extra Details */}
          <Button
            w="full"
            variant="outline"
            colorScheme="blue"
            onClick={() => setShowExtraDetails(!showExtraDetails)}
            rightIcon={showExtraDetails ? <FaChevronUp /> : <FaChevronDown />}
            bg={showExtraDetails ? toggleBg : "transparent"}
            size="md"
          >
            {showExtraDetails ? "Hide" : "Add"} Extra Details (Optional)
          </Button>

          {/* Collapsible Extra Details Section */}
          <Collapse in={showExtraDetails} animateOpacity style={{ width: '100%' }}>
            <VStack spacing={4} w="full" pt={4}>
              <HStack w="full" align="start" spacing={2} color={infoColor} fontSize="sm">
                <Icon as={FaInfoCircle} mt={0.5} />
                <Text>
                  Adding extra details helps customers make informed decisions and improves product visibility.
                </Text>
              </HStack>

              <Textarea
                placeholder="Product Description (detailed information about the product)"
                name="description"
                aria-label="Product Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                rows={4}
                resize="vertical"
              />

              <Select
                placeholder="Select Category"
                name="category"
                aria-label="Select Category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              >
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing & Fashion</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports">Sports & Outdoors</option>
                <option value="Books">Books & Media</option>
                <option value="Health">Health & Beauty</option>
                <option value="Toys">Toys & Games</option>
                <option value="Food">Food & Beverage</option>
                <option value="Other">Other</option>
              </Select>

              <Input
                placeholder="Brand / Manufacturer"
                name="brand"
                aria-label="Brand"
                value={newProduct.brand}
                onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
              />

              <Input
                placeholder="Stock Quantity (available units)"
                name="stock"
                type="number"
                min="0"
                aria-label="Stock Quantity"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
              />

              <Input
                placeholder="Original Price (before discount)"
                name="originalPrice"
                type="number"
                min="0"
                step="0.01"
                aria-label="Original Price"
                value={newProduct.originalPrice}
                onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
              />

              <Input
                placeholder="Discount Percentage (0-100)"
                name="discount"
                type="number"
                min="0"
                max="100"
                aria-label="Discount Percentage"
                value={newProduct.discount}
                onChange={(e) => setNewProduct({...newProduct, discount: e.target.value})}
              />
            </VStack>
          </Collapse>

          {/* Submit Button */}
          <Button 
            colorScheme='blue' 
            onClick={handleAddProduct} 
            w='full'
            size="lg"
            mt={4}
          >
            Add Product
          </Button>
        </VStack>
      </Box>
    </VStack>
    </Container>
    );
};

export default CreatePage;