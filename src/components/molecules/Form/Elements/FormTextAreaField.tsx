import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text
} from '@chakra-ui/react';
import { memo, useId } from 'react';

import CustomTextarea from '@/components/atoms/TextArea/CustomTextArea';
import { countMeaningfulLength } from '@/utils/meaningfulLength';

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
  maxLengthMessage = 'Превышено количество знаков. Уберите лишние, чтобы отправить.',
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
  const lengthError =
    softMaxLength &&
    maxLength !== undefined &&
    typeof value === 'string' &&
    countMeaningfulLength(value) > maxLength
      ? maxLengthMessage
      : undefined;
  const displayedError = error ?? lengthError;

  const fieldControlProps: FormTextAreaFieldControlProps<T> = {
    value,
    error: displayedError,
    onChange: (nextValue) => onChange(nextValue),
    onBlur,
    labelId,
    controlProps: {
      ...rest,
      borderColor: displayedError ? 'red.500' : 'inherit',
      _hover: { borderColor: displayedError ? 'red.500' : '#3182ce' },
      _focusVisible: {
        borderColor: displayedError ? 'red.500' : '#3182ce'
      }
    }
  };

  return (
    <FormControl isInvalid={Boolean(displayedError)}>
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
          borderColor={displayedError ? 'red.500' : 'inherit'}
          _hover={{ borderColor: displayedError ? 'red.500' : '#3182ce' }}
          _focusVisible={{
            borderColor: displayedError ? 'red.500' : '#3182ce'
          }}
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
      {!displayedError && subTitlte && (
        <Text
          mt={2}
          color="gray.600"
          fontSize="xs"
        >
          {subTitlte}
        </Text>
      )}
      {displayedError && (
        <FormErrorMessage
          mt={2}
          color="red.500"
          fontSize="xs"
        >
          {displayedError}
        </FormErrorMessage>
      )}
    </FormControl>
  );
}

export const FormTextAreaField = memo(
  FormTextAreaFieldBase
) as typeof FormTextAreaFieldBase;
