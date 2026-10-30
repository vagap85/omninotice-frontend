import { Box, Flex, Heading } from '@chakra-ui/react';

import ImproveTextButton from '@/components/molecules/ImproveTextButton/ImproveTextButton';
import TelegramMessageEditor from '@/components/molecules/TelegramMessageEditor/TelegramMessageEditor';

export const TelegramContentFields = () => {
  return (
    <Box
      as="fieldset"
      bg="white"
      borderRadius="10px"
      p={6}
    >
      <Heading
        fontSize="26px"
        lineHeight="32px"
        fontWeight="600"
        color="#12233F"
        mb={4}
      >
        Содержимое сообщения
      </Heading>
      <TelegramMessageEditor
        name="message"
        label="Текст сообщения"
        placeholder="Введите текст сообщения"
      />
      <Flex
        justify="flex-end"
        mt={3}
      >
        <ImproveTextButton onClick={() => {}} />
      </Flex>
    </Box>
  );
};
