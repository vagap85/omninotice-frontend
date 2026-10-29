import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { required } from '@/components/molecules/Form/validators/validators';
import { Box, Flex, Heading } from '@chakra-ui/react';

export default function TelegramMainFields() {
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
        Информация о рассылке
      </Heading>
      <Flex direction={"column"} gap={3}>
        <FormTextField
          name="title"
          label="Название рассылки"
          subTitlte="Не отображается в отправлении, видно только вам в истории рассылок."
          placeholder="Например, Осенняя распродажа"
          validators={[required("Заполните название рассылки, так вам удобнее будет найти ее в истории рассылок")]}
        />
        <FormTextField
          name="purpose"
          label="Назначение рассылки"
          subTitlte="Не отображается в отправлении, видно только вам в истории рассылок."
          placeholder="Например, Рекламная кампания ноябрь 2026"
          validators={[required("Заполните назначение рассылки, так вам удобнее будет найти ее в истории рассылок")]}
        />
      </Flex>
    </Box>
  );
}
