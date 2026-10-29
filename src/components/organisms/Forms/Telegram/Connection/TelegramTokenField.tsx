import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { required } from '@/components/molecules/Form/validators/validators';
import { Box, Heading } from '@chakra-ui/react';

export default function TelegramTokenField() {
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
        Токен
      </Heading>
      <FormTextField
        name="bot-token"
        label="Вставьте токен из @BotFather"
        placeholder="7284::AAF••••••••••••••••••••••"
        validators={[required()]}
      />
    </Box>
  );
}
