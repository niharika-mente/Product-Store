import { useTranslation } from 'react-i18next';
import { useProductStore } from '../store/product';
import {
  Box, Button, Collapse, Container, Divider, Heading, HStack, Icon,
  Image, Input, Select, Text, Textarea, useColorModeValue, useToast, VStack
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaInfoCircle } from 'react-icons/fa';
import {
  showSuccessToast,
  showErrorToast,
} from "../utils/toastHelpers";

const CreatePage = () => {
  const { t } = useTranslation();
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    imageFile: null,
    images: [],
    description: "",
    category: "",
    brand: "",
    stock: "",
    originalPrice: "",
    discount: ""
  });
  const [preview, setPreview] = useState(null);
  const [extraImageInput, setExtraImageInput] = useState("");
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const fileInputRef = useRef(null);

  const toast = useToast();
  const { createProduct, isSubmitting } = useProductStore();

  useEffect(() => {
    const url = preview;
    return () => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewProduct({ ...newProduct, imageFile: file, image: "" });
    setPreview(URL.createObjectURL(file));
  };

  const handleAddProduct = async () => {
    const { success, message } = await createProduct(newProduct);
    if (!success) {
      showErrorToast(toast, "Error", message);
    } else {
      showSuccessToast(toast, "Success", message);
      setNewProduct({
        name: "", price: "", image: "", imageFile: null, images: [],
        description: "", category: "", brand: "", stock: "", originalPrice: "", discount: ""
      });
      setPreview(null);
      setExtraImageInput("");
      setShowExtraDetails(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toggleBg = useColorModeValue("blue.50", "blue.900");
  const infoColor = useColorModeValue("gray.700", "gray.300");

  return (
    <Container maxW={"container.sm"} py={12}>
      <VStack spacing={8}>
        <Heading as={"h1"} size={"2xl"} textAlign={"center"} mb={4}>
          Create New Product
        </Heading>

        <Box
          w={"full"}
          bg={useColorModeValue("white", "gray.800")}
          p={6}
          rounded={"lg"}
          shadow={"md"}
          borderWidth="1px"
          borderColor={borderColor}
        >
          <VStack spacing={4}>
            <Box w="full">
              <Text fontSize="sm" fontWeight="semibold" mb={3} color={infoColor}>
                Basic Information (Required)
              </Text>
              <VStack spacing={3}>
                <Input
                  placeholder={t('products.name')}
                  name="name"
                  aria-label="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  size="lg"
                />
                <Input
                  placeholder="Price ($)"
                  name="price"
                  type="number"
                  aria-label="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  size="lg"
                />

                <Box w="full">
                  <Text fontSize="sm" mb={1} color="gray.500">
                    Upload an image or paste a URL below
                  </Text>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    aria-label="Upload product image"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    p={1}
                  />
                </Box>

                <Input
                  placeholder="Or paste an Image URL"
                  name="image"
                  aria-label="Image URL"
                  value={newProduct.image}
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, image: e.target.value, imageFile: null });
                    setPreview(e.target.value || null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />

                {preview && (
                  <Image
                    src={preview}
                    alt="Product preview"
                    maxH="200px"
                    objectFit="contain"
                    rounded="md"
                    border="1px solid"
                    borderColor="gray.200"
                    w="full"
                  />
                )}

                <Box w="full">
                  <Text fontSize="sm" mb={1} color="gray.500">
                    Additional Images (optional, max 4)
                  </Text>
                  <HStack>
                    <Input
                      placeholder="Paste additional image URL"
                      aria-label="Additional Image URL"
                      value={extraImageInput}
                      onChange={(e) => setExtraImageInput(e.target.value)}
                    />
                    <Button
                      colorScheme="blue" variant="outline" px={6}
                      isDisabled={!extraImageInput.trim() || newProduct.images.length >= 4}
                      onClick={() => {
                        if (extraImageInput.trim()) {
                          setNewProduct({ ...newProduct, images: [...newProduct.images, extraImageInput.trim()] });
                          setExtraImageInput("");
                        }
                      }}
                    >Add</Button>
                  </HStack>
                  {newProduct.images.length > 0 && (
                    <VStack align="stretch" mt={2} spacing={1}>
                      {newProduct.images.map((url, idx) => (
                        <HStack key={idx} bg={toggleBg} px={3} py={1} borderRadius="md" fontSize="sm">
                          <Text flex={1} noOfLines={1} color={infoColor}>{url}</Text>
                          <Button size="xs" colorScheme="red" variant="ghost"
                            onClick={() => setNewProduct({ ...newProduct, images: newProduct.images.filter((_, i) => i !== idx) })}
                          >✕</Button>
                        </HStack>
                      ))}
                      <Text fontSize="xs" color="gray.400">{newProduct.images.length}/4 additional images</Text>
                    </VStack>
                  )}
                </Box>
              </VStack>
            </Box>

            <Divider my={2} />

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
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  rows={4}
                  resize="vertical"
                />

                <Select
                  placeholder="Select Category"
                  name="category"
                  aria-label="Select Category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
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
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                />

                <Input
                  placeholder="Stock Quantity (available units)"
                  name="stock"
                  type="number"
                  min="0"
                  aria-label="Stock Quantity"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />

                <Input
                  placeholder="Original Price (before discount)"
                  name="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  aria-label="Original Price"
                  value={newProduct.originalPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                />

                <Input
                  placeholder="Discount Percentage (0-100)"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  aria-label="Discount Percentage"
                  value={newProduct.discount}
                  onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                />
              </VStack>
            </Collapse>

            <Button 
              colorScheme='blue' 
              onClick={handleAddProduct} 
              w='full'
              size="lg"
              mt={4}
              isLoading={isSubmitting}
              loadingText="Creating Product..."
              spinnerPlacement="start"
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
