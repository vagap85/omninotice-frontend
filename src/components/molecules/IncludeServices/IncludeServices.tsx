import { Box, HStack, Image, Text } from '@chakra-ui/react';
import React from 'react';

import cherryIcon from '@/assets/icons/cherry.svg';

export const IncludeServices: React.FC = () => {
  return (
    <Box
      bg="#FFFFFF"
      borderRadius="20px"
      p="24px"
      w="100%"
      display="flex"
      gap="12px"
      flexDirection="column"
    >
      {/* Заголовок с иконкой */}
      <HStack
        spacing="12px"
        align="center"
      >
        <Image
          src={cherryIcon}
          alt="Иконка Вишенка"
          boxSize="32px"
          objectFit="contain"
          borderRadius="8px"
        />
        <Text
          fontSize="2xl"
          fontWeight="semibold"
          lineHeight="32px"
          letterSpacing="0"
          color="#12233F"
        >
          Подключите свое приложение к «Вишенке»
        </Text>
      </HStack>

      {/* Основной текст */}
      <Text
        fontSize="md"
        fontWeight="normal"
        lineHeight="24px"
        letterSpacing="0"
        color="#475569"
      >
        «Вишенка» позволяет отправлять push-уведомления пользователям в
        корпоративные приложения. Чтобы использовать сервис, нужно подключить
        его к вашему продукту. Расскажем, как устроен сервис, и поможем с
        настройкой.
      </Text>

      {/* Контактная информация */}
      <Text
        fontSize="sm"
        fontWeight="medium"
        lineHeight="20px"
        letterSpacing="0"
        color="#12233F"
      >
        Свяжитесь с нами s@eitica.ru
      </Text>
    </Box>
  );
};

export default IncludeServices;
