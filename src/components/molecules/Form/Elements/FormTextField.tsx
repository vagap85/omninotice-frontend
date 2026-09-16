import { FormControl, FormErrorMessage, FormLabel, Text } from '@chakra-ui/react';
import { memo } from 'react';


import CustomInput from '@/components/atoms/Input/CustomInput';

import { FormTextFieldProps } from '../../types/form';
import { useFormField } from '../hooks/useFormField';
import { maxLength as maxLengthValidator } from '../validators/validators';

function FormTextFieldBase({
  name,
  label,
  initialValue,
  validators,
  subTitlte,
  maxLength,
  ...rest
}: FormTextFieldProps) {
  const allValidators = maxLength
    ? [...(validators ?? []), maxLengthValidator(maxLength)]
    : validators;

  const { value, error, onChange, onBlur } = useFormField<string>(name, {
    initialValue,
    validators: allValidators,
  });

  return (
    <FormControl isInvalid={Boolean(error)}>
      {label && <FormLabel fontSize={"18px"} width={"fit-content"}>{label}</FormLabel>}
      <CustomInput
        borderColor={error ? "red.500" : "inherit"}
        _hover={{ borderColor: error ? "red.500" : "#3182ce" }}
        _focusVisible={{ borderColor: error ? "red.500" : "#3182ce" }}
        {...rest}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
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

export const FormTextField = memo(FormTextFieldBase);