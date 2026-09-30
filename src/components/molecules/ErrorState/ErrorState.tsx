import { Box, Button, Center, Text } from '@chakra-ui/react';
import React from 'react';

interface ErrorStateProps {
  message?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Не удалось загрузить шаблоны',
  description = 'Проверьте соединение и повторите',
  onRetry
}) => {
  return (
    <Center>
      <Box
        bg="#FFFFFF"
        borderRadius="20px"
        borderBottom="3px solid"
        borderColor="#E2E8F0"
        py="40px"
        w="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="12px"
        boxShadow="0 1px 3px rgba(30, 41, 59, 0.08)"
      >
        {/* Заголовок ошибки: xl / font-bold */}
        <Text
          fontSize="xl"
          fontWeight="bold"
          lineHeight="30px"
          letterSpacing="0"
          color="#12233F"
          textAlign="center"
        >
          {message}
        </Text>

        {/* Описание: md / font-normal */}
        <Text
          fontSize="md"
          fontWeight="normal"
          lineHeight="24px"
          letterSpacing="0"
          color="#52525B"
          textAlign="center"
        >
          {description}
        </Text>

        {/* Кнопка "Повторить" */}
        {onRetry && (
          <Button
            bg="#3B6EA0"
            color="#FFFFFF"
            borderRadius="8px"
            h="48px"
            w="126px"
            fontSize="md"
            fontWeight="medium"
            lineHeight="24px"
            letterSpacing="0"
            px="20px"
            py="2px"
            mt={2}
            _hover={{ bg: '#2f5a85' }}
            onClick={onRetry}
          >
            Повторить
          </Button>
        )}
      </Box>
    </Center>
  );
};

export default ErrorState;
