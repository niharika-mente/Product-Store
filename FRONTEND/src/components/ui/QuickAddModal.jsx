import React, { useEffect, useState } from "react";
import { useCartStore } from "../../store/cart";import {
  showSuccessToast,
  showWarningToast,
} from "../../utils/toastHelpers";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  HStack,
  useToast,
  Image,
  Box,
  Divider,
} from "@chakra-ui/react";

const QuickAddModal = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCartStore();
  const toast = useToast();

  const isOutOfStock =
    product?.stock != null && product.stock === 0;

  const maxQuantity =
    product?.stock != null ? Math.max(product.stock, 1) : 10;

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  const handleQuickAdd = () => {
    if (!product) return;

    const { status, added } = addToCart(product, quantity);

    if (status === "out_of_stock") {
      showWarningToast(
        toast,
        "Out of Stock",
        `${product.name} is currently unavailable.`
      );
      return;
    }

    if (added === 0) {
      showWarningToast(
        toast,
        "Stock limit reached",
        `You already have the maximum available stock of ${product.name} in your cart.`
      );
      return;
    }

    if (status === "capped") {
      showWarningToast(
        toast,
        "Stock limit reached",
        `Only ${added} item${added !== 1 ? "s were" : " was"} added.`
      );
      onClose();
      return;
    }

    showSuccessToast(
      toast,
      "Added to Cart",
      `${added} × ${product.name} added to your cart.`
    );

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>Quick Add</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box textAlign="center">
              <Image
                src={product?.image}
                alt={product?.name}
                boxSize="120px"
                objectFit="cover"
                mx="auto"
                borderRadius="md"
                mb={3}
                fallbackSrc="https://via.placeholder.com/120"
              />

              <Text fontWeight="bold" fontSize="lg">
                {product?.name}
              </Text>

              <Text color="gray.500">
                ${product?.price}
              </Text>

              <Text fontSize="sm" color="gray.500">
                Available Stock: {product?.stock ?? "N/A"}
              </Text>
            </Box>

            <Divider />

            <HStack justify="space-between" align="center">
              <Text fontWeight="medium">Quantity</Text>

              <HStack>
                <Button
                  size="sm"
                  isDisabled={isOutOfStock || quantity === 1}
                  onClick={() =>
                    setQuantity((prev) => Math.max(1, prev - 1))
                  }
                >
                  -
                </Button>

                <Text minW="30px" textAlign="center" fontWeight="bold">
                  {quantity}
                </Text>

                <Button
                  size="sm"
                  isDisabled={isOutOfStock || quantity >= maxQuantity}
                  onClick={() =>
                    setQuantity((prev) =>
                      Math.min(maxQuantity, prev + 1)
                    )
                  }
                >
                  +
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>

          <Button
            colorScheme="teal"
            onClick={handleQuickAdd}
            isDisabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QuickAddModal;