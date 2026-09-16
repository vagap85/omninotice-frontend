import { FormControl, FormErrorMessage, FormLabel, Text } from '@chakra-ui/react';
import { memo } from 'react';

import CustomTextarea from '@/components/atoms/TextArea/CustomTextArea';

import type { FormTextAreaFieldProps } from '../../types/form';
import { useFormField } from '../hooks/useFormField';
import { maxLength as maxLengthValidator } from '../validators/validators';

function FormTextAreaFieldBase({
  name,
  label,
  initialValue,
  validators,
  subTitlte,
  maxLength,
  ...rest
}: FormTextAreaFieldProps) {
  const allValidators = maxLength
    ? [...(validators ?? []), maxLengthValidator(maxLength)]
    : validators;

  const { value, error, onChange, onBlur } = useFormField<string>(name, {
    initialValue,
    validators: allValidators,
    // validateOnChange больше не нужен — immediate-логика теперь в самих валидаторах
  });

  return (
    <FormControl isInvalid={Boolean(error)}>
      {label && <FormLabel fontSize={"18px"} width={"fit-content"}>{label}</FormLabel>}
      <CustomTextarea
        borderColor={error ? "red.500" : "inherit"}
        _hover={{ borderColor: error ? "red.500" : "#3182ce" }}
        _focusVisible={{ borderColor: error ? "red.500" : "#3182ce" }}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        {...rest}
      />
      {!error && subTitlte && (
        <Text mt={2} color="gray.600" fontSize="xs">
          {subTitlte}
        </Text>
      )}
      {error && (
        <FormErrorMessage mt={2} color="red.500" fontSize="xs">
          {error}
        </FormErrorMessage>
      )}
    </FormControl>
  );
}

export const FormTextAreaField = memo(FormTextAreaFieldBase);