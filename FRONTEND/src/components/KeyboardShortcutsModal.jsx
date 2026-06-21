import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Kbd,
  Text,
  useColorModeValue,
  Box,
  HStack,
} from '@chakra-ui/react';

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const shortcuts = [
    {
      key: <Kbd>/</Kbd>,
      action: 'Focus Search Input',
    },
    {
      key: <Kbd>N</Kbd>,
      action: 'Create New Product',
    },
    {
      key: <Kbd>C</Kbd>,
      action: 'Open Cart Drawer',
    },
    {
      key: <Kbd>Esc</Kbd>,
      action: 'Close Modal / Drawer',
    },
    {
      key: (
        <HStack spacing={1}>
          <Kbd>▲</Kbd>
          <Kbd>▼</Kbd>
          <Kbd>◀</Kbd>
          <Kbd>▶</Kbd>
        </HStack>
      ),
      action: 'Navigate Between Products',
    },
    {
      key: <Kbd>?</Kbd>,
      action: 'Show Keyboard Shortcuts Help',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={useColorModeValue('white', 'gray.800')}>
        <ModalHeader borderBottomWidth="1px">Keyboard Shortcuts</ModalHeader>
        <ModalCloseButton />
        <ModalBody py={4}>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th>Shortcut</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {shortcuts.map((shortcut, idx) => (
                  <Tr key={idx}>
                    <Td>{shortcut.key}</Td>
                    <Td color={textColor} fontWeight="medium">
                      {shortcut.action}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </ModalBody>
        <ModalFooter borderTopWidth="1px">
          <Button colorScheme="blue" onClick={onClose}>
            Got it
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default KeyboardShortcutsModal;
