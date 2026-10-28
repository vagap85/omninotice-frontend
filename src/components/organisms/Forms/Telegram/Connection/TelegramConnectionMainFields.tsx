import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { required } from '@/components/molecules/Form/validators/validators';
import { Box, Flex, Heading } from '@chakra-ui/react';

export default function TelegramConnectionMainFields() {
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
        Информация о боте
      </Heading>
      <Flex
        direction={'column'}
        gap={3}
      >
        <FormTextField
          name="title"
          label="Название бота"
          placeholder="Например, Кловери.Старт"
          validators={[required()]}
        />
        <FormTextField
          name="purpose"
          label="Назначение бота"
          subTitlte="Видно только в кабинете. Получателям не показывается"
          placeholder="Например, Рекламная рассылка"
          validators={[required()]}
        />
      </Flex>
    </Box>
  );
}
