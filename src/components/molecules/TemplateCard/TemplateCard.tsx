import { Box, Button, Flex, HStack, Image, Tag, Text } from '@chakra-ui/react';
import React from 'react';

import cherryIcon from '@/assets/icons/cherry.svg';
import { NotificationTemplate } from '@/types/template';

interface TemplateCardProps {
  template: NotificationTemplate;
  onUseTemplate: (template: NotificationTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onUseTemplate
}) => {
  if (!template) return null;

  return (
    <Box
      bg="#FFFFFF"
      borderRadius="20px"
      p="24px"
      w="100%"
      h="100%" // ← Карточка занимает всю высоту ячейки SimpleGrid
      display="flex"
      flexDirection="column"
      gap="16px"
      boxShadow="0 1px 3px rgba(30, 41, 59, 0.08)"
      border="1px solid"
      borderColor="#E2E8F0"
    >
      {/* Название канала */}
      <HStack spacing={2}>
        <Image
          src={cherryIcon}
          alt="Вишенка Push"
          boxSize="20px"
          objectFit="contain"
        />
        <Text
          fontSize="sm"
          fontWeight="medium"
          lineHeight="20px"
          letterSpacing="0"
          color="#12233F"
        >
          Вишенка Push
        </Text>
      </HStack>

      {/* Заголовок шаблона */}
      <Text
        fontSize="xl"
        fontWeight="bold"
        lineHeight="30px"
        letterSpacing="0"
        color="#0F172A"
      >
        {template.title}
      </Text>

      {/* Блок с текстом уведомления — растягивается на всё доступное пространство */}
      <Box
        bg="#F8FAFC"
        borderRadius="12px"
        p="16px"
        display="flex"
        flexDirection="column"
        gap="16px"
        flex={1} // ← Растягивается, чтобы все серые блоки были одинаковой высоты
      >
        <Text
          fontSize="sm"
          fontWeight="bold"
          lineHeight="20px"
          letterSpacing="0"
          color="#12233F"
        >
          {template.title}
        </Text>

        <Text
          fontSize="sm"
          fontWeight="normal"
          lineHeight="20px"
          letterSpacing="0"
          color="#12233F"
        >
          {template.body}
        </Text>

        {template.buttonText && (
          <Box
            bg="#3B6EA0"
            color="#FFFFFF"
            borderRadius="8px"
            display="block"
            h="36px"
            py="px"
            px="14px"
            fontSize="sm"
            fontWeight="medium"
            lineHeight="20px"
            letterSpacing="0"
            alignSelf="flex-start"
            cursor="default"
          >
            {template.buttonText}
          </Box>
        )}
      </Box>

      {/* Теги переменных */}
      <Flex
        wrap="wrap"
        gap={2}
      >
        {template.variables.map((variable) => (
          <Tag
            key={variable.key}
            bg="#E2EBF3"
            color="#2D547B"
            borderRadius="8px"
            px="8px"
            py="2px"
            h="28px"
            fontSize="sm"
            fontWeight="normal"
            lineHeight="20px"
            letterSpacing="0"
          >
            {'{{'}
            {variable.key}
            {'}}'}
          </Tag>
        ))}
      </Flex>

      {/* Статистика */}
      <Box>
        <Text
          fontSize="sm"
          fontWeight="medium"
          lineHeight="20px"
          letterSpacing="0"
          color="#A1A1AA"
        >
          Использован {template.usageCount ?? 0} раз
        </Text>
        <Text
          fontSize="sm"
          fontWeight="medium"
          lineHeight="20px"
          letterSpacing="0"
          color="#A1A1AA"
        >
          Изменен {template.updatedAt ?? '—'}
        </Text>
      </Box>

      {/* Разделительная линия */}
      <Box
        w="100%"
        h="0.5px"
        bg="#A1A1AA"
        opacity={0.3}
      />

      {/* Кнопка "Использовать" — прижата к низу */}
      <Flex
        justify="flex-end"
        mt="auto"
      >
        <Button
          variant="outline"
          borderColor="#2D547B"
          borderWidth="1px"
          color="#2D547B"
          borderRadius="8px"
          h="44px"
          w="152px"
          fontSize="md"
          fontWeight="500"
          lineHeight="24px"
          letterSpacing="0"
          px="20px"
          py="10px"
          bg="transparent"
          _hover={{
            bg: '#E2EBF3',
            borderColor: '#2D547B'
          }}
          onClick={() => onUseTemplate(template)}
        >
          Использовать
        </Button>
      </Flex>
    </Box>
  );
};

export default TemplateCard;
