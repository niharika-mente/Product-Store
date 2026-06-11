import { Container, VStack, Heading, Text, Button, Icon, useColorModeValue } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { CloseIcon } from "@chakra-ui/icons";

const CancelPage = () => {
  const bg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Container maxW="container.md" py={12}>
      <VStack
        spacing={6}
        p={10}
        bg={bg}
        borderRadius="xl"
        boxShadow="xl"
        textAlign="center"
      >
        <Icon as={CloseIcon} w={16} h={16} color="red.400" />
        <Heading as="h1" size="2xl" color="red.400">
          Payment Cancelled
        </Heading>
        <Text fontSize="lg" color={textColor}>
          Your payment was not processed. Your cart items are still saved — try again when you're ready.
        </Text>
        <Link to="/">
          <Button colorScheme="blue" size="lg" mt={6} _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }} transition="all 0.2s">
            Back to Store
          </Button>
        </Link>
      </VStack>
    </Container>
  );
};

export default CancelPage;
