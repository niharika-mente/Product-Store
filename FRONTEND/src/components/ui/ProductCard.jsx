import { Box, Button, Heading, HStack, IconButton, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useColorModeValue, useDisclosure, useToast, VStack } from '@chakra-ui/react';
import React from 'react'
import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useProductStore } from "../../store/product";
import { useCart } from "../../context/CartContext.jsx";

const ProductCard = ({ product }) => {
  const [updatedProduct, setUpdatedProduct] = useState(product);

  const textColor = useColorModeValue("gray.600","gray.200");
  const bg = useColorModeValue("white","gray.800");

  const { deleteProduct ,updateProduct}=useProductStore()
  const { addToCart } = useCart(); 
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your shopping cart.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteProduct = async (pid) => {
    const {success,message} = await deleteProduct(pid)
    if(!success){
      toast({
        title:"Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else{
      toast({
        title: "Success",
        description: "Product deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateProduct = async (pid, updatedProduct) => {
    const { success, message } = await updateProduct(pid, updatedProduct);
    onClose();
    if (!success) {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: "Product updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
   <Box
  role="group"
  shadow="lg"
  rounded="lg"
  overflow="hidden"
  borderWidth="1px"
  borderColor={borderColor}
  transition="all 0.3s"
  _hover={{
    transform: "translateY(-8px)",
    shadow: "2xl",
  }}
  bg={bg}
>
    <Image src={product.image} alt={product.name} h={48} w='full' objectFit='cover'  transition="transform 0.4s"
  _groupHover={{transform: "scale(1.05)",
            }} />

    <Box p={4}>
      <Heading as='h3' size='md' mb={2} noOfLines={1}>
        {product.name}
      </Heading>

      <Text fontWeight='bold' fontSize='xl' color={textColor} mb={4}>
        ${product.price}
      </Text>

      {/* ─── TAGS DISPLAY ────────────────────────────────────────── */}
      {product.tags && product.tags.length > 0 && (
        <HStack spacing={1} mb={3} flexWrap="wrap">
          {product.tags.map((tag, index) => (
            <Text
              key={index}
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="full"
              bg="blue.100"
              color="blue.800"
              _dark={{
                bg: "blue.900",
                color: "blue.200"
              }}
            >
              #{tag}
            </Text>
          ))}
        </HStack>
      )}

      <HStack spacing={2}>
        <IconButton 
          icon={<FaEdit />} 
          onClick={onOpen}
          colorScheme='blue' 
          aria-label='Edit Product'
          transition="all 0.2s"
          _hover={{
          transform: "scale(1.1)",
  }}
        />
        
        <IconButton 
          icon={<FaTrash />} 
          onClick={() => handleDeleteProduct(product._id)} 
          colorScheme='red' 
          aria-label='Delete Product' 
          transition="all 0.2s"
          _hover={{
            transform: "scale(1.1)",
          }}
        />
        
        <Button colorScheme='teal' onClick={handleAddToCart} size='sm' flex={1}
          transition="all 0.2s"
          _hover={{
            transform: "translateY(-2px)",
          }}
        >
          Add to Cart
        </Button>
      </HStack>
    </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>

        <ModalContent>
          <ModalHeader>Update Product</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder='Product Name'
                name='name'
                value={updatedProduct.name}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
              />
              <Input
                placeholder='Price'
                name='price'
                type='number'
                value={updatedProduct.price}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
              />
              <Input
                placeholder='Image URL'
                name='image'
                value={updatedProduct.image}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, image: e.target.value })}
              />
              {/* ─── TAGS INPUT IN EDIT MODAL ───────────────────────── */}
              <Input
                placeholder='Tags (comma separated, e.g. wireless, premium)'
                name='tags'
                value={updatedProduct.tags ? updatedProduct.tags.join(', ') : ''}
                onChange={(e) => {
                  const tagsArray = e.target.value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag && tag.length >= 2 && tag.length <= 30);
                  setUpdatedProduct({ ...updatedProduct, tags: tagsArray });
                }}
              />
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme='blue'
              mr={3}
              onClick={() => handleUpdateProduct(product._id, updatedProduct)}
            >
              Update
            </Button>
            <Button variant='ghost' onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
   </Box>
  );
};

export default ProductCard;