import { useProductStore } from '../store/product';
import { Box, Button, Container, Heading, Input, useColorModeValue, useToast, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';

const CreatePage = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    tags: [],
  });

  const toast = useToast();
  const { createProduct } = useProductStore();

  const handleAddProduct = async () => {
    const { success, message } = await createProduct(newProduct);
    if (!success) {
      toast({
        title: "Error",
        description: message,
        status: "error",
        isClosable: true
      });
    } else {
      toast({
        title: "Success",
        description: message,
        status: "success",
        isClosable: true
      });
    }
    setNewProduct({ name: "", price: "", image: "", tags: [] });
  };

  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Container maxW={"container.sm"}>
      <VStack spacing={8}>
        <Heading as={"h1"} size={"2xl"} textAlign={"center"} mb={8}>
          Create New Product
        </Heading>

        <Box
          w={"full"} bg={cardBg}
          p={6} rounded={"lg"} shadow={"md"}
        >
          <VStack spacing={4}>
            <Input
              placeholder='Product Name'
              name='name'
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <Input
              placeholder='Price'
              name='price'
              type='number'
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <Input
              placeholder='Image URL'
              name='image'
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
            />

            {/* ─── TAGS INPUT ────────────────────────────────────────── */}
            <Input
              placeholder='Tags (comma separated, e.g. wireless, premium)'
              name='tags'
              value={newProduct.tags.join(', ')}
              onChange={(e) => {
                const tagsArray = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag && tag.length >= 2 && tag.length <= 30);
                setNewProduct({ ...newProduct, tags: tagsArray });
              }}
            />

            <Button colorScheme='blue' onClick={handleAddProduct} w='full'>
              Add Product
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreatePage;
