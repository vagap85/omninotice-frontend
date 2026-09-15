import { memo } from 'react';
import { Box, Button, Heading, HStack } from '@chakra-ui/react';
import { LuSparkles } from 'react-icons/lu';
import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { FormTextAreaField } from '@/components/molecules/Form/Elements/FormTextAreaField';
import { required } from '@/components/molecules/Form/validators/validators';

function NotifContSectTest() {
  return (
    <Box
      as='fieldset'
      bg="white"
      borderRadius="10px"
      p={6}
    >
      <Heading fontSize="26px" lineHeight="32px" fontWeight="600" color="#12233F" mb={4}>
        Текст уведомления
      </Heading>

      <FormTextField
        name="title"
        label="Заголовок уведомления"
        placeholder="Например, Вам назначена задача"
        maxLength={19}
        subTitlte="Отображается первой строкой в ленте уведомлений более крупно и заметно"
        validators={[required()]}
      />

      <Box mt={4}>
        <FormTextAreaField
          name="text"
          label="Текст уведомления"
          placeholder="Введите текст уведомления"
          minH="155px"
          maxLength={155}
          validators={[required()]}
        />
      </Box>

      <HStack justify="flex-end" mt={4}>
        <Button
          variant="accent"
          leftIcon={<LuSparkles />}
          color="white"
          borderRadius="12px"
          h="40px"
          px={6}
          loadingText="Обработка..."
          disabled
        >
          Улучшить текст
        </Button>
      </HStack>
    </Box>
  );
}

export default memo(NotifContSectTest);