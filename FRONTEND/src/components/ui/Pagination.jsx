import { Button, ButtonGroup, HStack } from "@chakra-ui/react";
import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <HStack spacing={2} pt={6} wrap="wrap" justify="center" width="full">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage <= 1}
        colorScheme="blue"
        variant="outline"
      >
        Previous
      </Button>

      <ButtonGroup isAttached variant="outline">
        {pageNumbers.map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            colorScheme={page === currentPage ? "blue" : "gray"}
            variant={page === currentPage ? "solid" : "outline"}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        ))}
      </ButtonGroup>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
        colorScheme="blue"
        variant="outline"
      >
        Next
      </Button>
    </HStack>
  );
};

export default Pagination;
