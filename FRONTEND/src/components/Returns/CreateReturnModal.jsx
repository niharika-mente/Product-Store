import { notify } from '../../utils/toastService';
import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Image,
  Box,
} from '@chakra-ui/react';

const RETURN_REASONS = [
  "Defective",
  "Wrong Item",
  "Changed Mind",
  "Damaged in Transit",
  "Item Doesn't Match Description",
  "Other"
];

const CreateReturnModal = ({ isOpen, onClose, order, onReturnSuccess }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(false);
  

  const handleSelectItem = (item, isSelected) => {
    if (isSelected) {
      setSelectedItems({
        ...selectedItems,
        [item.product]: {
          productId: item.product,
          name: item.name,
          price: item.price,
          quantity: 1,
          maxQuantity: item.quantity,
          reason: RETURN_REASONS[0],
          condition: "Unopened",
        }
      });
    } else {
      const newSelected = { ...selectedItems };
      delete newSelected[item.product];
      setSelectedItems(newSelected);
    }
  };

  const handleUpdateItem = (productId, field, value) => {
    setSelectedItems({
      ...selectedItems,
      [productId]: {
        ...selectedItems[productId],
        [field]: value
      }
    });
  };

  const handleSubmit = async () => {
    const itemsArray = Object.values(selectedItems);
    if (itemsArray.length === 0) {
      notify.success('Success', 'Operation successful');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order._id,
          items: itemsArray
        })
      });

      const data = await res.json();
      if (data.success) {
        notify.success('Success', 'Operation successful');
        onReturnSuccess();
        onClose();
      } else {
        notify.error('Error', 'An error occurred');
      }
    } catch {
      notify.error('Error', 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Initiate Return for Order #{order?._id}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Text>Select the items you wish to return:</Text>
            {order?.items.map(item => {
              const isSelected = !!selectedItems[item.product];
              const selectedData = selectedItems[item.product];

              return (
                <Box key={item.product} p={3} borderWidth="1px" borderRadius="md">
                  <HStack justify="space-between" align="start">
                    <HStack align="start">
                      <Checkbox 
                        isChecked={isSelected} 
                        onChange={(e) => handleSelectItem(item, e.target.checked)}
                        mt={1}
                      />
                      {item.image && <Image src={item.image} boxSize="50px" borderRadius="md" />}
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{item.name}</Text>
                        <Text fontSize="sm">Price: ${item.price.toFixed(2)} | Ordered: {item.quantity}</Text>
                      </VStack>
                    </HStack>
                  </HStack>

                  {isSelected && (
                    <VStack align="stretch" mt={3} spacing={3} pl={6}>
                      <HStack>
                        <Text w="100px" fontSize="sm">Quantity:</Text>
                        <NumberInput 
                          size="sm" 
                          maxW={20} 
                          min={1} 
                          max={item.quantity}
                          value={selectedData.quantity}
                          onChange={(_, val) => handleUpdateItem(item.product, 'quantity', val)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </HStack>
                      <HStack>
                        <Text w="100px" fontSize="sm">Reason:</Text>
                        <Select 
                          size="sm" 
                          value={selectedData.reason}
                          onChange={(e) => handleUpdateItem(item.product, 'reason', e.target.value)}
                        >
                          {RETURN_REASONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </Select>
                      </HStack>
                      <HStack>
                        <Text w="100px" fontSize="sm">Condition:</Text>
                        <Select 
                          size="sm" 
                          value={selectedData.condition}
                          onChange={(e) => handleUpdateItem(item.product, 'condition', e.target.value)}
                        >
                          <option value="Unopened">Unopened</option>
                          <option value="Opened">Opened</option>
                          <option value="Damaged">Damaged</option>
                          <option value="Defective">Defective</option>
                        </Select>
                      </HStack>
                    </VStack>
                  )}
                </Box>
              );
            })}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button colorScheme="cyan" onClick={handleSubmit} isLoading={loading}>
            Submit Return
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateReturnModal;
