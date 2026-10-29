import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { httpUrl } from '@/components/molecules/Form/validators/validators';
import type { Validator } from '@/components/molecules/types/form';
import { Box, Heading } from '@chakra-ui/react';

const actionPairValidator: Validator<string> = (_value, allValues) => {
  const buttonText =
    typeof allValues.buttonText === 'string'
      ? allValues.buttonText.trim()
      : '';
  const buttonLink =
    typeof allValues.buttonLink === 'string'
      ? allValues.buttonLink.trim()
      : '';

  return Boolean(buttonText) === Boolean(buttonLink)
    ? undefined
    : 'Текст кнопки и ссылка заполняются вместе — добавьте оба поля или очистите оба';
};

export default function TelegramActionFields() {
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
        Действие
      </Heading>

      <FormTextField
        name="buttonText"
        label="Текст кнопки"
        placeholder="Например, перейти на сайт"
        subTitlte="Кнопка с призывом к действию"
        validators={[actionPairValidator]}
      />

      <Box mt={4}>
        <FormTextField
          name="buttonLink"
          label="Ссылка для перехода"
          placeholder="Вставьте ссылку"
          validators={[
            actionPairValidator,
            httpUrl(
              'Проверьте ссылку и укажите валидный URL в формате http(s)://...'
            )
          ]}
        />
      </Box>
    </Box>
  );
}
