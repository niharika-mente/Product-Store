import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { FaBalanceScale, FaEdit, FaHeart, FaRegHeart, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCartStore } from "../../store/cart";
import { useCurrencyStore } from "../../store/currency";
import { useProductStore } from "../../store/product";
import { useWishlist } from "../../context/WishlistContext.jsx";
import { formatPrice } from "../../utils/currency";
import QuickViewModal from "./QuickViewModal";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/toastHelpers";

const ProductCard = ({ product }) => {
  const [updatedProduct, setUpdatedProduct] = useState(product);
  const [imagePreview, setImagePreview] = useState(product.image);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const handleClose = () => {
    setUpdatedProduct(product);
    setImagePreview(product.image);
    onClose();
  };

  const fileInputRef = useRef(null);
  const cancelRef = useRef();

  const textColor = useColorModeValue("gray.600", "gray.200");
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const optionalLabelColor = useColorModeValue("gray.600", "gray.300");

  const {
    deleteProduct,
    updateProduct,
    restockProduct,
    addToCompare,
    compareList = [],
    isSubmitting,
    isDeleting,
  } = useProductStore();

  const isInCompare = compareList.some((p) => p._id === product._id);
  const addToCart = useCartStore(
    (state) => state.addToCart
  );
  const { addToWishlist, removeFromWishlist, checkInWishlist } = useWishlist();
  const toast = useToast();
  const { currency, rates } = useCurrencyStore();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isQuickViewOpen,
    onOpen: onQuickViewOpen,
    onClose: onQuickViewClose,
  } = useDisclosure();

  const LOW_STOCK_THRESHOLD = 5;
  const isOutOfStock = !product.stock || product.stock <= 0;
  const isLowStock = product.stock != null && product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  // Sync updatedProduct when product prop changes
  useEffect(() => {
    setUpdatedProduct(product);
    setImagePreview(product.image);
  }, [product]);

  // Check wishlist status on mount
  useEffect(() => {
    const inWishlist = checkInWishlist(product._id);
    setIsInWishlist(inWishlist);
  }, [product._id, checkInWishlist]);

  // Revoke blob URLs to avoid memory leaks
  useEffect(() => {
    const url = imagePreview;
    return () => {
      if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [imagePreview]);

  const handleModalOpen = () => {
    setUpdatedProduct(product);
    setImagePreview(product.image);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onOpen();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUpdatedProduct({ ...updatedProduct, imageFile: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const { status } = addToCart(product);
    if (status === "capped") {
      showWarningToast(
        toast,
        "Stock limit reached",
        `Only ${product.stock} unit(s) of ${product.name} are available.`
      );
      return;
    }
    if (status === "out_of_stock") return;
    showSuccessToast(
      toast,
      "Added to Cart",
      `${product.name} has been added to your shopping cart.`
    );
  };

  const handleWishlistToggle = async () => {
    if (isInWishlist) {
      const result = await removeFromWishlist(product._id);
      if (result.success) {
        setIsInWishlist(false);
        showInfoToast(
          toast,
          "Removed from Wishlist",
          `${product.name} has been removed from your wishlist.`
        );
      } else {
        showErrorToast(toast, "Error", result.message || "Failed to remove from wishlist");
      }
    } else {
      const result = await addToWishlist(product._id);
      if (result.success) {
        setIsInWishlist(true);
        showSuccessToast(
          toast,
          "Added to Wishlist",
          `${product.name} has been added to your wishlist. ❤️`
        );
      } else {
        showErrorToast(toast, "Error", result.message || "Failed to add to wishlist");
      }
    }
  };

  const handleDeleteProduct = async () => {
    onDeleteClose();
    const { success, message } = await deleteProduct(product._id);
    if (!success) {
      showErrorToast(toast, "Error", message);
    } else {
      showSuccessToast(toast, "Success", "Product deleted successfully");
    }
  };

  const handleUpdateProduct = async (pid, updatedProduct) => {
    const { success, message } = await updateProduct(pid, updatedProduct);
    onClose();
    if (!success) {
      showErrorToast(toast, "Error", message);
    } else {
      showSuccessToast(toast, "Success", "Product updated successfully");
    }
  };

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
<Box position="relative">
  <Link to={`/product/${product._id}`} tabIndex="-1" aria-hidden="true">
    <Image
      src={product.image}
      alt={product.name}
      h={48}
      w="full"
      objectFit="cover"
      fallbackSrc="https://via.placeholder.com/600x600?text=Product+Image"
      transition="transform 0.4s"
      _groupHover={{ transform: "scale(1.05)" }}
      cursor="pointer"
    />
  </Link>

  {isLowStock && (
    <Badge
      position="absolute"
      top={2}
      left={2}
      colorScheme="orange"
      fontSize="xs"
      px={2}
      py={1}
      borderRadius="md"
      zIndex={1}
      boxShadow="sm"
    >
      Low Stock
    </Badge>
  )}

  {isOutOfStock && (
    <Badge
      position="absolute"
      top={2}
      left={2}
      colorScheme="red"
      fontSize="xs"
      px={2}
      py={1}
      borderRadius="md"
      zIndex={1}
      boxShadow="sm"
    >
      Out of Stock
    </Badge>
  )}
</Box>
      <Box p={4}>
        {/* Product Name with Link */}
        <Heading as="h3" size="md" mb={2} noOfLines={1}>
          <Link to={`/product/${product._id}`} style={{ textDecoration: "none" }}>
            <Text _hover={{ color: "cyan.500" }} transition="color 0.2s">
              {product.name}
            </Text>
          </Link>
        </Heading>

        {/* Price */}
        <Text fontWeight="bold" fontSize="xl" color={textColor} mb={4}>
          {formatPrice(product.price, currency, rates)}
        </Text>

        {/* Tags */}
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
                _dark={{ bg: "blue.900", color: "blue.200" }}
              >
                #{tag}
              </Text>
            ))}
          </HStack>
        )}

        {/* Action Buttons */}
        <Stack direction={{ base: "column", sm: "row" }} spacing={2}>
          <HStack spacing={2}>
            {/* Quick View */}
            <Button size="sm" colorScheme="purple" onClick={onQuickViewOpen}>
              Quick View
            </Button>

            {/* Wishlist */}
            <IconButton
              icon={isInWishlist ? <FaHeart color="red" /> : <FaRegHeart />}
              onClick={handleWishlistToggle}
              colorScheme={isInWishlist ? "red" : "gray"}
              variant="ghost"
              aria-label="Add to Wishlist"
              size="sm"
              transition="all 0.2s"
              _hover={{ transform: "scale(1.1)" }}
            />

            {/* Edit */}
            <IconButton
              icon={<FaEdit />}
              onClick={handleModalOpen}
              colorScheme="blue"
              aria-label={`Edit ${product.name}`}
              size="sm"
              transition="all 0.2s"
              _hover={{ transform: "scale(1.1)" }}
            />

            {/* Delete */}
            <IconButton
              icon={<FaTrash />}
              onClick={onDeleteOpen}
              colorScheme="red"
              aria-label={`Delete ${product.name}`}
              size="sm"
              transition="all 0.2s"
              _hover={{ transform: "scale(1.1)" }}
            />

            {/* Compare */}
            <IconButton
              icon={<FaBalanceScale />}
              onClick={() => addToCompare(product)}
              colorScheme={isInCompare ? "purple" : "gray"}
              aria-label="Add to compare"
              isDisabled={!isInCompare && compareList.length >= 4}
              title={
                isInCompare
                  ? "Added to compare"
                  : compareList.length >= 4
                  ? "Remove one to compare"
                  : "Add to compare"
              }
              size="sm"
              transition="all 0.2s"
              _hover={{ transform: "scale(1.1)" }}
            />
          </HStack>

          {/* Add to Cart */}
          <Button
            colorScheme="teal"
            onClick={handleAddToCart}
            size="sm"
            flex={1}
            w={{ base: "full", sm: "auto" }}
            isDisabled={isOutOfStock}
            aria-label={`Add ${product.name} to cart`}
            transition="all 0.2s"
            _hover={{ transform: isOutOfStock ? "none" : "translateY(-2px)" }}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </Stack>
      </Box>

      {/*  Delete Confirmation Dialog  */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Product
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete <strong>{product.name}</strong>? This action
              cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteProduct}
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/*Edit / Update Modal*/}
      <Modal isOpen={isOpen} onClose={handleClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Update Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="Product Name"
                name="name"
                aria-label="Product Name"
                value={updatedProduct.name}
                onChange={(e) =>
                  setUpdatedProduct({ ...updatedProduct, name: e.target.value })
                }
              />
              <Input
                placeholder="Price"
                name="price"
                type="number"
                min={0}
                aria-label="Price"
                value={updatedProduct.price}
                onChange={(e) =>
                  setUpdatedProduct({ ...updatedProduct, price: Number(e.target.value) })
                }
              />

              <Box w="full">
                <Text fontSize="sm" mb={1} color="gray.500">
                  Upload a new image or paste a URL
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
                value={updatedProduct.imageFile ? "" : updatedProduct.image}
                onChange={(e) => {
                  setUpdatedProduct({
                    ...updatedProduct,
                    image: e.target.value,
                    imageFile: null,
                  });
                  setImagePreview(e.target.value || product.image);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />

              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  maxH="150px"
                  objectFit="contain"
                  rounded="md"
                  border="1px solid"
                  borderColor="gray.200"
                  w="full"
                />
              )}

              <Text
                fontSize="sm"
                fontWeight="bold"
                alignSelf="start"
                color={optionalLabelColor}
                mt={2}
              >
                Optional Details
              </Text>

              <Input
                placeholder="Description (optional)"
                name="description"
                aria-label="Description"
                value={updatedProduct.description || ""}
                onChange={(e) =>
                  setUpdatedProduct({ ...updatedProduct, description: e.target.value })
                }
              />

              <Input
                placeholder="Category (optional)"
                name="category"
                aria-label="Category"
                value={updatedProduct.category || ""}
                onChange={(e) =>
                  setUpdatedProduct({ ...updatedProduct, category: e.target.value })
                }
              />

              <Input
                placeholder="Brand (optional)"
                name="brand"
                aria-label="Brand"
                value={updatedProduct.brand || ""}
                onChange={(e) =>
                  setUpdatedProduct({ ...updatedProduct, brand: e.target.value })
                }
              />

              <Input
                placeholder="Stock Quantity (optional)"
                name="stock"
                type="number"
                aria-label="Stock Quantity"
                value={updatedProduct.stock ?? ""}
                onChange={(e) =>
                  setUpdatedProduct({
                    ...updatedProduct,
                    stock: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
              {updatedProduct.stock != null && updatedProduct.stock !== '' && updatedProduct.stock <= LOW_STOCK_THRESHOLD && (
                <Box w="full">
                  <Text fontSize="xs" color="orange.500" fontWeight="semibold" mb={1}>
                    ⚠ Low stock — quick restock:
                  </Text>
                  <HStack spacing={2}>
                    {[10, 25, 50].map((amount) => (
                      <Button
                        key={amount}
                        size="xs"
                        colorScheme="orange"
                        variant="outline"
                        isLoading={isSubmitting}
                        onClick={async () => {
                          const result = await restockProduct(product._id, amount);
                          if (result.success) {
                            setUpdatedProduct((prev) => ({
                              ...prev,
                              stock: result.data.stock,
                            }));
                            toast({
                              title: `Restocked +${amount}`,
                              status: "success",
                              duration: 2000,
                              isClosable: true,
                            });
                          } else {
                            toast({
                              title: "Restock failed",
                              description: result.message,
                              status: "error",
                              duration: 3000,
                              isClosable: true,
                            });
                          }
                        }}
                      >
                        +{amount}
                      </Button>
                    ))}
                  </HStack>
                </Box>
              )}

              <Input
                placeholder="Original Price (optional)"
                name="originalPrice"
                type="number"
                aria-label="Original Price"
                value={updatedProduct.originalPrice ?? ""}
                onChange={(e) =>
                  setUpdatedProduct({
                    ...updatedProduct,
                    originalPrice: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />

              <Input
                placeholder="Discount % (optional)"
                name="discount"
                type="number"
                aria-label="Discount Percentage"
                value={updatedProduct.discount ?? ""}
                onChange={(e) =>
                  setUpdatedProduct({
                    ...updatedProduct,
                    discount: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />

              {/* Tags Input */}
              <Input
                placeholder="Tags (comma separated, e.g. wireless, premium)"
                name="tags"
                value={updatedProduct.tags ? updatedProduct.tags.join(", ") : ""}
                onChange={(e) => {
                  const tagsArray = e.target.value
                    .split(",")
                    .map((tag) => tag.trim().toLowerCase())
                    .filter((tag) => /^[a-z0-9-]{1,30}$/.test(tag));
                  setUpdatedProduct({ ...updatedProduct, tags: tagsArray });
                }}
              />
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleUpdateProduct(product._id, updatedProduct)}
              isLoading={isSubmitting}
              loadingText="Updating..."
            >
              Update
            </Button>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={onQuickViewClose}
        product={product}
      />
    </Box>
  );
};

export default ProductCard;

