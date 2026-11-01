import { Button, Stack, Text } from '@chakra-ui/react';
import { memo, useCallback } from 'react';
import type { KeyboardEvent } from 'react';

import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { useFormSelector } from '@/components/molecules/Form/hooks/useFormValues';
import { required } from '@/components/molecules/Form/validators/validators';

const hasRequiredProfileField = (values: { firstName?: string }) =>
  Boolean(values.firstName?.trim());

type AboutYourselfFormProps = {
  isLoading: boolean;
  generalError: string;
  onSubmit: () => void;
};

export const AboutYourselfForm = memo(function AboutYourselfForm({
  isLoading,
  generalError,
  onSubmit
}: AboutYourselfFormProps) {
  const handleEnter = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') onSubmit();
    },
    [onSubmit]
  );
  const isFilled = useFormSelector('aboutYourself', hasRequiredProfileField);
  return (
    <>
      <Text
        fontSize="20px"
        fontWeight="700"
        color="#12233F"
        textAlign="center"
        mb={6}
      >
        Пожалуйста, расскажите о себе
      </Text>
      <Stack spacing={5}>
        <FormTextField
          name="firstName"
          label={
            <>
              Имя{' '}
              <Text
                as="span"
                color="#EF4444"
              >
                *
              </Text>
            </>
          }
          labelFontSize="14px"
          h="48px"
          bg="#F8FAFC"
          borderRadius="10px"
          placeholder=""
          validators={[required('Введите имя')]}
          onKeyDown={handleEnter}
        />
        <FormTextField
          name="lastName"
          label="Фамилия"
          labelFontSize="14px"
          h="48px"
          bg="#F8FAFC"
          borderRadius="10px"
          placeholder=""
          onKeyDown={handleEnter}
        />
        <FormTextField
          name="position"
          label="Должность"
          labelFontSize="14px"
          h="48px"
          bg="#F8FAFC"
          borderRadius="10px"
          placeholder="Например, Маркетолог"
          onKeyDown={handleEnter}
        />
        <FormTextField
          name="phone"
          label="Номер телефона"
          labelFontSize="14px"
          h="48px"
          bg="#F8FAFC"
          borderRadius="10px"
          placeholder="+7 999 999 99 99"
          subTitlte="Код страны и номер"
          onKeyDown={handleEnter}
        />

        {generalError && (
          <Text
            color="#EF4444"
            fontSize="13px"
            textAlign="center"
          >
            {generalError}
          </Text>
        )}

        <Button
          w="100%"
          h="49px"
          mt={2}
          borderRadius="12px"
          bg="#3B6EA0"
          maxW="none"
          _hover={{ bg: '#2D547B' }}
          color="#FAFAFA"
          fontSize="16px"
          fontWeight="500"
          onClick={onSubmit}
          isLoading={isLoading}
          loadingText="Сохраняем данные..."
          opacity={isFilled ? 1 : 0.5}
          disabled={!isFilled}
        >
          Сохранить данные
        </Button>
      </Stack>
    </>
  );
});
