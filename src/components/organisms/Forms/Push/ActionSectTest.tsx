import { memo } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { httpUrl } from '@/components/molecules/Form/validators/validators';

function ActionSectTest() {
  return (
    <Box as='fieldset' bg="white" borderRadius="10px" p={6}>
      <Heading fontSize="26px" lineHeight="32px" fontWeight="600" color="#12233F" mb={4}>
        Действие
      </Heading>

      <FormTextField
        name="buttonText"
        label="Текст кнопки"
        placeholder="Например, перейти на сайт"
        maxLength={18}
        subTitlte="Кнопка в конце письма с призывом к действию"
      />

      <Box mt={4}>
        <FormTextField
          name="buttonLink"
          label="Ссылка для кнопки"
          placeholder="Вставьте ссылку"
          validators={[httpUrl("Проверьте ссылку и укажите валидный URL в формате http(s)://...")]}
        />
      </Box>
    </Box>
  );
}

export default memo(ActionSectTest);