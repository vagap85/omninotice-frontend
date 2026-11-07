import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text
} from '@chakra-ui/react';
import { memo, useId } from 'react';

import CustomTextarea from '@/components/atoms/TextArea/CustomTextArea';

import type {
  FormTextAreaFieldControlProps,
  FormTextAreaFieldProps,
  Validator
} from '../../types/form';
import { useFormField } from '../hooks/useFormField';
import { maxLength as maxLengthValidator } from '../validators/validators';

function FormTextAreaFieldBase<T = string>({
  name,
  label,
  initialValue,
  validators,
  subTitlte,
  maxLength,
  softMaxLength = false,
  renderControl,
  ...rest
}: FormTextAreaFieldProps<T>) {
  const id = useId();
  const labelId = `${id}-label`;
  const allValidators: Validator<T>[] = [...(validators ?? [])];
  if (maxLength && !softMaxLength) {
    const validateMaxLength = maxLengthValidator(maxLength);
    allValidators.push((value, allValues) =>
      typeof value === 'string'
        ? validateMaxLength(value, allValues)
        : undefined
    );
  }

  const { value, error, onChange, onBlur } = useFormField<T>(name, {
    initialValue,
    validators: allValidators
    // validateOnChange больше не нужен — immediate-логика теперь в самих валидаторах
  });

  const fieldControlProps: FormTextAreaFieldControlProps<T> = {
    value,
    error,
    onChange: (nextValue) => onChange(nextValue),
    onBlur,
    labelId,
    controlProps: {
      ...rest,
      borderColor: error ? 'red.500' : 'inherit',
      _hover: { borderColor: error ? 'red.500' : '#3182ce' },
      _focusVisible: { borderColor: error ? 'red.500' : '#3182ce' }
    }
  };

  return (
    <FormControl isInvalid={Boolean(error)}>
      {label && (
        <FormLabel
          id={labelId}
          fontSize={'18px'}
          width={'fit-content'}
        >
          {label}
        </FormLabel>
      )}
      {renderControl ? (
        renderControl(fieldControlProps)
      ) : typeof value === 'string' ? (
        <CustomTextarea
          borderColor={error ? 'red.500' : 'inherit'}
          _hover={{ borderColor: error ? 'red.500' : '#3182ce' }}
          _focusVisible={{ borderColor: error ? 'red.500' : '#3182ce' }}
          maxLength={maxLength}
          softMaxLength={softMaxLength}
          value={value}
          onChange={(event) => onChange(event)}
          onBlur={onBlur}
          {...rest}
        />
      ) : (
        (() => {
          throw new Error(
            `Для поля «${name}» необходимо указать renderControl.`
          );
        })()
      )}
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

export const FormTextAreaField = memo(
  FormTextAreaFieldBase
) as typeof FormTextAreaFieldBase;
