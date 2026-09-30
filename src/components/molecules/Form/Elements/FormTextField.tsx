import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text
} from '@chakra-ui/react';
import { memo } from 'react';

import CustomInput from '@/components/atoms/Input/CustomInput';
import { truncateByMeaningfulLength } from '@/utils/meaningfulLength';

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
    validators: allValidators
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (maxLength !== undefined) {
      const truncated = truncateByMeaningfulLength(e.target.value, maxLength);
      if (truncated !== e.target.value) {
        e.target.value = truncated;
      }
    }
    onChange(e);
  };

  return (
    <FormControl isInvalid={Boolean(error)}>
      {label && (
        <FormLabel
          fontSize={'18px'}
          width={'fit-content'}
        >
          {label}
        </FormLabel>
      )}
      <CustomInput
        borderColor={error ? 'red.500' : 'inherit'}
        _hover={{ borderColor: error ? 'red.500' : '#3182ce' }}
        _focusVisible={{ borderColor: error ? 'red.500' : '#3182ce' }}
        {...rest}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        maxLength={maxLength}
      />
      {!error && subTitlte && (
        <Text
          mt={2}
          color="gray.600"
          fontSize="xs"
        >
          {subTitlte}
        </Text>
      )}
      {error && (
        <FormErrorMessage
          mt={2}
          color="red.500"
          fontSize="xs"
        >
          {error}
        </FormErrorMessage>
      )}
    </FormControl>
  );
}

export const FormTextField = memo(FormTextFieldBase);
