import { Flex, Button } from '@chakra-ui/react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}: PaginationProps) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Flex
      justify="center"
      mt={6}
      gap={2}
      align="center"
    >
      {/* Кнопка "Назад" */}
      <Button
        size="sm"
        variant="ghost"
        colorScheme="gray"
        isDisabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &lt;
      </Button>

      {/* Кнопки с номерами страниц */}
      {pages.map((page) => (
        <Button
          key={page}
          size="sm"
          bg={currentPage === page ? '#2B6CB0' : 'transparent'}
          color={currentPage === page ? 'white' : 'gray.600'}
          _hover={{ bg: currentPage === page ? '#2C5282' : 'gray.100' }}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {/* Кнопка "Вперед" */}
      <Button
        size="sm"
        variant="ghost"
        colorScheme="gray"
        isDisabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        &gt;
      </Button>
    </Flex>
  );
};
