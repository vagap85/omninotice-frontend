import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text
} from '@chakra-ui/react';
import { memo, type ReactNode } from 'react';

import CustomInput from '@/components/atoms/Input/CustomInput';
import {
  countMeaningfulLength,
  truncateByMeaningfulLength
} from '@/utils/meaningfulLength';

import { FormTextFieldProps } from '../../types/form';
import { useFormField } from '../hooks/useFormField';
import { maxLength as maxLengthValidator } from '../validators/validators';

type FormTextFieldWithRightElementProps = FormTextFieldProps & {
  rightElement?: ReactNode;
};

function FormTextFieldBase({
  name,
  label,
  labelFontSize = '18px',
  initialValue,
  validators,
  subTitlte,
  maxLength,
  softMaxLength = false,
  maxLengthMessage = 'Превышено количество знаков. Уберите лишние, чтобы отправить.',
  rightElement,
  ...rest
}: FormTextFieldWithRightElementProps) {
  const allValidators =
    maxLength && !softMaxLength
      ? [...(validators ?? []), maxLengthValidator(maxLength)]
      : validators;

  const { value, error, onChange, onBlur } = useFormField<string>(name, {
    initialValue,
    validators: allValidators
  });
  const lengthError =
    softMaxLength &&
    maxLength !== undefined &&
    countMeaningfulLength(value) > maxLength
      ? maxLengthMessage
      : undefined;
  const displayedError = error ?? lengthError;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (maxLength !== undefined && !softMaxLength) {
      const truncated = truncateByMeaningfulLength(e.target.value, maxLength);
      if (truncated !== e.target.value) {
        e.target.value = truncated;
      }
    }
    onChange(e);
  };

  const hasCounter =
    rest.showCounter !== false && typeof maxLength === 'number';
  const input = (
    <CustomInput
      borderColor={displayedError ? 'red.500' : 'inherit'}
      _hover={{ borderColor: displayedError ? 'red.500' : '#3182ce' }}
      _focusVisible={{
        borderColor: displayedError ? 'red.500' : '#3182ce'
      }}
      {...rest}
      pr={rightElement ? (hasCounter ? '120px' : '48px') : rest.pr}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      maxLength={maxLength}
      softMaxLength={softMaxLength}
    />
  );

  return (
    <FormControl isInvalid={Boolean(displayedError)}>
      {label && (
        <FormLabel
          fontSize={labelFontSize}
          width={'fit-content'}
        >
          {label}
        </FormLabel>
      )}
      {rightElement ? (
        <Box position="relative">
          {input}
          <Box
            position="absolute"
            top={0}
            right={hasCounter ? '72px' : 0}
            zIndex={1}
            h="44px"
            w="48px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {rightElement}
          </Box>
        </Box>
      ) : (
        input
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

export const FormTextField = memo(FormTextFieldBase);
